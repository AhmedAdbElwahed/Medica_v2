# Medica Hospital Management System (HMS)

![Medica Logo](https://img.shields.io/badge/Medica-HMS-blue?style=for-the-badge)
![Java Version](https://img.shields.io/badge/Java-26-orange?style=flat-square)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0.5-brightgreen?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-Planned-black?style=flat-square)

Medica is a comprehensive, enterprise-grade Hospital Management System designed for modern healthcare facilities. It follows a clean architecture model, prioritizing strict type safety, consistent API design, and robust security protocols. The system is built to handle the complex, day-to-day operational, clinical, and financial needs of a hospital.

## 🚀 Key Features & Modules

- **Authentication & Security:** JWT-based stateless authentication with granular Role-Based Access Control (RBAC).
- **Administrative Core:** Comprehensive management of Patients, Doctors, and Wards.
- **Appointment Scheduling:** Advanced scheduling system with built-in double-booking prevention.
- **Clinical Operations:** Detailed tracking of Examinations, Diagnoses, Medications, and Lab Reports.
- **Financial & Billing:** Integrated billing management powered by Kill Bill and Stripe for robust financial operations.
- **Real-time Communication:** WebSocket-based real-time chat functionality for staff communication.
- **File Management:** Self-hosted MinIO integration for secure storage of patient files, images, and reports.

## 🛠️ Technology Stack

### Backend
- **Framework:** Spring Boot 4.0.5 (Jakarta EE 11)
- **Language:** Java 26
- **Database:** PostgreSQL 16 (Relational), Elasticsearch 8 (Search - Optional)
- **Persistence:** Spring Data JPA + Hibernate 7, QueryDSL 6, Liquibase (Migrations)
- **Security:** Spring Security 7 + JWT, Spring WebSocket + STOMP
- **Integrations:** Kill Bill (Billing), Stripe (Payments), MinIO (S3-compatible Storage)
- **API Documentation:** SpringDoc OpenAPI

### Frontend (Planned)
- **Framework:** Next.js
- **Language:** TypeScript
- **State Management:** React Query

### Infrastructure
- Docker & Docker Compose for local development and service orchestration.

## 📁 Project Structure

```text
medica/
├── backend/                  # Java Spring Boot backend source code
│   ├── src/main/java/        # Application source code
│   └── plan/                 # Detailed backend implementation plans
├── frontend/                 # Next.js frontend source code (Planned)
│   └── plan/                 # Detailed frontend implementation plans
├── docker-compose.yaml       # Infrastructure services (MinIO, Kill Bill, MariaDB)
└── GEMINI.md                 # Project context and developer guidelines
```

## ⚙️ Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
- [Java 26 JDK](https://jdk.java.net/26/)
- [Docker & Docker Compose](https://www.docker.com/)
- [Node.js & npm](https://nodejs.org/) (for Frontend development)

### 1. Spin up Infrastructure

Start the required backing services (MinIO, Kill Bill, databases) using Docker Compose:

```bash
docker-compose up -d
```

### 2. Run the Backend

Navigate to the `backend` directory, build the project, and run the Spring Boot application. The application utilizes Liquibase for automatic database schema migrations upon startup.

```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

*The API will be available at `http://localhost:8080/hms/v1/`.*

### 3. Run the Frontend (Coming Soon)

*(Standard Next.js workflow to be implemented)*

```bash
cd frontend
npm install
npm run dev
```

## 🧑‍💻 Development Conventions

Medica strictly adheres to internal coding standards to ensure long-term maintainability:

- **API Standards:** All REST endpoints must be prefixed with `/hms/v1/`. Server-side validation and `@PreAuthorize` tags are mandatory.
- **Type Safety:** We use **QueryDSL** for complex type-safe queries, minimizing raw SQL or string-based JPQL.
- **Entity Design:** Persistent domain objects extend `AuditedEntity` to ensure consistent audit logging across the system. 
- **DTO Mapping:** **MapStruct** is utilized for efficient and clean DTO-Entity conversions.
- **Null Safety:** Strict usage of `jakarta.annotation.Nonnull` or `lombok.NonNull` (Spring's `NonNull` is deprecated in 7+).

Refer to the `GEMINI.md` and module-specific plans in the `plan/` directories for detailed architectural decisions and implementation steps.

## 📝 License

This project is open-source and created for practice and educational purposes. Feel free to explore, learn, and contribute!
