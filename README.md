# 🧩 Krello Frontend (Trello-style Task Management)

[![React](https://img.shields.io/badge/React-19.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Mantine](https://img.shields.io/badge/Mantine-8.3-339AF0?style=for-the-badge&logo=mantine&logoColor=white)](https://mantine.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/State-Zustand_5.0-443e38?style=for-the-badge)](https://zustand-demo.pmnd.rs/)

> A high-performance, real-time Trello clone web application built with **React 19**, **TypeScript**, **Vite**, **Mantine UI 8**, and **Socket.IO**. Designed for seamless team collaboration, drag-and-drop workflow management, and instant multi-user state synchronization.

---

## 📖 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [⚙️ Environment Configuration](#️-environment-configuration)
- [📜 Available Scripts](#-available-scripts)
- [🔐 Authentication \& Token Management](#-authentication--token-management)
- [⚡ Real-time Socket Protocol](#-real-time-socket-protocol)
- [🚢 Deployment](#-deployment)
- [📄 License](#-license)

---

## ✨ Features

### 🔐 Authentication & User Security
- **Robust JWT Authentication Flow**: Access & Refresh token rotation with automatic silent queue refresh on 401 response.
- **Flexible Login Options**: Password-based login with "Remember Me" toggle & Google OAuth 2.0 integration.
- **Account Management**: Self-service Sign-up, Password Reset via Email token verification, and Profile management with Avatar uploads.
- **Route Guarding**: Role-based component rendering and client-side route protection via `<RequireAuth />` middleware.

### ⚡ Real-Time Collaboration (Socket.IO)
- **Multi-User Live Sync**: Instant UI updates across connected clients when boards, lists, or cards are created, modified, or moved.
- **Presence & Typing Indicators**: Visual feedback when collaborators are interacting with specific cards.
- **Automated Reconnection**: Resilience to temporary network disruptions with auto-rejoin logic for active board rooms.

### 📋 Board, List & Card Management
- **Full Drag-and-Drop Capability**: Smooth, touch-friendly Kanban column & card dragging using `@dnd-kit` (optimized for Desktop & Mobile).
- **Board Customization**: Custom backgrounds (Unsplash API integrations or solid/gradient color themes).
- **Access Control & Invitation**: Board permission tiers (Owner, Editor, Viewer) and email / shareable link invitation workflow.
- **Rich Card Details**:
  - Custom Labels with color tagging & search/filter.
  - Checklists & Progress tracking.
  - Member Assignment & User Tagging.
  - Due Dates & Overdue Status Indicators.
  - File Attachments (Images, Documents).
  - Activity Log & Real-time Commenting System.

### 🎨 Modern UI/UX
- **Design System**: Mantine v8 component library integrated with Tailwind CSS v4.
- **Responsive Layout**: Designed for seamless usage across Desktop, Tablet, and Mobile viewports.
- **Notifications & Modals**: Instant Toast feedback via `@mantine/notifications` and global modals.
- **Push Notifications**: Firebase Cloud Messaging (FCM) integration for real-time browser notifications.

---

## 🛠️ Tech Stack

### Core Framework & Tools
- **Framework**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5.9](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 7](https://vitejs.dev/)

### UI & Styling
- **Component Library**: [Mantine UI v8](https://mantine.dev/)
- **Utility CSS**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Tabler Icons React](https://tabler.io/icons)
- **Drag & Drop**: [@dnd-kit/core](https://dndkit.com/), `@dnd-kit/sortable`

### State & API Management
- **Global State**: [Zustand v5](https://zustand-demo.pmnd.rs/) (with persistent storage middleware)
- **HTTP Client**: [Axios](https://axios-http.com/) (Custom `RestClient` singleton with request interceptors)
- **Real-Time Client**: [Socket.IO Client v4](https://socket.io/)
- **Push Messaging**: [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)

---

## 📁 Project Structure

```
Krello-frontend/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment workflow
├── public/                     # Static assets
├── src/
│   ├── api/                    # Axios client instance & service modules
│   │   ├── RestClient.ts       # Central HTTP client (Interceptors, Auth queue)
│   │   ├── authService.ts      # Auth & Profile APIs
│   │   ├── boardService.ts     # Board CRUD APIs
│   │   ├── cardService.ts      # Card CRUD APIs
│   │   ├── listService.ts      # List CRUD APIs
│   │   └── ...
│   ├── auth/                   # App Auth Initializer component
│   ├── components/             # Reusable UI Components
│   │   ├── Board/              # Kanban board, Columns, Cards, Modals
│   │   ├── ErrorBoundary/      # System runtime error fallback view
│   │   ├── Layout/             # Default, HeaderOnly, Sidebar layouts
│   │   └── Profile/            # User profile stats & activity list
│   ├── constants/              # App & Socket event constants
│   ├── firebase/               # Firebase app & Messaging setup
│   ├── hooks/                  # Custom React hooks (Sockets, Debounce, FCM)
│   ├── middleware/             # Route protection middleware (RequireAuth)
│   ├── pages/                  # Page views (Home, Board, BoardDetail, Profile, Auth)
│   ├── routes/                 # App route mapping & lazy loading setup
│   ├── service/                # Socket.IO connection manager
│   ├── stores/                 # Zustand global state stores
│   ├── types/                  # TypeScript interfaces & types
│   ├── utils/                  # Helper utilities & data mappers
│   ├── App.tsx                 # Root application component & Routing
│   ├── main.tsx                # Entry point & Mantine/Modal Providers
│   └── index.css               # Global CSS & Tailwind imports
├── .env.development            # Development environment variables
├── eslint.config.js            # ESLint flat configuration
├── index.html                  # HTML entry point
├── package.json                # Project dependencies & scripts
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite configuration & Manual chunk splitting
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `>= 18.0.0`
- **Package Manager**: `npm` `>= 9.0.0` or `pnpm` `>= 8.0.0` (Recommended)
- **Backend API**: Running NestJS / Express REST API with Socket.IO server enabled.

### 1. Clone the repository
```bash
git clone https://github.com/vubaokhanh2311/Krello-frontend.git
cd Krello-frontend
```

### 2. Install Dependencies
```bash
npm install
# or using pnpm
pnpm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:

```env
# API Endpoint Configuration
VITE_URL_API=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000

# Third-party Services (Optional)
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
VITE_FIREBASE_VAPID_KEY=your_firebase_vapid_key
```

### 4. Run Development Server
```bash
npm run dev
# or
pnpm dev
```
The application will be accessible at `http://localhost:5173`.

---

## 📜 Available Scripts

In the project directory, you can run:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Launches the Vite development server with HMR. |
| `npm run build` | Compiles TypeScript (`tsc -b`) and builds production assets to `/dist`. |
| `npm run lint` | Executes ESLint across all `.ts` and `.tsx` files to verify code quality. |
| `npm run preview` | Boots a local static server to preview the production build in `/dist`. |

---

## 🔐 Authentication & Token Management

The application features a robust token renewal architecture via `RestClient.ts`:

```
User Action / Request
        │
        ▼
   Axios Request ─── (Add Bearer Token) ───► Backend API
        │                                         │
        │ ◄────────── (200 OK Response) ──────────┘
        │
  (401 Unauthorized)
        │
        ├──► Is Token Refreshing?
        │       ├── Yes ──► Enqueue Request into `failedQueue`
        │       └── No  ──► Trigger `refreshAccessToken()`
        │                       │
        │                       ├── Success ──► Update Local Tokens & Resolve `failedQueue`
        │                       └── Failure ──► Flush Storage, Notify User & Redirect to /login
```

---

## ⚡ Real-time Socket Protocol

Live board state is maintained using Socket.IO events (`src/constants/socket-events.constants.ts`):

- **Room Management**: `board:join`, `board:leave`
- **List Sync**: `list:created`, `list:updated`, `list:deleted`
- **Card Sync**: `card:created`, `card:updated`, `card:deleted`, `card:moved`
- **Collaborator Events**: `typing:start`, `typing:stop`, `member:added`

---

## 🚢 Deployment

Production builds generate static bundles in the `dist/` directory.

### Automated CI/CD (GitHub Actions)
A pre-configured GitHub Actions workflow ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)) handles automated deployments on pushing to the `dev` branch.

### Manual Production Build & Serve
```bash
# 1. Build client bundle
npm run build

# 2. Preview build locally
npm run preview
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository and create a feature branch (`git checkout -b feature/AmazingFeature`).
2. Run `npm run lint` and `npm run build` to ensure all type-checks and lint rules pass.
3. Commit changes (`git commit -m 'feat: Add AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
