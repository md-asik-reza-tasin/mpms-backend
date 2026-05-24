# How MPMS Backend Works

This backend is the API server for the **Minimal Project Management System (MPMS)**.

The frontend sends requests to the backend, and the backend handles:

- Authentication
- Role-based access
- Database operations
- Project management
- Sprint management
- Task workflow
- Team management
- Reports

Basic flow:

```txt
Frontend → Backend API → Controller → Database → Response → Frontend
```

Example:

```txt
Admin creates a project
↓
Frontend sends POST /api/projects
↓
Backend checks JWT token
↓
Backend checks role permission
↓
Controller saves project in MongoDB
↓
Backend sends response
↓
Frontend shows the project
```

---

## 1. Server Starts First

The main entry file is:

```txt
src/server.ts
```

When the server starts, it does these things:

```txt
1. Loads environment variables from .env
2. Connects to MongoDB Atlas
3. Creates the Express app
4. Adds middleware
5. Mounts API routes
6. Starts listening on a port
```

Local server:

```txt
http://localhost:5000
```

Production server:

```txt
https://mpms-backend-fis1.onrender.com
```

---

## 2. MongoDB Connection

The backend connects to MongoDB Atlas using the `MONGO_URI`.

The database connection flow:

```txt
Backend starts
↓
Mongoose reads MONGO_URI
↓
Connects to MongoDB Atlas
↓
Backend becomes ready to read/write data
```

MongoDB stores data in collections like:

```txt
users
projects
sprints
tasks
```

Collections are created automatically when data is inserted through Mongoose models.

---

## 3. Models Define Database Structure

Models are the database blueprints.

They define what kind of data each collection should store.

---

## User Model

The User model stores team member information.

Example fields:

```txt
name
email
password
role
department
skills
```

User roles:

```txt
Admin
Member
```

---

## Project Model

The Project model stores project information.

Example fields:

```txt
title
client
description
startDate
endDate
budget
status
thumbnail
createdBy
```

Project status can be:

```txt
planned
active
completed
archived
```

---

## Sprint Model

The Sprint model stores milestone/sprint information under a project.

Example fields:

```txt
projectId
title
sprintNumber
startDate
endDate
order
```

Each sprint belongs to one project.

---

## Task Model

The Task model stores task information.

Example fields:

```txt
projectId
sprintId
title
description
assignees
estimateHours
priority
status
dueDate
attachments
subtasks
comments
activityLog
timeLogs
```

Each task belongs to:

```txt
One project
One sprint
One or more assigned members
```

---

## 4. Routes Receive API Requests

Routes define the API URLs.

Example routes:

```txt
POST /api/auth/login
GET /api/projects
POST /api/projects
GET /api/tasks
PATCH /api/tasks/:id/status
```

Routes mainly connect API endpoints with controller functions.

Example:

```txt
POST /api/projects → createProject controller
GET /api/projects → getProjects controller
GET /api/tasks → getTasks controller
```

---

## 5. Controllers Handle Main Logic

Controllers contain the main business logic.

Example: create project flow:

```txt
Request comes to POST /api/projects
↓
Controller reads request body
↓
Controller validates required fields
↓
Controller checks logged-in user
↓
Controller saves project to MongoDB
↓
Controller returns response
```

Controllers handle:

```txt
Create
Read
Update
Delete
Filter
Status update
Comment creation
Time log creation
Report calculation
```

---

## 6. Authentication Works with JWT

Authentication is handled using JWT.

Login flow:

```txt
User enters email and password
↓
Frontend sends POST /api/auth/login
↓
Backend checks if email exists
↓
Backend compares password using bcrypt
↓
If password is correct, backend creates JWT token
↓
Frontend stores token
```

After login, frontend sends the token with protected API requests:

```txt
Authorization: Bearer YOUR_JWT_TOKEN
```

The backend checks this token before allowing access to private routes.

---

## 7. Password Security

Passwords are not stored directly.

When a user registers:

```txt
Plain password
↓
bcrypt hashes the password
↓
Hashed password is saved in MongoDB
```

During login:

```txt
User enters password
↓
bcrypt compares entered password with hashed password
↓
If matched, login succeeds
```

This keeps user passwords safer.

---

## 8. Role-Based Access Control

The project uses two roles:

```txt
Admin
Member
```

---

## Admin Permission

Admin can:

```txt
Manage projects
Manage sprints
Manage tasks
Manage team members
View reports
Approve review tasks as done
```

Admin routes include:

