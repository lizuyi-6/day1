# Aether Flow (Day1)

**Aether Flow** is a full-stack AI Agent visualization and workflow orchestration platform based on **Vue 3** and **NestJS**. It allows developers to build complex intelligent applications through a drag-and-drop interface, integrating LLMs, knowledge bases (RAG), and custom logic.

## 🏗 Architecture & Tech Stack

The project follows a modern full-stack architecture with containerization support.

### **Frontend** (`/frontend`)
*   **Framework**: Vue 3 (Composition API)
*   **Language**: TypeScript 5.0+
*   **Build Tool**: Vite
*   **State Management**: Pinia
*   **UI/Styling**: Tailwind CSS, Sass
*   **Workflow Engine**: Vue Flow (Visual node editor)
*   **Icons**: Lucide Vue Next

### **Backend** (`/backend`)
*   **Framework**: NestJS 10.x
*   **Language**: TypeScript 5.0+
*   **Database**: PostgreSQL 15 (via TypeORM)
*   **AI Integration**: LangChain.js, OpenAI SDK
*   **Features**:
    *   **Agent Module**: Chat and stream handling.
    *   **Knowledge Module**: RAG implementation with vector embeddings.
    *   **Workflow Module**: Graph-based workflow execution.
    *   **Session Module**: Chat history and context management.

### **Infrastructure**
*   **Containerization**: Docker & Docker Compose
*   **Database**: PostgreSQL 15 Alpine image

## 🚀 Getting Started

### Prerequisites
*   **Node.js**: >= 18.0.0
*   **Docker**: Required for containerized execution.
*   **Git**: Version control.

### 1. Environment Setup
Copy the example environment file and configure your keys (especially LLM API keys).

```bash
cp .env.example .env
```

**Key Variables:**
*   `DB_*`: Database credentials.
*   `OPENAI_API_KEY`: API Key for LLM services (compatible with OpenAI/Qwen/Claude).
*   `OPENAI_BASE_URL`: Base URL for the LLM provider.
*   `LLM_MODEL`: Model name (e.g., `qwen-flash`).

### 2. Running the Project

#### **Option A: Docker Compose (Recommended)**
The project includes a robust startup script `start.sh` that handles container cleanup, startup, and health checks.

```bash
# Start all services with health checks
./start.sh

# Or standard Docker Compose
docker-compose up -d
```
*   **Frontend**: http://localhost:5174 (Default mapped port)
*   **Backend**: http://localhost:3001 (Default mapped port)
*   **Database**: localhost:5432

#### **Option B: Local Development**
Run frontend and backend in separate terminals.

```bash
# Install dependencies for both
npm run install:all

# Terminal 1: Backend
npm run dev:backend
# Access: http://localhost:3000

# Terminal 2: Frontend
npm run dev:frontend
# Access: http://localhost:5173
```

## 📂 Project Structure

```text
X:\day1\
├── .env.example            # Environment variables template
├── docker-compose.yml      # Docker services definition
├── start.sh                # Robust startup script
├── backend\                # NestJS Backend
│   ├── src\
│   │   ├── agent\          # LLM interaction & chat logic
│   │   ├── knowledge\      # RAG & Document management
│   │   ├── workflow\       # Workflow engine & node logic
│   │   └── main.ts         # App entry point
│   ├── test\               # E2E tests
│   └── package.json
└── frontend\               # Vue 3 Frontend
    ├── src\
    │   ├── components\
    │   │   └── workflow\   # Node & Edge components for Vue Flow
    │   ├── views\          # Main pages (Chat, Workflow, Knowledge)
    │   └── stores\         # Pinia state stores
    └── package.json
```

## 🛠 Development Conventions

*   **Language**: TypeScript is strictly used across the full stack.
*   **Linting & Formatting**:
    *   **Backend**: ESLint + Prettier. Run `npm run lint` in `backend/`.
    *   **Frontend**: ESLint + Oxlint + Prettier. Run `npm run lint` in `frontend/`.
*   **Testing**:
    *   Backend includes Jest for unit and E2E tests (`npm run test`, `npm run test:e2e`).
*   **Workflow Implementation**:
    *   New nodes should be added to `frontend/src/components/workflow/nodes/` and registered in the frontend configuration.
    *   Corresponding execution logic must be handled in `backend/src/workflow/`.

## 🔍 Common Commands

| Scope | Command | Description |
| :--- | :--- | :--- |
| **Root** | `npm run install:all` | Install deps for both frontend and backend |
| **Root** | `./start.sh` | Start full stack via Docker |
| **Backend** | `npm run start:dev` | Start backend in watch mode |
| **Backend** | `npm run test` | Run unit tests |
| **Frontend** | `npm run dev` | Start frontend dev server |
| **Frontend** | `npm run build` | Build frontend for production |

## ⚠️ Troubleshooting

*   **Ports**: Docker maps host ports `5174` (Frontend) and `3001` (Backend) by default to avoid conflicts, whereas local `npm run` uses `5173` and `3000`. Check `docker-compose.yml` or `.env` if you cannot access the services.
*   **Database Connection**: Ensure the `db` service is healthy before the backend starts. The `start.sh` script handles this wait automatically.
*   **LLM Errors**: Verify `OPENAI_API_KEY` and `OPENAI_BASE_URL` in `.env`. The system defaults to Qwen (Aliyun) settings in examples.
