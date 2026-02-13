# Database Schema Overview

## User
- id (uuid)
- name
- email (unique)
- password_hash
- role (ADMIN | TALENT | COMPANY)
- created_at
- updated_at

## TalentProfile
- id
- user_id (FK User)
- bio
- languages (json)
- skills (json)
- readiness_score (float)
- coach_rating (float)
- availability (boolean)
- placement_status (enum: LEARNING | JOB_READY | PLACED)

## Company
- id
- name
- industry
- country
- created_at

## Job
- id
- company_id (FK Company)
- title
- description
- required_skills (json)
- location
- salary_range
- status (OPEN | CLOSED)

## Application
- id
- job_id
- talent_id
- stage (APPLIED | SCREEN | INTERVIEW | OFFER | HIRED | REJECTED)
- score
- created_at

## Course
- id
- title
- level
- track

## Enrollment
- id
- talent_id
- course_id
- progress (0-100)
- status (ACTIVE | COMPLETED)
