# 03 · Repos en GitHub

## Crear un repo

**Siempre privado.** Sin excepciones, y más todavía si hay algo de un cliente adentro. Un repo público se indexa y no hay vuelta atrás.

### A mano (Santiago, 4 clics)
1. github.com → foto de perfil arriba a la derecha → **Your repositories**.
2. Botón verde **New**.
3. Nombre (en minúscula y con guiones: `prome-comunidad`, `chb-demo`).
4. Marcar **Private**. → **Create repository**.
5. Copiar la URL y pasársela a Claude: *"subime esto a este repo"*.

### Desde acá
Si la cuenta de GitHub está autenticada en la sesión, Claude crea el repo y sube todo sin que Santiago toque nada. Si falla la autenticación, se avisa y se le pide que lo cree a mano con los pasos de arriba.

```bash
gh repo create <nombre> --private --source=. --remote=origin --push
```

Lo que sube por defecto va a `main`. Si el proyecto necesita rama de desarrollo, se crea después (ver [01](01_ramas.md)).

## Lo que nunca entra al repo

Antes del primer push, revisar que exista un `.gitignore` con al menos:

```
node_modules/
.env
.env.*
*.pem
*.key
*.p12
dist/
build/
.DS_Store
```

Y confirmar a mano:

```bash
git status --short
```

Si ya se subió un secreto por error: **cambiarlo, no borrarlo**. Queda en el historial para siempre; lo único que sirve es revocar esa clave y emitir otra.

## Qué sí conviene que viva en el repo

- El código, obvio.
- **La documentación del proyecto** (los `.md`): es lo que hace que la otra persona y Claude arranquen sabiendo dónde están parados. En la reunión quedó claro que los skills y documentos del proyecto están bien como archivos dentro del repo — así se sincronizan solos entre las dos computadoras.
- El `README` con: qué es, cómo se corre, cuál es la rama de desarrollo y dónde está publicado.

## Ver quién hizo qué

```bash
git log --oneline --graph --all -20     # el mapa de ramas y commits
git log --oneline <rama-desarrollo> -5  # los últimos cambios de la rama compartida
```

En GitHub, lo mismo: entrar a la rama → pestaña **Commits**. Ahí se ve, por ejemplo, `Merge pull request from chimpa-digital/fix-seguridad`, que quiere decir que alguien abrió una rama para un arreglo de seguridad y la juntó con la rama de desarrollo.

## Dar acceso a otra persona

Repo → **Settings** → **Collaborators** → **Add people**. Con eso alcanza para que suba y baje cambios. No hace falta transferir el repo ni compartir contraseñas.
