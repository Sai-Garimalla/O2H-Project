# Mini Project Management Portal

A full-stack web application for managing project tasks, built as part of the o2h hiring assessment. 

## Tech Stack
* **Frontend:** React.js, Tailwind CSS, Axios, React Router Dom
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Mongoose)

## Features Included
* View all tasks in a responsive grid layout.
* Dashboard Statistics (Total, Pending, Completed tasks count).
* Add new tasks with frontend & backend validation (Title required, Description min 20 chars).
* Mark tasks as completed.
* Delete tasks.
* Filter tasks by status (All, Pending, In Progress, Completed).
* **Bonus Feature:** System-wide Dark Mode Toggle.
* Loading states and empty data states handled cleanly.

## Setup Steps

### 1. Clone the repository
\`\`\`bash
git clone <your-github-repo-link>
cd project-root
\`\`\`

### 2. Backend Setup
\`\`\`bash
cd backend
npm install
\`\`\`
* Ensure MongoDB is running locally on port `27017` or update the `MONGO_URI` in `.env`.
\`\`\`bash
node server.js
\`\`\`
* Server runs on `http://localhost:5000`

### 3. Frontend Setup
Open a new terminal window:
\`\`\`bash
cd frontend
npm install
npm start
\`\`\`
* Application runs on `http://localhost:3000`

## API Documentation

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/tasks` | Get all tasks | None |
| POST | `/tasks` | Create a new task | `{ title: String, description: String, status: String }` |
| PUT | `/tasks/:id` | Update task status | `{ status: String }` |
| DELETE | `/tasks/:id` | Delete a task | None |

## Assumptions Made
* Assumed MongoDB is preferable for a rapid-development MERN stack assessment.
* "In Progress" was added as a logical intermediate status alongside Pending and Completed.
* Decided to implement a dashboard summary (Stats) to cover elements of the "Advanced Version" requirements.