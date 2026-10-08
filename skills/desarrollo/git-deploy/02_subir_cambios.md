# 02 · Subir cambios, traer los del otro y resolver conflictos

## Qué significa "subilo prolijo"

Prolijo no es "que funcione". Es que **cualquiera pueda entender después qué pasó**:

- **Un commit = un cambio con sentido.** No un commit gigante con todo lo de la semana, ni veinte commits de "ajustes".
- **Mensaje en criollo**, diciendo qué cambió y para qué. Sin jerga innecesaria.
- **Archivos agregados por nombre.** Nunca `git add -A` ni `git add .`: así es como se cuela un `.env`.
- **Nada de secretos.** Ninguna clave, token, certificado o `.env` entra al repo (van a `Chimpa2026/_secretos-fuera-del-repo/`). Si el repo se sube a GitHub, asumir que alguien lo va a leer.

```bash
git status                      # ver qué cambió
git add ruta/al/archivo.tsx otro/archivo.css
git commit -m "Mapa: permitir arrastrar los nodos y guardar la posición"
git push
```

### Antes de cada commit, revisar que no se cuele nada

```bash
git status --short
git diff --cached --stat
```

Si aparece algo con pinta de `.env`, `*.pem`, `*.key`, `credentials`, `secret` o una carpeta de configuración local, se saca y se agrega al `.gitignore`.

## Traer lo que hizo el otro

Siempre, antes de empezar y antes de subir:

```bash
git pull
```

Si Git dice que hay que juntar historias divergentes, la forma más limpia en un equipo chico:

```bash
git pull --rebase
```

## Conflictos: qué son y cómo se resuelven

Lo que hay que tener claro (y lo que hay que explicarle a quien se asuste): **Git nunca pisa el trabajo de nadie.** Si dos personas tocaron el mismo pedazo del mismo archivo, Git frena y avisa *antes* de subir. El conflicto no es un error: es el aviso.

Cuando aparece:

```bash
git pull
# CONFLICT (content): Merge conflict in client/src/components/Mapa.tsx
```

1. Abrir el archivo. Git marca las dos versiones:

```
<<<<<<< HEAD
   lo que estaba acá (lo que subió el otro)
=======
   lo que trajiste vos
>>>>>>> feat/mapa-interactivo
```

2. **Juntar los dos cambios** para que funcionen las dos cosas. No se elige una y se tira la otra sin entender qué hacía la otra — si no está claro, se pregunta.
3. Borrar las marcas `<<<<<<<`, `=======`, `>>>>>>>`.
4. Cerrar:

```bash
git add client/src/components/Mapa.tsx
git commit
git push
```

5. **Probar que sigue andando** antes de dar por cerrado el conflicto.

### Si el conflicto es grande o no está claro

Se para y se avisa. Un conflicto mal resuelto borra trabajo de otra persona en silencio, que es exactamente lo que este flujo trata de evitar.

## Deshacer sin romper nada

- **Me equivoqué y todavía no subí**: `git restore <archivo>` (descarta cambios locales de ese archivo).
- **Commiteé pero no pusheé**: `git reset --soft HEAD~1` (deshace el commit, deja los cambios).
- **Ya subí y hay que revertir**: `git revert <hash>` — crea un commit que deshace aquel. **Nunca** `git push --force` sobre una rama compartida.

## Comandos a mano en Windows

Si Santiago tiene que correr algo él en la terminal: **PowerShell 5.1 no acepta `&&`**. Se separan con `;`:

```
git add archivo.html; git commit -m "Ajuste de textos"; git push
```

## Qué reportar cuando se termina

Siempre, en una línea: **qué se subió, a qué rama, y si eso ya impacta en algún lado.**

> Subí los cambios del mapa a la rama de desarrollo (3 commits). No toca producción. Si querés verlo andando, el ambiente de prueba se actualiza solo en un par de minutos.
