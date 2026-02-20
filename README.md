# RPG Cristo Fernando

SPA en React + Vite + TypeScript con estilo RPG pixel-art para presentar el CV.

## Caracteristicas
- Interfaz RPG con personaje animado por niveles de experiencia.
- Cambio de idioma EN/ES (EN por defecto).
- Timeline de experiencia interactivo.
- Vista de impresion para guardar en PDF.
- SPA independiente de comparaciones tecnicas en path `/comparaciones`.
- Soporte Docker con Nginx y fallback SPA.

## Requisitos
- Node.js 20+ (recomendado)
- npm 9+
- Docker y Docker Compose (opcional)

## Ejecucion local (sin Docker)
```bash
git clone https://github.com/pvtoCalvo/cv_rpg.git
cd cv_rpg
npm install
npm run dev
```

Abrir en navegador:
- `http://localhost:5173`
- `http://localhost:5173/comparaciones/`

## Build de produccion (sin Docker)
```bash
npm run build
npm run preview
```

## Ejecucion con Docker
```bash
git clone https://github.com/pvtoCalvo/cv_rpg.git
cd cv_rpg
docker compose up -d --build
```

Abrir en navegador:
- `http://localhost:8081`
- `http://localhost:8081/comparaciones/`

## Ejecucion Docker para produccion
Usa el compose de produccion con contenedor endurecido y healthcheck:
```bash
git clone https://github.com/pvtoCalvo/cv_rpg.git
cd cv_rpg
cp .env.example .env
docker compose -f docker-compose.prod.yml up -d --build
```

Abrir en navegador:
- `http://TU_SERVIDOR:${CV_PORT}` (por defecto `8081`)
- `http://TU_SERVIDOR:${CV_PORT}/comparaciones/`

## Verificar salud del contenedor
```bash
curl http://localhost:8081/health
```

Debe responder:
- `ok`

## Actualizar en servidor
Dentro de la carpeta del proyecto en el servidor:
```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

## Parar o reiniciar
```bash
docker compose down
docker compose up -d
```

## Estructura principal
- `src/App.tsx`: UI principal y logica RPG.
- `src/resume.data.ts`: datos base del CV.
- `src/resume.builders.ts`: generacion de contenido/markdown/json.
- `src/styles.css`: estilos pixel-art y vista de impresion.
- `comparaciones/index.html`: entrada de la SPA independiente de comparaciones.
- `src/comparaciones/`: codigo React de comparaciones (navegacion y render Markdown).
- `docs/`: guias Markdown fuente para comparaciones (AWS/monitorizacion/otros).
- `public/sprites/`: sprite sheets del personaje.
- `Dockerfile`: build y runtime con Nginx.
- `docker-compose.yml`: servicio Docker (puerto `8081`).
- `docker-compose.prod.yml`: configuracion Docker para produccion.
- `.env.example`: variables de entorno para despliegue.

## Notas
- Si el puerto `8081` ya esta ocupado en tu servidor, cambia `docker-compose.yml`.
- Para exportar PDF usa el boton `Print / Save PDF` en la web.
- Para cambiar el puerto en produccion, ajusta `CV_PORT` en `.env`.
- Para agregar nuevas comparativas, crea un `.md` dentro de `docs/`; la SPA `/comparaciones` lo carga automaticamente.
