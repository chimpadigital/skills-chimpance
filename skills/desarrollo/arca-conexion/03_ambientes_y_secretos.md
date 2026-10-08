# 03 · Ambientes y secretos

## Decisión tomada (no volver a discutirla)

| | Padrón (solo lectura) | Factura electrónica |
|---|---|---|
| **Producción** | Certificado de producción | Certificado de producción, **real**. Se habilita solo con la marca `.arca/wsfe-produccion`, que escribe el deploy de `main` |
| **Dev / staging** | **El mismo** certificado de producción: es solo lectura y no tiene riesgo | Certificado de **homologación** (WSASS) contra `wswhomo`. Sin ese certificado, la emisión queda **apagada** con el motivo a la vista |
| **Compu** | Consultas con el script | **Nunca** pedir CAE con el certificado de producción. Con el de homologación, sí |

Historia de por qué: en el ERP se dio vueltas **cuatro veces** con este tema:
1. Hacer un certificado de dev solo para el padrón.
2. Después, no hacerlo.
3. Usar el mismo certificado en todos lados.
4. Hacer el de homologación por WSASS.

La tabla de arriba es el resultado final. Se aplica de entrada.

## El certificado llega al servidor por secretos del CI, no por el `.env`

Esperar a que otra persona cargue un `.env` en el servidor trabó la tarea dos días. En su lugar:

```bash
# Desde la carpeta de los certificados. El dueño del repo tiene permiso.
base64 -w0 empresa-prod.crt       | gh secret set ARCA_CERT_B64      --repo OWNER/REPO
base64 -w0 empresa-arca.key       | gh secret set ARCA_KEY_B64       --repo OWNER/REPO
base64 -w0 empresa-homo.crt       | gh secret set ARCA_HOMO_CERT_B64 --repo OWNER/REPO
base64 -w0 empresa-arca-homo.key  | gh secret set ARCA_HOMO_KEY_B64  --repo OWNER/REPO
gh secret list --repo OWNER/REPO   # verificar (no muestra valores)
```

- Antes de cargar los secretos, **pedirle OK a Santiago**. Es darle a la nube la llave para operar ante ARCA.
- Los pasos del deploy están en [plantilla/deploy-steps.yml](plantilla/deploy-steps.yml). Qué hacen:
  1. **Certificado de ARCA:** si existen los secretos, los pasa por la **entrada estándar de ssh** (nunca en la línea de comandos ni en el log) y los escribe como `$DIR/.arca/cert.pem` y `key.pem`, con `umask 077` y el usuario del servicio. Si no existen, no toca nada.
  2. **Factura electrónica:** si la rama es `main`, crea `$DIR/.arca/wsfe-produccion`. Si es otra rama, **la borra** y, si están los secretos de homologación, escribe `$DIR/.arca/homo/cert.pem` y `key.pem`.
  3. El empaquetado excluye `.arca` y `.arca-cache` (`--exclude`): un release no pisa el certificado ni el ticket cacheado.
- En `.gitignore` van `certs/`, `.arca/` y `.arca-cache/`.

**Ojo con el clasificador de permisos:** un push que cambia el deploy para mandar secretos al servidor puede quedar bloqueado. No se le busca la vuelta. Se deja el commit listo (si hace falta, en un worktree limpio sobre la rama destino) y se le pasa a Santiago **un comando por bloque**:
- `git -C <ruta> fetch origin`
- `git -C <ruta> rebase origin/dev`
- `git -C <ruta> push origin HEAD:dev`

Después se sigue el deploy con `gh run watch` y en el log se busca "Certificado de ARCA actualizado".

## Otros hostings

La idea es la misma en cualquier lado: el certificado va en el gestor de secretos del hosting (Railway, Render o Vercel env, Docker secrets, un vault) y el código lo lee del archivo o de una variable **en base64**. `decodePem` acepta PEM, PEM con `\n` escapados o base64. El candado de producción tiene que depender de algo que **solo** el deploy de producción puede poner, nunca de una variable que alguien pueda copiar a dev por error.

## Vencimientos

Los certificados duran **2 años**. Cuando falten unos 30 días:
1. Nuevo CSR con la **misma** clave, que se sube en el mismo alias ("Agregar certificado" dentro del alias).
2. Nuevo `.crt`.
3. Actualizar el secreto `*_CERT_B64`.
4. Redeploy.

La delegación de los servicios no se toca. Anotar el vencimiento en la memoria del proyecto.
