# **CIVICTRACK**
### **A MODERN FULL-STACK CIVIC ISSUE TRACKING SYSTEM**
**BUILT WITH ASP.NET CORE API & REACT**

---

## **OVERVIEW**
**CIVICTRACK** is a full-stack web application designed to bridge the gap between residents and city services. Residents can report infrastructure issues (like potholes or broken streetlights), while city workers can manage and resolve these requests through a secure, role-based workflow.

Originally developed at **COLUMBIA COLLEGE CHICAGO** in collaboration with **LUIS MARTINEZ**, the project has evolved from a Razor Pages prototype into a decoupled **REACT + REST API** architecture.

---

## **KEY FEATURES**
* **ROLE-BASED ACCESS CONTROL (RBAC):** Distinct workflows for Residents (Submit/Cancel), Workers (Resolve), and Admins.
* **JWT AUTHENTICATION:** Secure, stateless authentication using JSON Web Tokens.
* **SERVICE REQUEST LIFECYCLE:** Real-time tracking from **PENDING ➔ IN PROGRESS ➔ RESOLVED or CANCELLED**.
* **MODERN UI:** A responsive React dashboard built with Vite for high-performance development.
* **PERSISTENT STORAGE:** Entity Framework Core with SQL Server for robust data management.

---

## **🛠 TECHNOLOGY STACK**

### **BACKEND**
* **ASP.NET CORE 9** (Web API)
* **ENTITY FRAMEWORK CORE** (SQL Server)
* **ASP.NET IDENTITY** (Authentication & Authorization)
* **SWAGGER/OPENAPI** (API Documentation)

### **FRONTEND**
* **REACT 18** (Functional Components & Hooks)
* **VITE** (Build Tool)
* **AXIOS** (API Client with Interceptors)
* **CSS3** (Responsive Design)

---

## **📁 PROJECT STRUCTURE**
```plaintext
CivicTrakerProj/
├── src/
│   ├── CivicTrack.Api      # ASP.NET CORE API (CONTROLLERS, AUTH, JWT)
│   ├── CivicTrack.Data     # EF CORE, DBCONTEXT, MIGRATIONS, ENTITIES
│   └── CivicTrack.Ui       # REACT FRONTEND (VITE, AXIOS, DASHBOARD)
├── CivicTrack.sln          # VISUAL STUDIO SOLUTION
└── README.md
