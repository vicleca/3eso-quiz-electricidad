# Quiz 3º ESO – Electricidad y Electrónica (Web + Capacitor)

Esta aplicación web permite realizar un cuestionario interactivo sobre Electricidad y Electrónica para alumnos de 3º ESO. Incluye funcionalidades avanzadas como ampliación de imágenes, cambio de tema claro/oscuro, y exportación de resultados.

## Características principales
- **Configuración dinámica**: Carga CURSO, MATERIA, TEMA, PASSWORD y TÍTULO desde `docs/config.js`.
- **Carga de preguntas**: Lee el CSV desde `docs/assets/preguntas.csv` (separador `;`, multivalor `,`).
- **Interfaz interactiva**: Orden aleatorio de preguntas, feedback inmediato, barra de progreso, botones “Saltar” y “Siguiente”.
- **Evaluación detallada**: Notas globales y por etiqueta (saberes básicos, competencias específicas, criterios de evaluación, descriptores del perfil de salida).
- **Ampliación de imágenes**: Haz clic en cualquier imagen de pregunta para verla ampliada en un modal con scroll si es necesario.
- **Tema claro/oscuro**: Cambia entre modos claro y oscuro con iconos intuitivos (sol/luna).
- **Exportación y compartición**: Exporta resultados a CSV y comparte por email (Web Share API en móviles).
- **Accesibilidad**: Diseño responsive, favicon, y optimizado para móvil.

## Estructura del proyecto
- `docs/` → Raíz servida (Live Server y Capacitor).
- `docs/config.js` → Configuración de la app (título, curso, contraseña, etc.).
- `docs/index.html` → Página principal con estructura HTML.
- `docs/styles.css` → Estilos CSS con soporte para temas claro/oscuro.
- `docs/main.js` → Punto de entrada principal.
- `docs/ui.js` → Gestión de UI y eventos.
- `docs/quiz.js` → Lógica del cuestionario y carga de CSV.
- `docs/state.js` → Gestión del estado de la aplicación.
- `docs/assets/` → Archivos estáticos (preguntas.csv, imágenes).
- `docs/vendor/` → Librerías externas (PapaParse para CSV).
- `docs/favicon.ico` → Icono del sitio.

## Uso local (VS Code + Live Server)
1. Abre la carpeta del proyecto en VS Code.
2. Haz clic derecho en `docs/index.html` → "Open with Live Server".
3. La aplicación se abrirá en tu navegador. La contraseña está definida en `docs/config.js` (por defecto: 1234).

## Generación de APK con Capacitor

Para convertir la aplicación web en un archivo `.apk` para Android, sigue estos pasos.

### 1. Configuración Inicial (Solo la primera vez)

Estos pasos instalan todas las herramientas necesarias en tu ordenador.

1.  **Instalar Node.js:**
    * Descarga e instala la versión **"LTS"** desde [nodejs.org](https://nodejs.org/).
    * Esto instalará `node` y `npm`.

2.  **Instalar Android Studio:**
    * Descarga e instálalo desde [developer.android.com/studio](https://developer.android.com/studio).
    * **Importante:** Después de instalar, **abre Android Studio** al menos una vez. Se ejecutará un asistente de configuración ("Setup Wizard") que descargará los "Android SDK" necesarios para compilar la app. Acepta todas las opciones por defecto.

3.  **Instalar dependencias del proyecto:**
    * Abre una terminal (como PowerShell) en la carpeta de este proyecto.
    * Ejecuta el siguiente comando para instalar Capacitor y otras utilidades:
        ```bash
        npm install
        ```

4.  **Añadir la plataforma Android:**
    * En la misma terminal, ejecuta este comando para crear la carpeta `android` del proyecto nativo:
        ```bash
        npm run cap:add:android
        ```

### 2. Actualizar y Compilar la App (Uso habitual)

Sigue estos pasos cada vez que hagas un cambio en la app (en el código o en las preguntas) y quieras generar un nuevo `.apk`.

1.  **Realizar cambios:**
    * Modifica el contenido de la carpeta `docs/` (por ejemplo, actualiza `docs/assets/preguntas.csv`, cambia el `config.js` o ajusta el CSS).

2.  **Sincronizar los cambios:**
    * En la terminal, ejecuta este comando. Copiará todos tus archivos de la carpeta `docs/` al proyecto `android`.
        ```bash
        npm run cap:copy
        ```

3.  **Abrir en Android Studio:**
    * En la terminal, ejecuta:
        ```bash
        npm run cap:open:android
        ```

4.  **Generar el APK:**
    * Espera a que Android Studio termine de cargar y sincronizar el proyecto (verás una barra de "Gradle Sync" en la parte inferior).
    * En el menú superior, ve a **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
    * Cuando termine, aparecerá una notificación en la esquina inferior derecha. Haz clic en **"locate"** para abrir la carpeta que contiene tu archivo `app-debug.apk`.
    * Ese archivo `.apk` es la aplicación que puedes instalar en un dispositivo Android.

## Notas técnicas
- El `<title>` del `index.html` se establece desde `config.js` (campo `titulo`). Si no está definido, usa `curso · tema`.
- El campo "Nombre del alumno" no se autocompleta para privacidad.
- "Saltar pregunta" (botón naranja) avanza automáticamente. "Siguiente/Finalizar" (botón azul) se habilita tras responder.
- Las imágenes se cargan desde `docs/assets/` y pueden ampliarse haciendo clic.
- El tema se guarda en localStorage y se aplica automáticamente.
- Añadir `docs/assets/preguntas.csv` con la cabecera:
pregunta;respuesta1;respuesta2;respuesta3;respuesta4;indice_correcta;competencias_especificas;criterios;saberes;descriptores;imagen;feedback_explicacion
