#!/usr/bin/env bash
# Prueba rápida contra ARCA, SOLO LECTURA (nunca pide CAE). Git Bash (Windows) o Linux.
#
#   arca_smoke.sh <cert.crt> <key.key> <prod|homo> <operación> [args]
#
# Operaciones:
#   login <servicio>                     pide/reusa el ticket WSAA (wsfe | ws_sr_constancia_inscripcion)
#   persona <cuitEmisor> <cuitBuscado>   padrón A5 getPersona_v2 (razón social, IVA, domicilio)
#   ptosventa <cuitEmisor>               FEParamGetPtosVenta: puntos de venta habilitados para web services
#   ultimo <cuitEmisor> <pv> <tipo>      FECompUltimoAutorizado (tipo: 1 FA, 3 NCA, 6 FB, 8 NCB, 11 FC, 13 NCC)
#   consultar <cuitEmisor> <pv> <tipo> <nro>   FECompConsultar: ¿existe ese comprobante y con qué CAE?
#   tipos <cuitEmisor>                   FEParamGetTiposCbte (prueba de que wsfe está delegado)
#
# El ticket (TA) se guarda en $ARCA_SMOKE_DIR (default ./.arca-smoke) y se reusa mientras viva (12 h):
# WSAA puede contestar "ya posee un TA válido" si se pide otro para el mismo certificado + servicio.
# En homologación el <cuitEmisor> es el CUIT que figura en el certificado de WSASS (el de la persona).
set -euo pipefail
CERT="$1"; KEY="$2"; ENV="$3"; OP="$4"; shift 4
DIR="${ARCA_SMOKE_DIR:-./.arca-smoke}"; mkdir -p "$DIR"
if [ "$ENV" = "prod" ]; then
  WSAA=https://wsaa.afip.gov.ar/ws/services/LoginCms
  WSFE=https://servicios1.afip.gov.ar/wsfev1/service.asmx
  PADRON=https://aws.afip.gov.ar/sr-padron/webservices/personaServiceA5
else
  WSAA=https://wsaahomo.afip.gov.ar/ws/services/LoginCms
  WSFE=https://wswhomo.afip.gov.ar/wsfev1/service.asmx
  PADRON=https://awshomo.afip.gov.ar/sr-padron/webservices/personaServiceA5
fi
# wsfe de producción negocia DH chico: con curl+OpenSSL (Linux) hace falta bajar SECLEVEL. Schannel (Windows) no lo necesita.
CURL_TLS=(); curl --version | grep -qi openssl && CURL_TLS=(--ciphers 'DEFAULT@SECLEVEL=1')

xml() { grep -o "<$1>[^<]*" | head -1 | sed "s/<$1>//"; }

ticket() { # $1 = servicio → deja TOKEN y SIGN
  local svc="$1"; local f="$DIR/ta-$ENV-$svc.txt"
  if [ -f "$f" ] && [ "$(( $(date +%s) - $(stat -c %Y "$f") ))" -lt 39600 ]; then
    TOKEN=$(sed -n 1p "$f"); SIGN=$(sed -n 2p "$f"); return
  fi
  local now gen exp
  now=$(date -u +%s)
  gen=$(date -u -d "@$((now-600))" +%Y-%m-%dT%H:%M:%S)-00:00
  exp=$(date -u -d "@$((now+600))" +%Y-%m-%dT%H:%M:%S)-00:00
  printf '<?xml version="1.0" encoding="UTF-8"?><loginTicketRequest version="1.0"><header><uniqueId>%s</uniqueId><generationTime>%s</generationTime><expirationTime>%s</expirationTime></header><service>%s</service></loginTicketRequest>' \
    "$now" "$gen" "$exp" "$svc" > "$DIR/tra.xml"
  openssl cms -sign -in "$DIR/tra.xml" -signer "$CERT" -inkey "$KEY" -nodetach -outform DER -out "$DIR/tra.cms"
  local cms; cms=$(base64 -w0 "$DIR/tra.cms")
  curl -s -m 60 -H 'Content-Type: text/xml; charset=utf-8' -H 'SOAPAction: ""' --data-binary \
    "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:wsaa=\"http://wsaa.view.sua.dvadac.desein.afip.gov\"><soapenv:Header/><soapenv:Body><wsaa:loginCms><wsaa:in0>$cms</wsaa:in0></wsaa:loginCms></soapenv:Body></soapenv:Envelope>" \
    "$WSAA" > "$DIR/wsaa.xml"
  local fault; fault=$(xml faultstring < "$DIR/wsaa.xml" || true)
  if [ -n "$fault" ]; then echo "WSAA rechazó: $fault ($(xml faultcode < "$DIR/wsaa.xml" || true))" >&2; exit 1; fi
  local inner; inner=$(sed -e 's/&lt;/</g' -e 's/&gt;/>/g' -e 's/&quot;/"/g' -e 's/&amp;/\&/g' "$DIR/wsaa.xml")
  TOKEN=$(echo "$inner" | xml token); SIGN=$(echo "$inner" | xml sign)
  [ -n "$TOKEN" ] || { echo "WSAA sin ticket: $(head -c 400 "$DIR/wsaa.xml")" >&2; exit 1; }
  printf '%s\n%s\n' "$TOKEN" "$SIGN" > "$f"
  echo "TA nuevo para $svc, vence $(echo "$inner" | xml expirationTime)" >&2
}