```txt
/dashboard
/projects
/tasks
/team
/reports
```

---

## Member Permission

Member can:

```txt
View assigned tasks
View assigned projects
Update task status
Add comments
Add time logs
Track progress
```

Member routes include:

```txt
/my-tasks
/my-projects
/progress
```

---

## Access Control Flow

When a protected API is called:

```txt
Request comes with JWT token
↓
Auth middleware verifies token
↓
User information is attached to request
↓
Role middleware checks permission
↓
Controller runs if permission is valid
```

If token is missing:

```txt
401 Unauthorized
```

If role is not allowed:

```txt
403 Forbidden
```

---

## 9. Project, Sprint, and Task Relationship

The main structure is:

```txt
Project
  └── Sprint
        └── Task
```

Example:

```txt
Project: MPMS Frontend Development

Sprint 1: Setup & Core Structure
  - Task: Create Login Page
  - Task: Build Dashboard Layout

Sprint 2: Task Workflow
  - Task: Add Comments
  - Task: Add Time Logs
```

In database:

```txt
Sprint has projectId
Task has projectId
Task has sprintId
```

This helps the backend know:

```txt
Which sprint belongs to which project
Which task belongs to which sprint
Which task belongs to which project
```

---

## 10. Task Workflow

Task status can be:

```txt
todo
in_progress
review
done
```

Member workflow:

```txt
todo → in_progress → review
```

Admin approval workflow:

```txt
review → done
```

A Member cannot directly approve a task as done if it requires review.

The Member sends the task to review, then Admin approves it.

---

## 11. Comments

Each task can have comments.

Comment example:

```txt
Login page UI is completed. Please review.
```

Comment data usually stores:

```txt
userId
message
createdAt
```

Comments help team members communicate inside a task.

---

## 12. Time Logs

Each task can have time logs.

Time log example:

```txt
3 hours - Worked on login UI and API integration
```

Time log data usually stores:

```txt
userId
hours
note
date
```

Time logs help calculate work effort and report summaries.

---

## 13. Activity Logs

Activity logs track task history.

Example:

```txt
Status changed from todo to in_progress
Status changed from in_progress to review
Status changed from review to done
```

Activity logs help show what happened inside a task.

---

## 14. Reports

Reports are calculated from projects, tasks, and time logs.

Project report can show:

```txt
Total tasks
Completed tasks
Remaining tasks
Progress percentage
Total time logged
```

Example:

```txt
Total tasks: 10
Completed tasks: 6
Remaining tasks: 4
Progress: 60%
Total time logged: 32 hours
```

Progress formula:

```txt
progressPercent = completedTasks / totalTasks * 100
```

User report can show:

```txt
Assigned tasks
Completed tasks
Pending tasks
Total time logged
```

---

## 15. Full Backend Workflow Example

### Admin Flow

```txt
Admin logs in
↓
Admin gets JWT token
↓
Admin creates project
↓
Admin creates sprint under project
↓
Admin creates task under sprint
↓
Admin assigns task to Member
```

---

### Member Flow

```txt
Member logs in
↓
Member sees assigned task
↓
Member updates status to in_progress
↓
Member adds comment
↓
Member adds time log
↓
Member moves task to review
```

---

### Admin Approval Flow

```txt
Admin opens task
↓
Admin sees task status = review
↓
Admin approves task
↓
Backend changes status to done
↓
Project progress updates
↓
Reports update automatically
```

---

## 16. API Response Flow

Every successful API request returns data to the frontend.

Example:

```txt
Frontend requests GET /api/projects
↓
Backend gets projects from MongoDB
↓
Backend returns project list
↓
Frontend displays project cards/table
```

For errors, backend sends clean error responses.

Example:

```json
{
  "message": "Project not found"
}
```

---

## 17. Why This Backend Is Useful

This backend makes the frontend dynamic.

That means:

```txt
Projects are not hardcoded
Sprints are not hardcoded
Tasks are not hardcoded
Users are not hardcoded
Reports are calculated from real data
```

The frontend only displays and interacts with data from the backend.

---

## Summary

The MPMS backend works as a complete API layer between the frontend and MongoDB.

It handles:

```txt
Authentication
Authorization
Projects
Sprints
Tasks
Team members
Comments
Time logs
Activity logs
Reports
```

The main flow is:

```txt
User logs in
↓
JWT token is created
↓
Frontend sends token with requests
↓
Backend checks permission
↓
Backend reads/writes MongoDB data
↓
Frontend displays updated data
```
