# 04 · Publicar en Vercel

## Por qué Vercel y no Replit

Replit **no tiene una API** que permita subirle archivos desde afuera: para actualizar un HTML hay que entrar y hacerlo a mano ahí adentro. Vercel sí, y además se conecta directo a GitHub. Por eso el camino estándar quedó así:

> **repo privado en GitHub → proyecto en Vercel → cada push redeploya solo.**

Una vez enlazado, el flujo de todos los días es: *"cambiá esto y subilo"* → Claude lo sube → en menos de 5 minutos está online. Nadie entra a ningún panel.

## Enlazar un repo con Vercel (una sola vez por proyecto)

1. vercel.com → **Add New…** → **Project**.
2. **Import Git Repository**. La primera vez pide **instalar** la app de Vercel en GitHub: darle **Install** y el permiso a la cuenta (se abre una ventanita aparte).
3. Aparece la lista de repos → elegir el que corresponde → **Deploy**.
4. Listo: el proyecto queda con el repo enlazado. Se ve en la pantalla del proyecto ("connected to <usuario>/<repo>").

Vercel da de entrada un dominio de prueba (`<proyecto>.vercel.app`) que sirve para chequear que se ve bien antes de conectar el dominio real.

## Los tres problemas que aparecieron y cómo se resuelven

### 1. El archivo tiene que llamarse `index.html`
Si el HTML se llama `propuesta.html`, `demo-v2.html` o cualquier otra cosa, **Vercel no muestra nada** en la raíz. El archivo principal va en la raíz del repo y se llama `index.html`. Los demás pueden tener cualquier nombre y se acceden por su ruta.

### 2. "Blocked" / el deploy no arranca
Vercel **no acepta el deploy si los commits vienen firmados con una cuenta de GitHub distinta** a la del dueño del proyecto. Pasa cuando la computadora tiene configurado el mail de otra persona. Se verifica y se corrige:

```bash
git config user.email          # ¿qué mail está firmando?
git config user.name
git config user.email "scastro@chimpancedigital.com.ar"
git config user.name "Santiago Castro"
```

Los commits ya hechos con el mail equivocado siguen firmados así: se hace un commit nuevo con la cuenta correcta y con eso destraba.

### 3. Git muestra el HTML como código, no como página
Es normal: GitHub no renderiza HTML, muestra el código fuente. **No hay que activar GitHub Pages** — eso agrega un lugar más donde el sitio existe, con otra URL y otro estado. El render lo da Vercel y punto.

## Un proyecto por ambiente

Vercel deja elegir **a qué rama escucha cada proyecto**. Eso es lo que permite tener ambiente de prueba y producción sin mezclar:

| Proyecto en Vercel | Rama | Para qué |
|---|---|---|
| `proyecto-dev` | rama de desarrollo | probar antes de que lo vea el cliente |
| `proyecto` | `main` | producción |

Se configura en el proyecto → **Settings** → **Git** → *Production Branch*.

Para HTMLs sueltos (una propuesta, una demo, un one-pager) no hace falta: alcanza con un proyecto apuntando a `main`.

## Verificar que salió

Después de subir:
1. Vercel → proyecto → pestaña **Deployments**: el de arriba tiene que decir **Ready**. Si dice **Error**, se abre y se lee el log (casi siempre falta un archivo o hay un error de build).
2. Abrir la URL y mirar que efectivamente esté el cambio. No reportar "subido" sin haberlo mirado.

## Qué decirle a Santiago

> Subido. Vercel ya lo redeployó, está online en <URL>. Los próximos cambios impactan solos en un par de minutos: no hace falta entrar a ningún lado.
