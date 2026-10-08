# 01 · Ramas: cómo se organiza el trabajo

## Por qué hay tres niveles

La idea, tal cual la explicó el CTO: **si se rompe algo, que quede encerrado ahí y no arrastre al resto.**

```
main                      ← producción. Lo que ve el cliente.
 └── <rama de desarrollo>  ← nuestra rama. Versión estable, cosas listas.
      ├── feat/mapa-interactivo
      ├── feat/recupero-contrasena
      └── fix/seguridad-login
```

### `main` — producción
- **No se le manda nada directamente.** `main` *recibe*.
- En proyectos de cliente, muchas veces el pase a `main` lo hace el cliente con su propio protocolo. No es nuestra decisión y no hay que apurarla.
- Claude nunca hace merge ni push a `main` por iniciativa propia. Se pregunta y se espera un "sí, pasalo a producción" para ese cambio puntual.

### La rama de desarrollo compartida — nuestra rama
- Es donde vive **lo que ya está listo pero todavía no salió**. Tiene que poder mostrarse en cualquier momento.
- Es la rama que se conecta al ambiente de prueba (un proyecto de Vercel aparte, un DigitalOcean, lo que use el proyecto), para ver las cosas andando en un servidor real antes de que las vea el cliente.
- **El nombre lo pone el proyecto.** `dev`, `develop`, `staging`, o el nombre que ya haya creado el CTO. Se verifica con `git branch -r` y se usa la que existe.

### Ramas por funcionalidad — donde se trabaja
- Una rama por **cada cosa que se toca**: un módulo, un flujo, una pantalla, una corrección. Incluso "cambiar tres textos" puede tener su rama.
- Nombres: `feat/loquesea` para algo nuevo, `fix/loquesea` para un arreglo. En minúscula y con guiones.
- Se trabaja tranquilo ahí adentro, con todos los commits que hagan falta, y recién cuando **está terminado** se junta con la rama de desarrollo.

## El ciclo completo

```bash
# 1. Antes de empezar: traer todo lo que haya de los demás
git checkout <rama-de-desarrollo>
git pull

# 2. Abrir la rama de esta tarea
git checkout -b feat/mapa-interactivo

# 3. ...trabajar, con los commits que hagan falta...

# 4. Subir la rama para que la vea el otro
git push -u origin feat/mapa-interactivo

# 5. Cuando está listo y probado: juntarla con desarrollo
git checkout <rama-de-desarrollo>
git pull
git merge feat/mapa-interactivo
git push
```

Para el paso 5 también sirve un Pull Request en GitHub, que es lo que deja el historial más claro (`Merge pull request from ...`) y lo que suele usar el CTO. Si el proyecto ya viene trabajando con PRs, se sigue con PRs.

## Cuando el otro prueba y encuentra fallas

Este es el caso concreto que se planteó en la reunión: Santiago arma algo, se lo pasa a Prados, Prados encuentra tres cosas mal.

**Se arregla en la misma rama.** Prados se baja `feat/mapa-interactivo`, corrige, y sube a `feat/mapa-interactivo`. Después Santiago se baja esa misma rama y sigue.

```bash
git checkout feat/mapa-interactivo
git pull          # trae los arreglos del otro
```

Lo que **no** hay que hacer: mandar los archivos corregidos por Slack, abrir `feat/mapa-interactivo-v2`, ni copiar y pegar a mano.

## Repartir el trabajo antes de empezar

Antes de que dos personas se pongan en paralelo, hay una pregunta que ahorra horas:

> **¿Lo que voy a tocar se cruza con lo que va a tocar el otro?**

Ejemplo real de la reunión: los mapas parecían aislados, pero tocaban también la parte de entregables, que era justo lo que estaba haciendo el otro. Eso es un conflicto anunciado.

Si se cruzan, hay dos salidas:
1. **Secuenciar**: primero uno sube lo suyo a la rama de desarrollo, después el otro arranca desde ahí (fue la decisión que tomaron ese día).
2. **Dividir más fino**: que cada uno toque archivos distintos.

## Pasar algo a producción

Cuando Santiago dice "pasalo a producción":

1. Confirmar **qué** exactamente pasa a producción (una funcionalidad, o todo lo que hay en desarrollo).
2. Verificar que la rama de desarrollo esté al día y andando.
3. Merge a `main` (o PR de la rama de desarrollo a `main`, según el proyecto).
4. Avisar qué se subió y, si el deploy es automático, en cuánto impacta.

Si algo de lo que hay en desarrollo **no** tiene que salir todavía, no se pasa el bloque entero: se dice cuál es el problema y se resuelve antes.
