# 🧩 Trello-style Frontend

A modern Trello-style task management frontend built with **React 19**, **TypeScript**, and **Vite**.  
The application supports **real-time collaboration** via **Socket.IO**, provides secure authentication flows (including password reset), and delivers a responsive, user-friendly interface optimized for team collaboration.

---

## ✨ Features

### 🔐 Authentication & Security
- User authentication: sign up / sign in / refresh token / logout.
- **Change password** for authenticated users.
- **Forgot password & reset password** via email verification link.
- Secure JWT-based authentication.
- Google OAuth sign-in (optional).

### ⚡ Real-time Collaboration (Socket.IO)
- Real-time synchronization of boards, lists, and cards.
- Instant updates during drag-and-drop actions.
- Real-time comments, member assignments, and labels.
- Automatic UI updates when changes are made by other users.

### 📋 Board / List / Card Management
- Full CRUD operations.
- Drag & drop using **dnd-kit**.
- Pagination and search.
- Board-level permissions: **owner / editor / viewer**.
- Invite members via email or shareable links.

### 🗂️ Card Management
- Member assignments and labels.
- Checklists.
- Due dates.
- Comments.
- File attachments.

### 🎨 UI & UX
- Upload and update user avatars.
- Select board background images from **Unsplash**.
- Fully responsive UI (desktop / tablet / mobile).
- Dark mode support.

---

## 🧰 Technology Stack

### Core
- **React 19**
- **TypeScript**
- **Vite**

### UI / Styling
- **Mantine** (core, hooks, form, dates, modals, notifications)
- **Tailwind CSS**
- **clsx**
- **Tabler Icons**

### State & Data
- **Zustand** – global state management
- **Axios** – REST API client
- **Socket.IO Client** – real-time communication

### UX & Utilities
- **dnd-kit** – drag & drop for boards, lists, and cards
- **dayjs** – date & time utilities
- **lodash** – helper utilities
- **react-toastify** – toast notifications

### Routing
- **React Router DOM**

---

## 📦 Environment Requirements

- Node.js >= 18
- Running NestJS backend with REST API and Socket.IO enabled
- Modern browsers (Chrome, Edge, Firefox)

---

## ⚙️ Environment Configuration

Create a `.env` file in the project root:

```env
VITE_URL_API=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
