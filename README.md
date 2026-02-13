# Bridging Academy Platform

## Vision
A vertical SAP Talent Acceleration & Placement platform connecting trained SAP professionals with European employers.

## Core Flow
Talent registers → completes learning path → becomes job-ready → matched with companies → interview → placement.

## Roles
- ADMIN
- TALENT
- COMPANY

## MVP Scope
- Authentication + RBAC
- Admin dashboard (basic management)
- Talent dashboard (learning + profile + job apply)
- Company dashboard (job posting + pipeline)
- Basic readiness scoring
- Basic analytics counters

## Tech Stack
Frontend: Next.js (App Router)
Backend: NestJS
Database: PostgreSQL
ORM: Prisma
Auth: JWT + Refresh Token
Styling: Tailwind + ShadCN

## Architecture
Monorepo:
- /apps/web (Next.js)
- /apps/api (NestJS)
- /packages/ui (shared components)
