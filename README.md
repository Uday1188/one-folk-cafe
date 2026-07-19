# One Folk Cafe - Full Stack Application

Welcome to the One Folk Cafe project! This application features a robust Spring Boot 3 backend and a modern Next.js 15 frontend.

## Prerequisites

Before running the application, ensure you have the following installed on your machine:
1. **Java 21**
2. **Node.js** (v18 or higher)
3. **PostgreSQL** (v14 or higher)

---

## 1. Database Setup (PostgreSQL)

Since we are running natively without Docker, you must set up a local PostgreSQL database.

1. Open your PostgreSQL command line (or pgAdmin).
2. Create a database named `friendscafe`:
   ```sql
   CREATE DATABASE friendscafe;
   ```
3. Ensure your PostgreSQL server is running on the default port `5432` with the username `postgres` and password `postgres`. 
   *(If you use a different username/password, update them in `backend/src/main/resources/application.yml`)*.

---

## 2. Running the Backend (Spring Boot)

The backend runs on **Java 21** and uses Gradle. Flyway will automatically create the database tables and seed the initial menu data when you start the server.

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Start the Spring Boot application using the Gradle wrapper:
   - On **Windows**:
     ```bash
     .\gradlew.bat bootRun
     ```
   - On **Mac/Linux**:
     ```bash
     ./gradlew bootRun
     ```
3. The backend will start on `http://localhost:8080`.
   - **Note:** The backend provides a Swagger API documentation interface at `http://localhost:8080/swagger-ui.html`.

---

## 3. Running the Frontend (Next.js)

The frontend is a responsive Next.js 15 application that communicates with the Spring Boot backend.

1. Open a **new terminal** and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the Node dependencies (if you haven't already):
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open your web browser and go to `http://localhost:3000`.

### Using the Application

- **Customer View:** Customers do not require a login. They can browse the menu, add items to the cart, and proceed to checkout seamlessly.
- **Admin Dashboard:** Navigate to `http://localhost:3000/admin/login` to manage orders and view analytics.
  - **Username:** `admin`
  - **Password:** `admin123`
