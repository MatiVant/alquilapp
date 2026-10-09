# AlquilApp

MVP mobile-first para administrar propiedades en alquiler, propietarios, impuestos, gastos y comisiones.

## Ejecutar

```bash
npm install
npm run dev
```

Abrir http://localhost:3000. Actualmente los datos de la interfaz todavía se guardan en `localStorage`. La base backend está preparada con Neon PostgreSQL y Drizzle; la migración de datos y autenticación se incorporarán por etapas.

## Backend Neon

1. Copiar `.env.example` como `.env.local`.
2. Completar `DATABASE_URL` con la conexión de Neon.
3. Generar y aplicar el esquema:

```bash
npm run db:generate
npm run db:migrate
```

4. Verificar `http://localhost:3000/api/health`.

Los documentos se prepararán para Cloudflare R2 mediante las variables `R2_*`.

## Migración inicial

Desde `Configuración`, usar `Exportar datos`. Con Next ejecutándose y `MIGRATION_TOKEN` configurado en `.env.local`, enviar el archivo exportado:

```bash
curl -X POST http://localhost:3000/api/migration/import \
  -H "Content-Type: application/json" \
  -H "x-migration-token: TU_TOKEN" \
  --data-binary @alquilapp-export-AAAA-MM-DD.json
```

La migración importa los datos operativos principales. Los archivos adjuntos se migrarán a R2 en una etapa separada; no se eliminan del navegador durante este proceso.

## Deploy en Vercel

Importar este directorio como proyecto, framework **Next.js**, y usar los comandos por defecto. No requiere variables de entorno para el MVP.
