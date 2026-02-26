# Savasana

![Angular](https://img.shields.io/badge/Angular_14-red?logo=angular&logoColor=white)
![RxJS](https://img.shields.io/badge/RxJS_7-B7178C?logo=reactivex&logoColor=white)
![Java](https://img.shields.io/badge/Java_8-007396?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_2.6-6DB33F?logo=springboot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?logo=springsecurity&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white)

**Savasana** is a fullstack application developed as part of an OpenClassrooms training project.
It provides a yoga session management platform, with a Spring Boot REST API backend and an Angular frontend.

The project covers:
- **JWT-based authentication** (register / login)
- **User management**
- **Yoga session listings**
- **Secure REST endpoints** protected by Spring Security
- **Unit, integration and end-to-end tests** with coverage reports

<br>

## Technical Highlights

| Area | Description |
|------|-------------|
| **Frontend** | Angular 14, RxJS 7 |
| **Backend** | Spring Boot 2.6, Java 8 |
| **Security** | Spring Security + JWT (stateless authentication) |
| **Database** | MySQL |
| **ORM** | Spring Data JPA (Hibernate) |
| **Frontend testing** | Jest (unit), Cypress (E2E) |
| **Backend testing** | JUnit, Spring Boot Test, JaCoCo (coverage) |

<br>

## Prerequisites

- [Node.js](https://nodejs.org/) and npm
- [Angular CLI](https://angular.io/cli)
- [Java 8](https://www.oracle.com/java/technologies/javase/javase8-archive-downloads.html)
- [Maven](https://maven.apache.org/)
- [MySQL](https://www.mysql.com/) + MySQL Workbench

<br>

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/PaulineLesueur/open-classrooms-savasana-2026.git
cd open-classrooms-savasana-2026
```

### 2. Database setup (MySQL)

Open MySQL Workbench and run the SQL script located at:
```
savasana/ressources/sql/script.sql
```

This will create the `savasana` database and its tables.

### 3. Configure the backend

Open the file `back/src/main/resources/application.properties` and update the credentials if needed:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/savasana?allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=rootroot
```

### 4. Run the backend

```bash
cd back
mvn spring-boot:run
```

The API will be available at: `http://localhost:8080`

### 5. Run the frontend

```bash
cd front
npm install
npm start
```

Visit the following URL in your browser: `http://localhost:4200/`

<br>

## Running the Tests

### Backend — Unit & Integration Tests

From the `back/` directory, run:

```bash
mvn clean verify
```

This command runs all unit tests and integration tests, and generates a JaCoCo coverage report at:
```
back/target/site/jacoco/index.html
```

### Frontend — Unit Tests (Jest)

From the `front/` directory, run:

```bash
npm run test:coverage
```

The coverage report will be generated at:
```
front/coverage/jest/lcov-report/index.html
```

### Frontend — End-to-End Tests (Cypress)

From the `front/` directory, first launch the E2E test suite:

```bash
npm run e2e
```

Then generate the coverage report:

```bash
npm run e2e:coverage
```

The E2E coverage report will be available at:
```
front/coverage/lcov-report/index.html
```

<br>

## Notes

This project is a **fictional educational project** developed as part of an **OpenClassrooms certification program**. It was created for learning purposes only and does not represent a real-world application or organization.
