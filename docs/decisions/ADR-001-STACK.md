# ADR-001 — Technology Stack

Status: Accepted (updated FPM-002A).  
Date: 2026-09-15.

## Context

Original specification lists **Prisma ORM**. Repository foundation and project direction selected **Drizzle ORM** with PostgreSQL, Next.js App Router, and related tooling.

## Decision

Adopt:

* Next.js 15+ App Router, React 19+, strict TypeScript  
* Tailwind CSS, shadcn/ui, React Hook Form, Zod  
* PostgreSQL + **Drizzle ORM** (**CURRENT DECISION**; Prisma is **SUPERSEDED** and must not be introduced)  
* Redis + BullMQ for durable jobs  
* Recharts (or equivalent accessible charts), ExcelJS  
* Vitest + Playwright  
* Docker, GitHub Codespaces, GitHub Actions, Caddy (deploy)  
* Private S3-compatible object storage  

## Consequences

* Spec text remains historical; implementations follow Drizzle.  
* “Prisma migrations apply” acceptance wording in the original spec maps to **Drizzle migrations apply cleanly**.  
* Financial Domain remains framework-agnostic.
