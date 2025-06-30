# Printify Backend

## Overview

This backend is built with **Node.js + Express** and uses **Prisma ORM** with a **PostgreSQL** database. It is modular, extensible, and follows best practices for API versioning, documentation, and code organization.

## Key Principles

- **API Versioning:** All endpoints are under `/api/v1/...`
- **Swagger (OpenAPI):** All routes are documented
- **No business logic in routes:** Use service functions
- **Modular structure:** Controllers, routes, services, middleware
- **Prisma ORM:** For PostgreSQL, with custom string IDs (e.g., `USR_<UUID>`, `SHP_<UUID>`) and future-proofed models
- **AWS S3 Integration:** For PDF uploads
- **Role-based access:** Middleware for auth and roles
- **Extensible:** Easy to add new roles, fields, endpoints, or features
- **Structured JSON responses:** All endpoints return `{ status, message, data }`

## Models

- **User**: Custom ID, role, personal info
- **Store**: Custom ID, owner, status, business info
- **Order**: Custom ID, user, store, PDF, status, metadata

## API Endpoints

- `/auth/signup` – User registration
- `/auth/login` – JWT login
- `/stores/register` – Create store
- `/stores/pending` – Admin: list unapproved stores
- `/stores/:id/approve` – Admin: approve store
- `/orders/create` – Upload PDF, place order
- `/orders/shop/:storeId` – Shop owner: see orders
- `/orders/user` – User: see own orders
- `/orders/:id/pdf` – Shop owner: delete PDF after print
- `/stores/all-approved` – List for store selection

## Extensibility

- Use enums/configs for roles/statuses
- UUID string IDs for all entities
- `metadata`/`extraFields` JSONB for custom fields
- Pagination-ready endpoints
- Soft deletes (`isDeleted`)
- Webhooks table for future integrations

---

See the codebase for details on structure and implementation. 