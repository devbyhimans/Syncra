<p align="center">
  <img src="https://raw.githubusercontent.com/devbyhimans/Syncra/main/screenshots/banner.png" />
</p>

<h1 align="center">Syncra</h1>

<p align="center">
  <b>Align · Collaborate · Achieve</b><br/>
  <sub>Where teams move in sync — with clarity, control, and confidence.</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v18+-green" />
  <img src="https://img.shields.io/badge/React-Vite-blue" />
  <img src="https://img.shields.io/badge/ORM-Prisma-white" />
  <img src="https://img.shields.io/badge/License-MIT-yellow" />
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen" />
</p>

---

## 📌 Overview

**Syncra** is a full-stack **Project Management & Collaboration Platform** designed to help teams plan, track, and execute work efficiently.

It centralizes **workspaces, projects, tasks, communication, analytics, and automation** into a single system—reducing chaos and ensuring **no task or deadline is missed**.

---

## 📸 Screenshots

### 📊 Dashboard & Projects
<p align="center">
  <img src="https://raw.githubusercontent.com/devbyhimans/Syncra/main/screenshots/Dashboard.png" width="48%" />
  <img src="https://raw.githubusercontent.com/devbyhimans/Syncra/main/screenshots/projects.png" width="48%" />
</p>

### ✅ Tasks & Team Management
<p align="center">
  <img src="https://raw.githubusercontent.com/devbyhimans/Syncra/main/screenshots/taskdetails.png" width="48%" />
  <img src="https://raw.githubusercontent.com/devbyhimans/Syncra/main/screenshots/teamdetails.png" width="48%" />
</p>

### 📈 Analytics & Collaboration
<p align="center">
  <img src="https://raw.githubusercontent.com/devbyhimans/Syncra/main/screenshots/analytics.png" width="48%" />
  <img src="https://raw.githubusercontent.com/devbyhimans/Syncra/main/screenshots/chatbox.png" width="48%" />
</p>

---

## 🌟 Key Features

### 🛠 Project & Workflow Management
- Workspace-based organization for teams
- Project creation with defined goals
- Task management with assignees, priority, status, and due dates
- Clear ownership and progress visibility

### 🤝 Collaboration & Communication
- Invite members via email
- Real-time task-level comments
- Role-Based Access Control (Admin / Member)

### 🤖 Automation & Smart Notifications
- Automated email reminders **24 hours before task deadlines**
- Background cron jobs using **Inngest**
- Transactional emails via **Nodemailer + Brevo SMTP**

### 🎨 Modern User Experience
- Responsive UI with **React (Vite)** and **Tailwind CSS**
- Dark & Light mode support
- Secure authentication powered by **Clerk**
- **Public Pages:** Complete with landing, about, contact, privacy, and terms pages.

---

## 🧠 System Design (High Level)

- **Auth Layer:** Clerk handles authentication and session management
- **API Layer:** Express.js REST APIs with middleware protection
- **Database Layer:** PostgreSQL with Prisma ORM
- **Async Jobs:** Inngest for reminders and background workflows
- **Notifications:** Nodemailer integrated with Brevo SMTP
- **Frontend:** React (Vite) with Redux Toolkit

---

## 🗂 Database Design (ER Diagram)

```mermaid
erDiagram
    USER ||--o{ WORKSPACE_MEMBER : belongs_to
    WORKSPACE ||--o{ WORKSPACE_MEMBER : has
    WORKSPACE ||--o{ PROJECT : contains
    PROJECT ||--o{ TASK : has
    TASK ||--o{ COMMENT : receives
    USER ||--o{ TASK : assigned_to
    USER ||--o{ COMMENT : writes
    TASK ||--o{ SUBTASK : has
    TASK ||--o{ ATTACHMENT : contains
    USER ||--o{ NOTIFICATION : receives
    WORKSPACE ||--o{ ACTIVITY_LOG : logs

    USER {
      string id
      string email
      string name
    }

    WORKSPACE {
      string id
      string name
    }

    PROJECT {
      string id
      string name
    }

    TASK {
      string id
      string title
      string status
      string priority
      datetime dueDate
    }

    COMMENT {
      string id
      string content
    }
```

## 🗂 Database Design (ER Overview)

The database schema is designed for flexibility and relational integrity.

```text
User 
 ├── WorkspaceMember
 │    └── Workspace
 │         ├── Project
 │         │    └── Task
 │         │         ├── Comment
 │         │         ├── Subtask
 │         │         └── Attachment
 │         └── ActivityLog
 └── Notification
```
<p align="center">
 <img src="https://raw.githubusercontent.com/devbyhimans/Syncra/main/screenshots/Er_diagram.png" width="48%" />
</p>


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
| **Subtasks** | `/subtasks` | Manage subtasks within a parent task. |
| **Comments** | `/comments` | Post and retrieve comments on tasks. |
| **Attachments** | `/attachments` | Upload and manage task file attachments. |
| **Notifications** | `/notifications` | Fetch and mark in-app notifications as read. |
| **Activity** | `/activity` | Fetch workspace activity audit logs. |
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

* [x] **In-App Notifications:** Real-time alerts in addition to emails.
* [x] **File Attachment Support:** Upload files to tasks and projects.
* [x] **Public Pages:** About, Contact, Privacy Policy, Terms of Service.
* [ ] **Calendar Integration:** Sync tasks with Google/Outlook calendars.
* [ ] **AI-Powered Insights:** Smart predictions for project timelines.

---

## 🤝 Contributing

Contributions are welcome! Please review our [Contributing Guidelines](CONTRIBUTING.md) before you start. Feel free to fork the repository, create a feature branch, and submit a Pull Request.
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
