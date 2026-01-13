# GigFlow - Freelance Marketplace Platform

GigFlow is a modern, full-stack freelance marketplace application connecting clients with freelancers. It features real-time updates, a premium UI, and a robust RESTful API.

## 🚀 Features

*   **Role-based Auth**: Client and Freelancer roles. Differentiated dashboards.
*   **Gig Management**: Create, view, search, and manage detailed gig postings.
*   **Bidding System**: Freelancers can bid on gigs; Clients can review and hire.
*   **Modern UI**: Built with React, Tailwind CSS, and a premium "High Contrast" (White/Black) aesthetic.
*   **Real-time Ready**: Architecture supports socket.io (server setup included).
*   **Secure**: JWT-based authentication with HTTP-only cookies.

## 🛠️ Tech Stack

*   **Frontend**: React (Vite), TypeScript, Tailwind CSS, Axios, React Router v6.
*   **Backend**: Node.js, Express.js, TypeScript.
*   **Database**: MongoDB.
*   **DevOps**: Docker, Docker Compose, Nginx.

## 📋 Prerequisites

*   **Node.js** (v18 or v20 recommended)
*   **npm** or **yarn**
*   **MongoDB** (running locally or via Atlas)
*   **Docker Desktop** (optional, for Docker setup)

---

## 🏗️ Local Setup (Manual)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd gigflow
```

### 2. Backend Setup
1.  Navigate to the root directory.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root directory (optional, defaults are set in code for dev):
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/gigflow
    JWT_SECRET=your_super_secret_key
    CLIENT_URL=http://localhost:5173
    ```
4.  Start the server:
    ```bash
    npm run dev
    ```
    Server runs at `http://localhost:5000`.

### 3. Frontend Setup
1.  Navigate to the client directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    App runs at `http://localhost:5173`.

---

## 🐳 Docker Setup (Automated)

Run the entire application (Frontend + Backend + Database) with a single command.

### 1. Build and Run
Ensure Docker Desktop is running, then execute:

```bash
docker-compose up --build
```

This will:
*   Start **MongoDB** on port `27017`.
*   Start the **Backend API** on port `5000`.
*   Start the **Frontend (Nginx)** on port `80`.

### 2. Access the App
Open your browser and navigate to:
**http://localhost**

---

## 📂 Project Structure

```
gigflow/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components (Navbar, Layout)
│   │   ├── pages/          # Page components (Auth, Dashboard, Gigs, Bids)
│   │   ├── services/       # API integration (Axios)
│   │   └── ...
│   ├── Dockerfile          # Frontend Docker config
│   └── nginx.conf          # Nginx config for SPA
├── src/                    # Express Backend
│   ├── modules/            # Feature-based architecture (Auth, Gigs, Bids)
│   ├── config/             # DB and App config
│   └── server.ts           # Entry point
├── Dockerfile              # Backend Docker config
├── docker-compose.yml      # Container orchestration
└── ...
```

## 🧪 API Endpoints (Snapshot)

*   `POST /api/auth/register` - Register new user
*   `POST /api/auth/login` - Login
*   `GET /api/gigs` - Fetch all gigs
*   `POST /api/gigs` - Create a gig (Client only)
*   `POST /api/bids` - Submit a bid (Freelancer only)

## 🤝 Contributing

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---
**Happy Coding!** 🚀
