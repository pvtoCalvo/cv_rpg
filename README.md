# RPG Cristo Fernando

SPA en React + Vite + TypeScript con estilo RPG pixel-art para presentar el CV.

## Caracteristicas
- Interfaz RPG con personaje animado por niveles de experiencia.
- Cambio de idioma EN/ES (EN por defecto).
- Timeline de experiencia interactivo.
- Vista de impresion para guardar en PDF.
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
docker compose up -d --build
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
- `public/sprites/`: sprite sheets del personaje.
- `Dockerfile`: build y runtime con Nginx.
- `docker-compose.yml`: servicio Docker (puerto `8081`).

## Notas
- Si el puerto `8081` ya esta ocupado en tu servidor, cambia `docker-compose.yml`.
- Para exportar PDF usa el boton `Print / Save PDF` en la web.
