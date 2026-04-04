# AceManager - Gestión de Torneos de Tenis

Proyecto full-stack para gestión de torneos de tenis.

## Estructura

```
/backend    - API REST con NestJS + Prisma + PostgreSQL
/frontend   - Interfaz de usuario con React + MUI
```

## Requisitos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn

## Backend

### Setup

```bash
cd backend
npm install
```

### Configuración

Crear archivo `.env` con la URL de PostgreSQL:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tenis?schema=public"
```

### Inicializar base de datos

```bash
cd backend
npx prisma generate
npx prisma db push
```

> **Nota**: `prisma db push` sincroniza el esquema con la base de datos (crea/actualiza tablas directamente, sin migraciones). Para producción usar `prisma migrate dev`.

### Levantar servidor

```bash
cd backend
npm run start:dev
```

El servidor estará disponible en `http://localhost:3000`

## Frontend

### Setup

```bash
cd frontend
npm install
```

### Levantar aplicación

```bash
cd frontend
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Desarrollo

### Seed de jugadores

Para crear jugadores de prueba:

```bash
curl -X POST http://localhost:3000/seed/players?count=32&category=normal
```

Categorías disponibles: `senior`, `normal`, `infantiles`

### API

Ver `backend/ENDPOINTS.md` para documentación de endpoints.
