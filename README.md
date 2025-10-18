# Quiz 3º ESO – Electricidad y Electrónica (Web + Capacitor)

Esta aplicación web permite realizar un cuestionario interactivo sobre Electricidad y Electrónica para alumnos de 3º ESO. Incluye funcionalidades avanzadas como ampliación de imágenes, cambio de tema claro/oscuro, y exportación de resultados.

## Características principales
- **Configuración dinámica**: Carga CURSO, MATERIA, TEMA, PASSWORD y TÍTULO desde `web/config.js`.
- **Carga de preguntas**: Lee el CSV desde `web/assets/preguntas.csv` (separador `;`, multivalor `,`).
- **Interfaz interactiva**: Orden aleatorio de preguntas, feedback inmediato, barra de progreso, botones “Saltar” y “Siguiente”.
- **Evaluación detallada**: Notas globales y por etiqueta (saberes básicos, competencias específicas, criterios de evaluación, descriptores del perfil de salida).
- **Ampliación de imágenes**: Haz clic en cualquier imagen de pregunta para verla ampliada en un modal con scroll si es necesario.
- **Tema claro/oscuro**: Cambia entre modos claro y oscuro con iconos intuitivos (sol/luna).
- **Exportación y compartición**: Exporta resultados a CSV y comparte por email (Web Share API en móviles).
- **Accesibilidad**: Diseño responsive, favicon, y optimizado para móvil.

## Estructura del proyecto
- `web/` → Raíz servida (Live Server y Capacitor).
- `web/config.js` → Configuración de la app (título, curso, contraseña, etc.).
- `web/index.html` → Página principal con estructura HTML.
- `web/styles.css` → Estilos CSS con soporte para temas claro/oscuro.
- `web/main.js` → Punto de entrada principal.
- `web/ui.js` → Gestión de UI y eventos.
- `web/quiz.js` → Lógica del cuestionario y carga de CSV.
- `web/state.js` → Gestión del estado de la aplicación.
- `web/assets/` → Archivos estáticos (preguntas.csv, imágenes).
- `web/vendor/` → Librerías externas (PapaParse para CSV).
- `web/favicon.ico` → Icono del sitio.

## Uso local (VS Code + Live Server)
1. Abre la carpeta del proyecto en VS Code.
2. Haz clic derecho en `web/index.html` → "Open with Live Server".
3. La aplicación se abrirá en tu navegador. La contraseña está definida en `web/config.js` (por defecto: 1234).

## Generación de APK con Capacitor
1. Instala dependencias: `npm install`.
2. Agrega plataforma Android: `npm run cap:add:android`.
3. Copia archivos: `npm run cap:copy`.
4. Abre en Android Studio: `npm run cap:open:android`.
5. Compila en dispositivo/emulador. Para release: Build → Generate Signed Bundle/APK.

## Notas técnicas
- El `<title>` del `index.html` se establece desde `config.js` (campo `titulo`). Si no está definido, usa `curso · tema`.
- El campo "Nombre del alumno" no se autocompleta para privacidad.
- "Saltar pregunta" (botón naranja) avanza automáticamente. "Siguiente/Finalizar" (botón azul) se habilita tras responder.
- Las imágenes se cargan desde `web/assets/` y pueden ampliarse haciendo clic.
- El tema se guarda en localStorage y se aplica automáticamente.

## Pendiente por tu parte
- Añadir `web/assets/preguntas.csv` con la cabecera:
  ```
  pregunta;respuesta1;respuesta2;respuesta3;respuesta4;indice_correcta;competencias_especificas;criterios;saberes;descriptores;imagen;feedback_explicacion
  ```
  - `indice_correcta`: Número de la respuesta correcta (1-4).
  - Campos multivalor separados por comas.
  - `imagen`: Nombre del archivo en `web/assets/` (opcional).
  - `feedback_explicacion`: Texto de retroalimentación y explicación (puede incluir HTML básico).
