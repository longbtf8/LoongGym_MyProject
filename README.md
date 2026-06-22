# 🏋️‍♂️ LoongGym MyProject

Welcome to **LoongGym MyProject**, a comprehensive, full-stack Gym Management & Fitness Tracker Application. Built with a modern, high-performance tech stack, this repository hosts both the sleek, interactive Frontend client and the robust, secure Backend API.

---

## 🌟 Key Features

### 🔒 Secure Authentication & User Security

- **JWT Authentication:** Dual-token mechanism using short-lived Access Tokens and secure Refresh Tokens.
- **Token Blacklisting / Revocation:** Advanced token revocation schema storing revoked sessions in the database for instant logout validity.
- **Password Hashing:** Industry-standard secure password hashing using `bcrypt`.
- **Session Tracking:** Tracks active user agents, IP addresses, and session expiration timestamps.
- **Forgot Password Flow:** Fully functional secure email password-reset requests with token hashing and expiration limits.

### 👤 Profile & Preference Management

- **Comprehensive Profiles:** Tracks physical metrics (height, weight, gender, birth date) alongside fitness goals, fitness levels, and a personal bio.
- **Customized Settings:** Supports localized language preferences (defaulting to Vietnamese `vi`), unit system preferences (metric vs. imperial), and custom application themes (light vs. dark mode).

### 🛠️ Architecture & Backend Strength

- **Express v5 Web Server:** Leveraging the latest lightweight Express features.
- **Prisma ORM Integration:** Connects seamlessly to MySQL/MariaDB database with preconfigured relations, automatic cascades on deletion, and a clean schema structure.
- **Robust Validation:** All incoming requests are strictly validated using `Zod` schemas prior to controller execution.
- **Security Middlewares:** Integrates CORS handling, custom exception handlers, JWT authentication guards, and Rate Limiting (`express-rate-limit`) to prevent API abuse.
- **Background Cron Schedulers:** Built-in automation for database cleanup (e.g., clearing expired reset/refresh tokens).

### 🎨 Modern Frontend Client

- **React 19 & Vite:** Next-generation super-fast frontend environment with Hot Module Replacement (HMR).
- **TailwindCSS v4:** Powered by Tailwind CSS's modern engine for fully responsive, beautiful, utility-first user interfaces.
- **Lucide Icons & Smooth Routing:** Clean UI iconography and seamless page transition using `react-router-dom` and `lucide-react`.

---

## 🛠️ Technology Stack

| Domain                | Technology / Package            | Description                                        |
| :-------------------- | :------------------------------ | :------------------------------------------------- |
| **Frontend Core**     | React 19 + Vite                 | UI library and ultra-fast bundler                  |
| **Styling**           | TailwindCSS v4                  | Utility-first modern CSS engine                    |
| **Routing & Icons**   | React Router DOM + Lucide React | Single-page application router and SVG icons       |
| **API Client**        | Axios                           | Promised-based HTTP client for API communication   |
| **Backend Framework** | Node.js + Express.js v5         | Server framework with support for modern JS        |
| **Database ORM**      | Prisma ORM (MySQL/MariaDB)      | Declarative modeling and migration tool            |
| **Validation**        | Zod                             | TypeScript-first schema declaration and validation |
| **Cryptography**      | JSONWebToken + Bcrypt           | Token signing, verification, and password hashing  |
| **Utilities**         | Nodemailer, Cron                | Transactional emails and automatic background jobs |

---

## 📂 Project Structure

```bash
LoongMilkGym_MyProject/
├── LoongMilkGym_MyProject_BackEnd/   # Node.js + Express API Backend
│   ├── prisma/                       # Database Prisma schemas and migrations
│   ├── src/                          # Server source code
│   │   ├── config/                   # Server configurations (db, env variables)
│   │   ├── controllers/              # API request-response handlers
│   │   ├── lib/                      # Core wrappers and initializations
│   │   ├── middlewares/              # JWT auth, validation, and error middlewares
│   │   ├── routes/                   # API route definitions
│   │   ├── schedulers/               # Automatic background tasks
│   │   ├── services/                 # Business logic and database access
│   │   ├── utils/                    # Shared helper functions
│   │   └── validations/              # Zod validation schemas
│   ├── server.js                     # Server entrypoint
│   └── package.json
│
├── LoongMilkGym_MyProject_FrontEnd/  # React 19 + Vite Frontend
│   ├── src/                          # UI source code
│   │   ├── assets/                   # Static files (images, custom CSS)
│   │   ├── components/               # Reusable UI component blocks
│   │   ├── pages/                    # Views/Pages (Dashboard, Auth, Profile)
│   │   └── main.jsx                  # React application mount
│   ├── index.html                    # Frontend shell
│   ├── vite.config.js
│   └── package.json
│
└── README.md                         # This file
```

---

## 🗄️ Database Schema Design

Below are the main relational tables configured in Prisma (`prisma/schema.prisma`):

- **`User`**: Core accounts containing credential details, email verification status, user roles, active status, and association links.
- **`UserProfile`**: Tracks user physical details (height, weight, goal, fitness level, bio).
- **`UserSetting`**: Stores localized application preferences (language, dark/light theme, measurement unit system).
- **`AuthSession`**: Device session registry to securely control concurrent user logins and handle session expiry.
- **`PasswordResetToken`**: Expiring hashed tokens sent via Nodemailer for safe password resets.
- **`RefreshTokens`** & **`RevokedTokens`**: Strict dual-layer security maintaining active Refresh Tokens and blacklisting revoked Access Tokens.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MariaDB](https://mariadb.org/) or [MySQL](https://www.mysql.com/)

---

### 1. Backend Setup

1. Open your terminal and navigate to the backend directory:

   ```bash
   cd LoongMilkGym_MyProject_BackEnd
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure your environmental variables. Duplicate the `.env.example` file to `.env`:

   ```bash
   cp .env.example .env
   ```

   _Edit the `.env` file and replace it with your MariaDB/MySQL credentials and security secrets:_

   ```env
   PORT=5000
   DATABASE_URL="mysql://username:password@localhost:3306/loonggym_db"
   JWT_ACCESS_SECRET="your_jwt_access_secret_key"
   JWT_REFRESH_SECRET="your_jwt_refresh_secret_key"
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   ```

4. Run the database migrations & generate the Prisma client:

   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   _The backend will be running at `http://localhost:5000` (or specified PORT)._

---

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:

   ```bash
   cd LoongMilkGym_MyProject_FrontEnd
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   _The frontend will run at `http://localhost:5173`._

---

## 🛡️ License

This project is open-source and available under the **ISC License**.

---

_Developed with passion for Fitness & Premium Software Engineering._ 💪
