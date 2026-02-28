# KanbanFlow – Kanban ToDo Dashboard

A beautiful Kanban-style task management application built with **Next.js 14**, **React Query v5**, **shadcn/ui**, **Tailwind CSS**, **dnd-kit**, and **json-server** as the mock API.

---

## Features

- 📋 **4 Kanban columns** – Backlog, In Progress, Review, Done
- ✏️ **Create, edit, delete** tasks via modal dialogs
- 🖱️ **Drag & drop** tasks between columns
- 🔍 **Debounced search** – filter tasks by title or description in real time
- 📄 **"Load More" pagination** per column (powered by `useInfiniteQuery`)
- ⚡ **React Query caching** – smart cache invalidation on every mutation
- 🌙 **Dark-mode-first** design

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18 + |
| npm | 9 + |

---

## Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Start the mock API (json-server)

Open a **separate terminal** in the `kanban-app` directory:

```bash
npx json-server db.json --port 4000
```

> The API will be available at **http://localhost:4000/tasks**

### 3. Start the Next.js development server

In another terminal:

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## Project Structure

```
kanban-app/
├── db.json                        # json-server seed data (24 tasks)
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout – Providers + Inter font
│   │   ├── page.tsx               # Entry point → <KanbanBoard />
│   │   └── globals.css            # Tailwind import + scrollbar style
│   ├── components/
│   │   ├── Providers.tsx          # React Query QueryClientProvider
│   │   ├── KanbanBoard.tsx        # DndContext, search state, column grid
│   │   ├── KanbanColumn.tsx       # Droppable column + useInfiniteQuery
│   │   ├── TaskCard.tsx           # Draggable card + edit / delete
│   │   ├── TaskDialog.tsx         # Create / edit modal form
│   │   ├── DeleteConfirmDialog.tsx
│   │   └── SearchBar.tsx          # Debounced search input
│   ├── lib/
│   │   └── api.ts                 # Axios CRUD helpers
│   └── types/
│       └── task.ts                # Task & Column TypeScript types
└── README.md
```

---

## API Endpoints (json-server)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks?column=backlog&_page=1&_limit=6` | Paginated tasks per column |
| GET | `/tasks?q=search+term` | Full-text search |
| POST | `/tasks` | Create a task |
| PUT | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 14 (App Router) | Framework |
| TypeScript | Type safety |
| Tailwind CSS | Utility-first styling |
| @tanstack/react-query v5 | Server state & caching |
| @dnd-kit/core + @dnd-kit/sortable | Drag-and-drop |
| axios | HTTP client |
| json-server | Mock REST API |
| lucide-react | Icons |
