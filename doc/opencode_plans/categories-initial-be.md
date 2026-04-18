# Plan: Categorías - Backend Inicial

## Objetivo
Agregar funcionalidad de gestión de categorías del tournaments:
- `GET /categories` - Listar todas las categorías
- `POST /seed/categories` - Crear categorías iniciales (solo dev)

## Endpoints

### GET /categories
Retorna todas las categorías ordenadas por `tier` ASC.

**Respuesta:**
```json
[
  { "id": "...", "name": "Grand Slam", "code": "GS", "pointsWinner": 2000, "pointsFinalist": 1000, "tier": 1 }
]
```

### POST /seed/categories
Crea las 5 categorías iniciales según etapa 1.3 de PLAN_FASE1.md:

| name | code | pointsWinner | pointsFinalist | tier |
|------|------|--------------|----------------|------|
| Grand Slam | GS | 2000 | 1000 | 1 |
| Masters 1000 | M1000 | 1000 | 600 | 2 |
| ATP 500 | ATP500 | 500 | 300 | 3 |
| ATP 250 | ATP250 | 250 | 150 | 4 |
| Challenger | CH | 100 | 50 | 5 |

## Archivos a crear

```
backend/src/categories/
├── categories.module.ts
├── categories.controller.ts
├── categories.service.ts
└── dto/
    └── category.dto.ts (vacío, no hay DTOs necesarios por ahora)
```

## Implementación

1. **CategoriesModule** - Registrar en app.module.ts
2. **CategoriesService** - Métodos:
   - `findAll()` - Prisma findMany con orderBy tier
   - `seed()` - Crear las 5 categorías (usar `upsert` para idempotencia)
3. **CategoriesController** - Endpoints:
   - `@Get('categories')` 
   - `@Post('seed/categories')` en Controller Seed

## Actualización de archivos

- `backend/src/app.module.ts` - Importar CategoriesModule
- `ENDPOINTS.md` - Agregar los nuevos endpoints

## Notas
- No se necesita DTO para GET (respuesta simple)
- El seed usa `upsert` para permitir ejecución repetida sin duplicados
- El código de categoría es `unique` en el modelo, por eso upsert