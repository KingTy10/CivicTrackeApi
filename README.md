CIVICTRACK
A MODERN FULL-STACK CIVIC ISSUE TRACKING SYSTEM
BUILT WITH ASP.NET CORE API & REACT

🌟 Overview
CivicTrack is a full-stack web application designed to bridge the gap between residents and city services. Residents can report infrastructure issues (like potholes or broken streetlights), while city workers can manage and resolve these requests through a secure, role-based workflow.

Originally developed at Columbia College Chicago in collaboration with Luis Martinez, the project has evolved from a Razor Pages prototype into a decoupled React + REST API architecture.

🚀 Key Features
Role-Based Access Control (RBAC): Distinct workflows for Residents (Submit/Cancel), Workers (Resolve), and Admins.

JWT Authentication: Secure, stateless authentication using JSON Web Tokens.

Service Request Lifecycle: Real-time tracking from Pending ➔ In Progress ➔ Resolved or Cancelled.

Modern UI: A responsive React dashboard built with Vite for high-performance development.

Persistent Storage: Entity Framework Core with SQL Server for robust data management.

🛠 Technology Stack
Backend
ASP.NET Core 9 (Web API)

Entity Framework Core (SQL Server)

ASP.NET Identity (Authentication & Authorization)

Swagger/OpenAPI (API Documentation)

Frontend
React 18 (Functional Components & Hooks)

Vite (Build Tool)

Axios (API Client with Interceptors)

CSS3 (Responsive Design)

📁 Project Structure
Plaintext
CivicTrakerProj/
├── src/
│   ├── CivicTrack.Api     # ASP.NET Core API (Controllers, Auth, JWT)
│   ├── CivicTrack.Data    # EF Core, DbContext, Migrations, Entities
│   └── CivicTrack.Ui      # React Frontend (Vite, Axios, Dashboard)
├── CivicTrack.sln         # Visual Studio Solution
└── README.md
🏗 Responsibilities & Contributions
Architected the Backend: Designed the ServiceRequest entity and implemented a Repository-style pattern for data access.

Security Implementation: Configured JWT middleware and customized Identity roles to restrict API access based on user type.

React Development: Built a dynamic frontend that handles login state, local storage persistence, and real-time UI updates.

CORS & Integration: Configured Cross-Origin Resource Sharing policies to bridge the communication between the UI and API.

Database Management: Managed schema migrations and optimized SQL queries using EF Core.

🚦 Getting Started
1. Database Setup
Ensure you have SQL Server Express/LocalDB installed.

PowerShell
cd src/CivicTrack.Api
dotnet ef database update
2. Run the API
PowerShell
dotnet run
# API will listen on http://localhost:5038
3. Run the Frontend
PowerShell
cd src/CivicTrack.Ui
npm install
npm run dev
# UI will be available at http://localhost:5173
💡 Challenges Overcome
CORS Issues: Successfully resolved cross-origin blocks when transitioning from a monolithic Razor app to a decoupled React app.

Stateless Auth: Implemented JWT interceptors in React to ensure the "Bearer" token is automatically attached to every protected API request.

Role Logic: Developed custom authorization policies to ensure Residents can only cancel their own requests, while Workers retain global management permissions.

Collaborators: Luis Martinez (Columbia College Chicago)
