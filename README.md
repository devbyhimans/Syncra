```markdown
# Syncra

![Syncra Banner](screenshot/banner.png)

> **Syncra — Align. Collaborate. Achieve.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-Vite-blue)](https://reactjs.org/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-white)](https://www.prisma.io/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]

---

## 📌 Overview

**Syncra** is a powerful, full-stack **Project Management & Collaboration Platform** designed to streamline teamwork. It provides a centralized workspace for planning, tracking, and executing projects with real-time collaboration and automated workflows.

Our goal is to reduce chaos, improve visibility, and ensure **no task or deadline is ever missed**.

---

## 📸 Screenshots

Here's a glimpse of Syncra in action.

| **Dashboard View** | **Projects Overview** |
| :---: | :---: |
| ![Dashboard](screenshot/Dashboard.png) | ![Projects](screenshot/projects.png) |
| *Central hub for all workspaces and activity.* | *Manage and track project status & priorities.* |

| **Task Details** | **Team Management** |
| :---: | :---: |
| ![Task Details](screenshot/taskdetails.png) | ![Team Details](screenshot/teamdetails.png) |
| *In-depth view of task attributes and deadlines.* | *Manage team members, roles, and invites.* |

| **Analytics & Insights** | **Task Discussion** |
| :---: | :---: |
| ![Analytics](screenshot/analytics.png) | ![Chatbox](screenshot/chatbox.png) |
| *Visual progress tracking and productivity metrics.* | *Real-time contextual collaboration on tasks.* |

---

## 🌟 Key Features

### 🛠 Project & Workflow Management
- **Workspace-based organization** for different teams or departments.
- Create projects with specific goals and timelines.
- Comprehensive **task management**: assignees, priority (🔴🟡🟢), status, and due dates.

### 🤝 Collaboration & Communication
- **Invite team members** directly via email.
- **Real-time task comments** for contextual discussions.
- **Role-Based Access Control (RBAC)** for Admins and Members.

### 🤖 Automation & Smart Notifications
- **Automated Deadline Reminders:** System sends email alerts **24 hours before** a task is due (powered by Inngest cron jobs).
- Instant notifications for project invites and task assignments via **Nodemailer & Brevo SMTP**.

### 🎨 Modern User Experience
- Responsive, interactive UI built with **React (Vite)** and **Tailwind CSS**.
- Seamless **Dark & Light mode** theming.
- Secure, hassle-free authentication using **Clerk**.

---

## 🧠 System Design

This high-level architecture demonstrates how Syncra's components interact to deliver a scalable and reliable experience.

![System Architecture Diagram](https://via.placeholder.com/800x450?text=System+Architecture+Diagram+-+Replace+with+Image)

- **Auth Layer:** Clerk handles secure user authentication and session management.
- **API Layer:** Express.js REST APIs protected by authentication middleware.
- **Database Layer:** PostgreSQL with Prisma ORM for type-safe and efficient data querying.
- **Async Jobs:** Inngest manages background tasks like scheduled email reminders.
- **Notifications:** Nodemailer integrates with Brevo SMTP for transactional emails.
- **Frontend:** React (Vite) consumes APIs and renders a dynamic, role-aware UI.

---

## 🗂 Database Design (ER Overview)

The database schema is designed for flexibility and relational integrity.

```text
User 
 └── WorkspaceMember
      └── Workspace
           └── Project
                └── Task
                     └── Comment

```
![ER Diagram](screenshot/Er_diagram.png)

* **Users** can be members of multiple **Workspaces**.
* **Workspaces** contain multiple **Projects**.
* **Projects** are broken down into **Tasks**.
* **Tasks** have properties like status and deadlines, and support threads of **Comments**.

---

## 🏗 Architecture & Tech Stack

Syncra follows a modern monorepo structure.

```text
Syncra/
├── backend/                # Node.js & Express API
│   ├── configs/            # Services setup (Prisma, SMTP)
│   ├── controllers/        # Business logic & request handling
│   ├── inngest/            # Background job functions
│   ├── middlewares/        # Auth verification
│   ├── prisma/             # Database schema & migrations
│   └── server.js           # Application entry point
│
└── frontend/               # React (Vite) Client
    ├── src/
    │   ├── components/     # Reusable UI elements
    │   ├── features/       # Redux state slices
    │   └── pages/          # Application views
    └── vite.config.js

```

### Technology Stack

| Category | Technologies |
| --- | --- |
| **Frontend** | React.js (Vite), Redux Toolkit, Tailwind CSS, Clerk Auth |
| **Backend** | Node.js, Express.js, Prisma ORM, Inngest, Nodemailer |
| **Database** | PostgreSQL |
| **DevOps** | Vercel (Deployment ready), Git |

---

## 📡 API Overview

All APIs are RESTful and secured via Clerk authentication. **Base URL:** `/api/v1`

| Module | Endpoint Path | Description |
| --- | --- | --- |
| **Auth** | `/auth` | User authentication and session handling. |
| **Workspaces** | `/workspaces` | Create, manage workspaces and invites. |
| **Projects** | `/projects` | CRUD operations for projects. |
| **Tasks** | `/tasks` | Manage task lifecycle, assignments, deadlines. |
| **Comments** | `/comments` | Post and retrieve comments on tasks. |
| **Analytics** | `/analytics` | Fetch project progress and insights. |

---

## 🚀 Getting Started

Run Syncra locally in a few simple steps.

### Prerequisites

* Node.js (v16+) & npm
* PostgreSQL Database
* Clerk Account (for auth keys)
* Brevo / SMTP Account (for emails)

### Installation

#### 1️⃣ Clone the Repository

```bash
git clone [https://github.com/devbyhimans/Syncra.git](https://github.com/devbyhimans/Syncra.git)
cd Syncra

```

#### 2️⃣ Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install

```

Create a `.env` file and add your credentials:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/syncra_db"
CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
SMTP_HOST="smtp-relay.brevo.com"
SMTP_PORT=587
SMTP_USER="your_email@example.com"
SMTP_PASS="your_smtp_password"
SENDER_EMAIL="no-reply@syncra.com"

```

Run database migrations and start the server:

```bash
npx prisma migrate dev --name init
npm start

```

#### 3️⃣ Frontend Setup

Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd ../frontend
npm install

```

Create a `.env` file for the frontend:

```env
VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."

```

Start the development server:

```bash
npm run dev

```

Visit `http://localhost:5173` to use Syncra!

---

## 🔒 Security

* **Authentication:** Secured by Clerk, handling user sessions and identities.
* **Authorization:** API routes are protected by middleware, ensuring only authenticated users access data.
* **RBAC:** Critical actions (e.g., workspace settings) are restricted to Admins.
* **Data Validation:** Inputs are validated to prevent common injection attacks.

---

## 🧭 Future Roadmap

* [ ] **In-App Notifications:** Real-time alerts in addition to emails.
* [ ] **File Attachment Support:** Upload files to tasks and projects.
* [ ] **Calendar Integration:** Sync tasks with Google/Outlook calendars.
* [ ] **AI-Powered Insights:** Smart predictions for project timelines.

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository, create a feature branch, and submit a Pull Request.

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 📞 Contact

**Himanshu**

* **GitHub:** [@devbyhimans](https://github.com/devbyhimans)
* **Project Link:** [https://github.com/devbyhimans/Syncra](https://github.com/devbyhimans/Syncra)

---

<p align="center">Built with ❤️ by Himanshu</p>

```

```
