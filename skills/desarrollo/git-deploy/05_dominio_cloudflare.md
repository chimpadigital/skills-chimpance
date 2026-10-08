# 05 · Conectar un dominio con Cloudflare

Caso típico: *"creá el dominio pepito.manada.me y subí este HTML"*. El HTML ya está en Vercel ([04](04_vercel.md)); falta apuntarle el dominio.

Los dominios de Chimpancé (`manada.me` y compañía) están administrados en **Cloudflare**. Cloudflare pide un código al mail cada vez que se entra, así que el acceso se comparte por **invitación a la cuenta**, no pasándose credenciales.

## El procedimiento, en dos pantallas

### En Vercel
1. Entrar al proyecto → menú lateral izquierdo → **Domains**.
2. **Add** / *añadir dominio existente* → escribir `pepito.manada.me` → agregar.
3. Va a quedar en rojo, con una advertencia de verificación. Abrir el acordeón **View DNS Configuration** (la flechita al lado del cartel rojo).
4. Ahí Vercel muestra **dos registros**: un **CNAME** y un **TXT**, cada uno con su *name* y su *value*. Es copy-paste literal.

### En Cloudflare
5. Entrar a la cuenta → elegir el dominio (`manada.me`) → menú lateral **DNS** → **Records**.
6. **Add record**:
   - **Type**: se elige de una lista (no se escribe) → `CNAME`.
   - **Name**: lo que dio Vercel.
   - **Target**: el valor que dio Vercel.
   - **🟠 La nube naranja: APAGARLA.** Tiene que quedar gris (*DNS only*).
   - **Save**.
7. Repetir con el registro **TXT**.

### Volver a Vercel y esperar
8. En la pantalla de Domains, a los pocos minutos se actualiza solo. Cuando toma los dos registros, Vercel genera el certificado y el dominio queda en verde.

## La nube naranja: el error que hace perder media hora

Si la nube queda **naranja**, Cloudflare se pone de intermediario y captura el tráfico. Vercel lo detecta y avisa **"Proxy detected"**, y **no puede emitir el certificado**: el dominio nunca termina de verificar.

Apagándola (nube gris, *DNS only*), el tráfico va derecho a Vercel y se resuelve solo.

**Regla: para dominios apuntados a Vercel, la nube va siempre gris.**

## Verificar

```bash
nslookup pepito.manada.me
```

Y sobre todo: abrir el dominio en el navegador, confirmar que carga **con candado** (el certificado) y que muestra lo que tiene que mostrar. Recién ahí se reporta.

## Si no anda

| Síntoma | Causa casi segura |
|---|---|
| "Invalid Configuration" en Vercel | Falta uno de los dos registros, o está mal copiado |
| "Proxy detected" | La nube naranja está prendida |
| Carga pero sin candado / error de certificado | Todavía se está emitiendo: esperar unos minutos |
| Carga otra cosa | Hay un registro viejo para ese nombre en Cloudflare: buscarlo con el buscador de arriba y borrarlo |
| Página en blanco | El archivo no se llama `index.html` (ver [04](04_vercel.md)) |

## Se puede automatizar

Tanto Cloudflare como Vercel tienen API y se les puede dar acceso a un agente para que haga todo esto solo. Con Replit no se podía; con Vercel sí. Hoy se hace a mano porque son 5 minutos, pero si empieza a repetirse, vale la pena pedir los tokens y automatizarlo.
