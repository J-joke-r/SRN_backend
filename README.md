# 🛠️ Personal Details Collection System – Backend

This repository contains the **backend API** for the **Personal Details Collection System**, a secure web-based application that allows users to submit personal information and enables administrators to manage user records and announcements.

The backend is built using **Node.js and Express**, integrates with **Supabase Authentication**, and exposes **secure REST APIs** consumed by the frontend (Next.js application).

---

## 🔗 Project Architecture

This project is divided into **two separate repositories**:

- **Frontend (separate repository)**  
  - Built using Next.js 13 (App Router)  
  - Handles UI, routing, authentication flows, and dashboards  

- **Backend (this repository)**  
  - Node.js + Express REST API  
  - Verifies Supabase JWT tokens  
  - Handles role-based authorization  
  - Manages database operations and announcements  

⚠️ **This backend must be running for the frontend application to function properly.**

---

## 🚀 Features

### Authentication & Authorization
- Supabase JWT token verification
- Role-based access control:
  - Normal users
  - Admin users

### User Management
- Create and update personal details
- Fetch user-specific data securely
- Admin access to:
  - View all user submissions
  - Edit user records
  - Delete user records

### 📢 Announcements Module
- Admins can:
  - Create announcements
  - Update existing announcements
  - Delete announcements
- Users can:
  - View announcements from the frontend dashboard
- Announcements APIs are protected using role-based authorization

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Authentication:** Supabase Auth (JWT verification)
- **Database:** Supabase (PostgreSQL)
- **Security:** Middleware-based token & role validation
- **API Type:** REST

---

## 📁 Project Structure

```text
/src
  /routes
    auth.routes.js
    user.routes.js
    admin.routes.js
    announcement.routes.js
  /controllers
  /middlewares
    auth.middleware.js
    role.middleware.js
  /services
  /config
server.js
```

## 🔐 API Security Flow

1. Frontend sends requests with Supabase JWT token in request headers  
2. Backend middleware verifies the JWT token  
3. User role is validated for protected routes  
4. Authorized data is processed and returned  

---

## 🔗 Related Repository

- **Frontend Repository:**  
  👉 https://github.com/your-username/frontend-repo-name

---

## 👨‍💻 Author

**Manish R**  
Aspiring Full Stack Developer  

---

## 📌 Future Enhancements(All completed and updated in code)

- Pagination and filtering APIs  
- CSV export endpoints for admin data  
- Announcement scheduling & expiry  
- Audit logs for admin actions  
- Rate limiting and request validation  
