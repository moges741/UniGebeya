# UNi GEBEYA | ዩኒ ገበያ — Standalone NestJS + PostgreSQL Backend Blueprint

The live AI Studio preview runs end-to-end on Firebase Auth + Firestore with strict role-based security rules enforcing the `PENDING` -> `APPROVED` / `REJECTED` workflow.

When deploying your own dedicated NestJS + PostgreSQL server outside AI Studio, use the relational schema in `backend/prisma/schema.prisma` with the following modular NestJS architecture:

## Module Structure
- `src/auth/` — JWT strategy, bcrypt password hashing (`12` rounds), `JwtAuthGuard`, `RolesGuard` (`@Roles(UserRole.ADMIN)`).
- `src/users/` — User registration, profile updates, and admin user listing.
- `src/categories/` — Public `GET /api/categories` and Admin-only `POST/PATCH/DELETE /api/admin/categories`.
- `src/listings/` —
  - `GET /api/listings` (hardcodes `where: { status: ListingStatus.APPROVED }`)
  - `GET /api/listings/:id` (returns only `APPROVED`, or owner/admin)
  - `POST /api/listings` (forces `status: ListingStatus.PENDING` server-side)
  - `GET /api/listings/mine` (filters by `req.user.id`)
  - `PATCH /api/listings/:id` (verifies ownership, resets `status: PENDING`)
  - `DELETE /api/listings/:id` (verifies ownership or `ADMIN`)
- `src/admin/` — Protected by `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(UserRole.ADMIN)`:
  - `GET /api/admin/overview`
  - `GET /api/admin/listings`
  - `PATCH /api/admin/listings/:id/approve`
  - `PATCH /api/admin/listings/:id/reject`
- `src/uploads/` — Cloudinary signed upload service validating MIME types (`image/jpeg`, `image/png`, `image/webp`) and max file size.
- `src/main.ts` — Enables global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` and Swagger UI at `/api/docs`.

## Environment Variables
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/uni_gebeya?schema=public"
JWT_SECRET="replace-with-strong-secret"
JWT_EXPIRES_IN="7d"
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```
