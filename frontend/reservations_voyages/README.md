# Reservations Voyages - Travel Reservation Management System

A comprehensive Spring Boot REST API for managing travel reservations, including flights (vols) and hotels, with user authentication, role-based access control, and payment processing.

## 🚀 Features

- **User Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - Role-based access control (ADMIN, CLIENT)
  - Password reset functionality via email

- **Reservation Management**
  - Flight (Vol) reservations
  - Hotel reservations
  - Reservation status tracking
  - Admin dashboard with statistics

- **Payment Processing**
  - Secure payment handling
  - Payment status tracking

- **Admin Features**
  - User management (CRUD operations)
  - Reservation statistics and analytics
  - Top clients and items reporting

## 🛠️ Technology Stack

- **Framework**: Spring Boot 4.0.1
- **Java Version**: 17
- **Database**: PostgreSQL
- **Security**: Spring Security with JWT
- **Build Tool**: Maven
- **Email**: Spring Mail (Gmail SMTP)

## 📋 Prerequisites

- Java 17 or higher
- Maven 3.6+ (or use Maven Wrapper: `./mvnw`)
- PostgreSQL 12+
- Gmail account (for email functionality)

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd reservations_voyages
   ```

2. **Database Setup**
   - Create a PostgreSQL database named `travel_db`
   - Update database credentials in `src/main/resources/application.properties`

3. **Configure Application Properties**
   - Copy `application.properties.example` to `application.properties` (if available)
   - Update the following:
     - Database connection details
     - JWT secret key (use a strong, random key)
     - Email configuration (Gmail SMTP credentials)
     - Frontend URL for password reset links

4. **Build the Project**
   ```bash
   ./mvnw clean install
   ```

5. **Run the Application**
   ```bash
   ./mvnw spring-boot:run
   ```

   The API will be available at `http://localhost:8081`

## 📁 Project Structure

```
src/main/java/com/example/reservations_voyages/
├── auth/                    # Authentication & Authorization
│   ├── controller/         # REST Controllers
│   ├── dto/                # Data Transfer Objects
│   └── service/            # Business Logic
├── common/                  # Shared Components
│   └── exception/          # Exception Handlers
├── security/                # Security Configuration
│   ├── config/             # Security Config
│   └── jwt/                # JWT Implementation
└── user/                    # User Domain
    ├── entity/             # JPA Entities
    ├── repo/               # Repositories
    └── service/            # User Services
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Admin Endpoints (Requires ADMIN role)
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/{id}` - Get user by ID
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/{id}` - Update user
- `DELETE /api/admin/users/{id}` - Delete user
- `PATCH /api/admin/users/{id}/enabled` - Enable/disable user

### Client Endpoints (Requires CLIENT or ADMIN role)
- `GET /api/client/reservations` - Get user reservations
- `POST /api/client/reservations/vol` - Create flight reservation
- `POST /api/client/reservations/hotel` - Create hotel reservation

## 🔑 Default Admin Account

On first startup, an admin account is automatically created:
- **Email**: `admin@travel.com`
- **Password**: `Admin12345`

⚠️ **Important**: Change the default password in production!

## 🧪 Testing

Run tests with:
```bash
./mvnw test
```

## 📝 Configuration

Key configuration files:
- `src/main/resources/application.properties` - Application configuration
- `pom.xml` - Maven dependencies and build configuration

## 🏗️ Build for Production

```bash
./mvnw clean package
```

The JAR file will be created in `target/reservations_voyages-0.0.1-SNAPSHOT.jar`

Run the JAR:
```bash
java -jar target/reservations_voyages-0.0.1-SNAPSHOT.jar
```

## 📄 License

This project is part of an academic assignment.

## 👥 Authors

[Your Name/Team]

---

**Note**: This is a Spring Boot REST API backend. A frontend application (Angular) is required for full functionality.