wsfe() { # $1 método, $2 cuit, $3 cuerpo interno
  curl -s -m 60 "${CURL_TLS[@]}" -H 'Content-Type: text/xml; charset=utf-8' -H "SOAPAction: http://ar.gov.afip.dif.FEV1/$1" --data-binary \
    "<soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:ar=\"http://ar.gov.afip.dif.FEV1/\"><soap:Body><ar:$1><ar:Auth><ar:Token>$TOKEN</ar:Token><ar:Sign>$SIGN</ar:Sign><ar:Cuit>$2</ar:Cuit></ar:Auth>$3</ar:$1></soap:Body></soap:Envelope>" \
    "$WSFE" | sed 's/></>\n</g' | grep -E '<(Nro|EmisionTipo|Bloqueado|FchBaja|CbteNro|Resultado|CodAutorizacion|FchVto|ImpTotal|DocNro|CbteFch|Id|Desc|Code|Msg|faultstring)>' | sed 's/^ *//'
}

case "$OP" in
  login) ticket "$1"; echo "OK: ticket para $1" ;;
  persona) ticket ws_sr_constancia_inscripcion
    curl -s -m 60 -H 'Content-Type: text/xml; charset=utf-8' -H 'SOAPAction: ""' --data-binary \
      "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:a5=\"http://a5.soap.ws.server.puc.sr/\"><soapenv:Header/><soapenv:Body><a5:getPersona_v2><token>$TOKEN</token><sign>$SIGN</sign><cuitRepresentada>$1</cuitRepresentada><idPersona>$2</idPersona></a5:getPersona_v2></soapenv:Body></soapenv:Envelope>" \
      "$PADRON" | sed 's/></>\n</g' | grep -E '<(razonSocial|nombre|apellido|estadoClave|direccion|localidad|descripcionProvincia|codPostal|idImpuesto|descripcionImpuesto|error|faultstring)>' | sed 's/^ *//' ;;
  ptosventa) ticket wsfe; wsfe FEParamGetPtosVenta "$1" "" ;;
  tipos)     ticket wsfe; wsfe FEParamGetTiposCbte "$1" "" | grep -c '<Id>' | sed 's/^/tipos de comprobante: /' ;;
  ultimo)    ticket wsfe; wsfe FECompUltimoAutorizado "$1" "<ar:PtoVta>$2</ar:PtoVta><ar:CbteTipo>$3</ar:CbteTipo>" ;;
  consultar) ticket wsfe; wsfe FECompConsultar "$1" "<ar:FeCompConsReq><ar:CbteTipo>$3</ar:CbteTipo><ar:CbteNro>$4</ar:CbteNro><ar:PtoVta>$2</ar:PtoVta></ar:FeCompConsReq>" ;;
  *) echo "Operación desconocida: $OP" >&2; exit 2 ;;
esac
