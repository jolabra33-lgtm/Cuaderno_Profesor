# Geografía e Historia · Evaluación, Corrector y Tutoría

Este repositorio contiene dos aplicaciones web independientes, pensadas para
usarse desde el iPad como si fueran apps nativas (sin tienda de aplicaciones,
sin cuenta, sin conexión a ningún servidor: todos los datos se quedan en el
propio iPad).

## Contenido

```
index.html              → Evaluación por Competencias + Corrector de Exámenes (hub principal)
guia.html               → guía de uso (también enlazada desde el Inicio de la app)
manifest.json           → metadatos e icono de la app principal
icons/                  → iconos de la app principal (32, 180, 192, 512 px)
sw.js                   → Service Worker (funcionamiento sin conexión vía GitHub Pages)
tutoria/
  index.html            → Gestor de Tutoría (aplicación independiente, sus propios datos)
  manifest.json         → metadatos e icono del Gestor de Tutoría
  icon-192.png / icon-512.png
  vendor/
    LEEME.txt           → cómo descargar Chart.js y pdf.js para uso 100% offline
.nojekyll                → evita que GitHub procese el sitio como Jekyll
README.md                → este archivo
```

Las dos aplicaciones **no comparten alumnado ni notas**. El hub principal
enlaza a Tutoría solo como acceso rápido.

## 0. Si en el PC vas a usar el archivo local (sin GitHub)

Estos mismos archivos funcionan igual haciendo doble clic en `index.html`,
sin subir nada a ningún sitio:

- El hub (Evaluación y Corrector) funciona siempre offline: no depende de
  nada externo.
- `tutoria/index.html` también funciona offline en todo excepto los gráficos
  y la vista previa de PDF, **a menos que descargues las 3 librerías**
  indicadas en `tutoria/vendor/LEEME.txt` (dos minutos, una sola vez). Una
  vez descargadas y colocadas ahí, esas dos funciones también trabajan sin
  conexión, tanto en el PC como en GitHub Pages.
- El Service Worker (`sw.js`) **no se activa** al abrir el archivo suelto
  (los navegadores no lo permiten en `file://`), pero no hace falta: en
  local, ninguno de los dos archivos depende ya de él para funcionar sin
  wifi — solo lo necesitas si accedes por la URL de GitHub Pages.

Si NO vas a subir esto a GitHub, puedes ignorar los pasos 1 y 2 de abajo.

## 1. Subir esto a GitHub

**Opción sencilla (web, sin usar la terminal):**

1. Crea un repositorio nuevo en [github.com](https://github.com/new) (público
   o privado, ambos funcionan con GitHub Pages).
2. Entra en el repo → **Add file → Upload files**.
3. Arrastra **todo el contenido de esta carpeta** (no la carpeta en sí, su
   contenido) directamente a la raíz del repositorio: `index.html`,
   `manifest.json`, `icons/`, `tutoria/`, `.nojekyll`.
4. Confirma el commit ("Commit changes").

**Opción con git:**

```bash
git init
git add .
git commit -m "Primera versión"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
git push -u origin main
```

## 2. Activar GitHub Pages

1. En el repositorio, ve a **Settings → Pages**.
2. En "Build and deployment" → **Source**, elige **Deploy from a branch**.
3. En **Branch**, elige `main` y la carpeta **/ (root)**. Guarda.
4. Espera uno o dos minutos. GitHub mostrará la URL pública, con esta forma:
   `https://TU-USUARIO.github.io/TU-REPOSITORIO/`

   (Truco: si nombras el repositorio exactamente `TU-USUARIO.github.io`,
   la app queda en `https://TU-USUARIO.github.io/` sin la parte del nombre
   del repositorio. No es necesario, pero da una URL más corta.)

## 3. Añadirla a la pantalla de inicio del iPad

Tiene que hacerse **desde Safari** (Chrome en iPad no permite crear un icono
con su propio nombre e icono):

1. Abre la URL de GitHub Pages en Safari.
2. Toca el icono de compartir (el cuadrado con la flecha hacia arriba).
3. Toca **"Añadir a la pantalla de inicio"**.
4. Confirma el nombre ("Eval. y Corrector") y toca **Añadir**.

Para tener también un icono aparte del Gestor de Tutoría (con su propio
icono azul): dentro de la app, en la tarjeta "Gestor de Tutoría" → Abrir, y
una vez ahí repite los mismos pasos de "Añadir a la pantalla de inicio".

Al abrir el icono desde la pantalla de inicio, se abre a pantalla completa,
sin la barra de direcciones de Safari — como una app normal.

## 4. Funciona sin wifi (offline)

Dos mecanismos, uno por cada escenario:

- **Librerías vendorizadas** (`tutoria/vendor/`): sigue `tutoria/vendor/LEEME.txt`
  para descargar Chart.js y pdf.js una vez y guardarlos ahí. Esto hace que
  Tutoría no dependa de internet **nunca**, ni en local ni en GitHub Pages.
  Sin este paso, Tutoría funciona igualmente sin conexión, salvo los
  gráficos y la vista previa de PDF.
- **Service Worker** (`sw.js`, solo aplica si accedes por GitHub Pages/http,
  no al abrir el archivo suelto): la primera vez que abras cada app con
  conexión, guarda en caché todos sus archivos (incluidas las librerías
  vendorizadas, si ya las has descargado). A partir de ahí, se puede abrir
  sin conexión — incluso en modo avión — tanto desde el navegador como desde
  el icono de la pantalla de inicio.
- Si en el futuro subes una versión nueva de algún archivo, cambia también
  el número de versión en la primera línea útil de `sw.js`
  (`CACHE_NAME = 'geohist-suite-v1'` → `'geohist-suite-v2'`, etc.) para que
  se descargue la versión nueva en vez de seguir sirviendo la guardada.
- Esto no afecta a tus datos: los grupos, alumnado y notas siempre se
  guardan aparte (en `localStorage`), independientemente de esta caché.

## Cosas importantes que conviene saber

- **Los datos no salen del dispositivo.** Se guardan en el almacenamiento
  local del navegador (`localStorage`), no en GitHub ni en ningún servidor.
  Nadie más tiene acceso a ellos.
- **Exporta copias de seguridad con regularidad.** La propia app te avisa
  ("Conviene exportar copia…") si llevas tiempo sin hacerlo. Usa "Exportar
  copia" y guarda el archivo `.json` donde prefieras.
- **Actualizar la app en el futuro** es tan sencillo como sustituir los
  archivos que cambien (localmente, o en el repositorio si usas GitHub
  Pages). Los datos guardados no se ven afectados por actualizar archivos.
- Aunque viven en carpetas distintas, `index.html` y `tutoria/index.html`
  comparten el mismo origen cuando se sirven desde GitHub Pages
  (`tu-usuario.github.io`), así que técnicamente usan el mismo
  almacenamiento del navegador — pero cada una guarda sus datos bajo claves
  distintas, así que no hay conflicto entre ellas.

