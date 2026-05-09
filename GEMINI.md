# Medica Hospital Management System (HMS) - Project Context

## Project Overview
Medica is a comprehensive Hospital Management System designed for modern healthcare facilities. It follows a clean architecture, prioritizing type safety, consistent API design, and robust security. The project is currently in its early implementation phase, following a detailed "Fresh Implementation Plan" to avoid technical debt from previous iterations.

### Core Technologies
- **Backend:** Spring Boot 4.0.5 (Jakarta EE 11), Java 26
- **Database:** PostgreSQL 16 (Relational), Elasticsearch 8 (Search - Optional)
- **Persistence:** Spring Data JPA + Hibernate 7, QueryDSL 6 (Type-safe queries), Liquibase (Migrations)
- **Security:** Spring Security 7 + JWT (Stateless), Spring WebSocket + STOMP (Real-time chat)
- **Integrations:** 
  - **Kill Bill:** Open-source billing platform (Self-hosted)
  - **Stripe:** Payment processor (Production)
  - **MinIO:** S3-compatible storage for files and images (Self-hosted)
- **Frontend (Planned):** Next.js + TypeScript + React Query

---

## Project Structure
- `backend/`: Java Spring Boot source code.
  - `src/main/java/com/ahmed/medica`: Root package.
  - `plan/`: Detailed backend implementation plans (module-by-module).
- `frontend/`: Next.js frontend source code (Plan-heavy at this stage).
  - `plan/`: Detailed frontend implementation plans.
- `docker-compose.yaml`: Infrastructure services (MinIO, Kill Bill, MariaDB for Kill Bill).

---

## Building and Running

### Prerequisites
- Java 26
- Docker & Docker Compose
- Maven (or use provided `mvnw`)

### Infrastructure
Spin up core services (MinIO, Kill Bill):
```bash
docker-compose up -d
```

### Backend
Build and run the Spring Boot application:
```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

### Frontend
(Placeholder for Next.js commands - standard Next.js workflow expected)
```bash
cd frontend
npm install
npm run dev
```

---

## Development Conventions

### API Standards
- **Endpoint Prefix:** All REST endpoints MUST use `/hms/v1/`.
- **Validation:** Server-side validation is mandatory for all inputs.
- **Security:** Use `@PreAuthorize` on all controller methods for explicit role-based access control.

### Coding Style
- **Type Safety:** Use QueryDSL for complex queries; avoid raw SQL or string-based JPQL where possible.
- **Enums:** Use Enums for fixed sets of data (e.g., `Specialty`, `WardGender`, `ReportStatus`).
- **Null Safety:** Do **NOT** use `org.springframework.lang.NonNull` as it is deprecated in Spring 7+. Use `jakarta.annotation.Nonnull` for documentation/analysis or `lombok.NonNull` for runtime enforcement.
- **Mapping:** Use MapStruct for DTO-Entity conversions.
- **Configuration:** Prefer `@ConfigurationProperties` over direct `@Value` injections for type-safe, grouped configuration (e.g., `JwtConfig`).
- **Lombok:** Extensively used for boilerplate reduction (`@Data`, `@Getter`, `@Setter`, etc.).

### Entity Design
- Extend `AuditedEntity` (or equivalent) for all persistent domain objects to ensure consistent audit logging.
- Use `LocalDateTime` for all date/time fields.
- Avoid primitive types for optional fields; use wrapper classes or `Optional`.

### Documentation
- Maintain updated implementation plans in `backend/plan/` and `frontend/plan/`.
- Use SpringDoc OpenAPI for automated API documentation.

---

## Key Modules (In Progress)
1. **Auth:** JWT-based stateless authentication.
2. **Patient/Doctor/Ward:** Core administrative modules.
3. **Appointment:** Scheduling with double-booking prevention.
4. **Clinical:** Examinations, Diagnoses, Medications, Lab Reports.
5. **Billing:** Kill Bill integration for financial management.
6. **Chat:** WebSocket-based real-time communication.
