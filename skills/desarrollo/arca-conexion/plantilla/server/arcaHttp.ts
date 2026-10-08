import https from "https";

/**
 * POST SOAP a los servidores de factura electrónica de ARCA.
 *
 * servicios1.afip.gov.ar (wsfe) negocia TLS con una clave Diffie-Hellman chica que el OpenSSL de Node
 * rechaza por defecto ("dh key too small", probado el 16/9/2026). `fetch` no deja bajar el nivel de
 * seguridad por conexión, así que va con `https` y un agente propio con SECLEVEL=1, solo para estos hosts.
 */
const legacyAgent = new https.Agent({ ciphers: "DEFAULT@SECLEVEL=1", keepAlive: true, maxSockets: 4 });

export class ArcaHttpError extends Error {
  constructor(message: string, public code: "TIMEOUT" | "NETWORK" | "HTTP") {
    super(message);
  }
}

export function soapPost(url: string, soapAction: string, body: string, timeoutMs = 30000): Promise<string> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: "POST",
        agent: legacyAgent,
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          SOAPAction: soapAction,
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          // Los SOAP Fault vuelven con 500 y el detalle en el cuerpo: se devuelve igual para leerlo.
          if (res.statusCode && res.statusCode >= 400 && !data.includes("Envelope")) {
            reject(new ArcaHttpError(`ARCA respondió HTTP ${res.statusCode}`, "HTTP"));
            return;
          }
          resolve(data);
        });
      },
    );
    req.setTimeout(timeoutMs, () => req.destroy(new ArcaHttpError("ARCA no respondió a tiempo", "TIMEOUT")));
    req.on("error", (e) => reject(e instanceof ArcaHttpError ? e : new ArcaHttpError(`No se pudo conectar con ARCA: ${e.message}`, "NETWORK")));
    req.end(body);
  });
}
