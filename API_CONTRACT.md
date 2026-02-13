# Auth

POST /auth/register
POST /auth/login
POST /auth/refresh
GET /me

# Admin

GET /admin/talents
GET /admin/companies
GET /admin/jobs
PATCH /admin/talents/:id/job-ready
PATCH /admin/applications/:id/stage

# Talent

GET /talent/profile
PATCH /talent/profile
GET /talent/courses
GET /jobs
POST /jobs/:id/apply
GET /talent/applications

# Company

POST /company/jobs
GET /company/jobs
GET /company/jobs/:id/applications
PATCH /company/applications/:id/stage
