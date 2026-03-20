# vedaAI_assignment

## Overview
This project generates school exam papers for a given `subject`, `class/grade`, and `question type distribution` using an LLM. Teachers provide:
- `Teacher Notes` (general guidance for question style/topic focus)
- `Additional Information` (background about the paper/topic for better targeting)

The frontend currently includes a file picker (images/PDF) in the UI, but the selected file is **not sent/processed by the backend** in the current implementation.

The backend stores assignment definitions in MongoDB and triggers AI generation (either directly or through a Redis-backed queue). The frontend shows generation progress in real-time using Socket.IO and then renders the generated paper.

---

## Tech Stack
- Frontend: Next.js (App Router) + React + TypeScript
- Backend: Node.js + Express + MongoDB (Mongoose)
- Real-time updates: Socket.IO
- Async AI jobs (optional): BullMQ + Redis
- LLM provider: OpenRouter (`openai` client pointing to OpenRouter base URL) using model id `AI_MODEL` (currently `meta-llama/llama-3.1-8b-instruct`)

---

## High-Level Architecture

### Components
1. **Frontend (Next.js)**
   - Pages:
     - `/assignments/create`: form to define an assignment and request generation
     - `/assignments/[id]`: shows generation status and renders the final paper
   - Real-time:
     - Uses Socket.IO to subscribe to assignment updates (`generation:queued`, `generation:processing`, `generation:complete`, `generation:error`)
   - Downloads:
     - Exports the rendered paper as PDF/DOCX from the client side

2. **Backend (Express)**
   - REST API endpoints under `/api/…`
   - Stores:
     - `Assignment` documents (name, subject, class, due date, instructions, question config, and generated content)
     - `Notification` documents (assignment-ready messages)
   - Real-time:
     - Socket.IO server broadcasts generation and notification events

3. **AI Generation Service**
   - Builds a strict prompt and sends it to the LLM
   - Enforces JSON-only response
   - Parses and normalizes the response into the app’s internal structure:
     - `sections[]` with `questions[]`
     - `totalMarks`, `totalQuestions`, `timeAllowed`

4. **Optional Queue Worker (Redis mode)**
   - If `USE_REDIS=true`, AI generation runs through BullMQ:
     - API enqueues a job
     - A BullMQ Worker consumes the job and calls the same generation logic
   - If `USE_REDIS=false`, generation runs in the backend process (asynchronously) without queueing.

---

## End-to-End Flow (Create → Generate → View)

### 1. Teacher creates an assignment (Frontend)
On `/assignments/create`, the teacher provides:
- `name`, `subject`, `className`, `dueDate`
- `questionConfig` (an array of question type objects: `type`, `label`, `count`, `marksEach`)
- `additionalInstructions` (Teacher Notes shown in prompt as guidance; not printed on paper)
- `additionalInfo` (LLM context/background for better targeting)

On submit, the frontend calls:
- `POST /api/assignments`

### 2. Backend validates & stores (Express)
The backend:
- Validates request with Zod
- Parses `questionConfig` if needed
- Creates an `Assignment` document in MongoDB
- Sets `status: pending`
- Triggers AI generation via `addAIJob(...)`

### 3. AI generation updates assignment status (Worker/Service)
During generation:
- Backend updates `status: processing`
- Calls `handleGenerateAssessment(assignment)`
- On success:
  - updates `status: complete`
  - stores `generatedContent` in MongoDB
  - creates a `Notification` record
- On failure:
  - updates `status: error`
  - stores `errorMessage`

### 4. Real-time updates (Socket.IO)
The backend emits events to the frontend:
- `generation:queued`
- `generation:processing`
- `generation:complete` (includes generated content)
- `generation:error`
- `notification:new`

The frontend listens and updates UI accordingly.

### 5. Render the paper (Frontend)
On `/assignments/[id]`, the frontend:
- Fetches the assignment if needed
- Renders the `QuestionPaper` component using `generatedContent`
- Enables PDF/DOCX downloads

---

## LLM Prompting Approach (How the model is guided)

### Prompt inputs
The prompt includes:
- `SUBJECT` and `CLASS / GRADE`
- `questionConfig` breakdown (counts and marks per question)
- `TEACHER NOTES` (from `additionalInstructions`)
- `ADDITIONAL CONTEXT` (from `additionalInfo`)

### Strict JSON output contract
The system prompt and prompt instructions enforce:
- Respond ONLY with valid JSON
- No markdown, no code fences, no extra text
- The JSON must match a fixed structure:
  - `sections[]` each with:
    - `id`, `title`, `instruction`, `questions[]`
    - `questions[]` contains `id`, `text`, `type`, `difficulty`, `marks`, `answerKey`, and `options` for MCQ
  - `totalMarks`, `totalQuestions`, `timeAllowed`

### Post-processing in code
Even if a model wraps JSON in backticks, the backend strips backticks and then:
- `JSON.parse(...)`
- Validates `sections` is present and non-empty
- Normalizes:
  - ensures `difficulty` is one of `Easy|Moderate|Hard`
  - ensures `marks` is numeric
  - includes `options` only for `mcq`

---

## Data Model (MongoDB)

### `Assignment`
Key fields:
- `name`, `schoolName` (optional), `subject`, `className`
- `dueDate`
- `additionalInstructions` (teacher notes; prompt guidance)
- `additionalInfo` (paper/topic background; prompt context)
- `questionConfig[]` (teacher-defined distribution)
- `status`: `pending | processing | complete | error`
- `generatedContent`:
  - `sections[]`, `totalMarks`, `totalQuestions`, `timeAllowed`
- `errorMessage` (when generation fails)

### `Notification`
Stores messages like:
- “Assignment Ready”
- associated `assignmentId`

---

## Configuration & Environment Variables

### Backend environment (`backend/.env`)
Copy `backend/.env.example` to `backend/.env` and set:
- `PORT` (default `3000`)
- `MONGO_URI` (MongoDB connection string)
- `REDIS_URL` (only needed if `USE_REDIS=true`)
- `OPENROUTER_API_KEY` (OpenRouter key)
- `AI_MODEL` (OpenRouter model id used by the backend; currently set in `backend/.env` to `meta-llama/llama-3.1-8b-instruct`)
- `FRONTEND_URL` (kept for CORS compatibility, but the backend now uses `origin: true`)
- `USE_REDIS` (set to `true` to enable BullMQ worker mode)

Example (fill values):
- `PORT=3000`
- `MONGO_URI=...`
- `USE_REDIS=true`
- `REDIS_URL=rediss://...`
- `OPENROUTER_API_KEY=...`
- `AI_MODEL=meta-llama/llama-3.1-8b-instruct`

### Frontend environment (`frontend/.env.local`)
Set:
- `NEXT_PUBLIC_BACKEND_URL` (your backend host, e.g. `http://44.222.228.147`)
- `NEXT_PUBLIC_API_URL` (your backend API base path, e.g. `http://44.222.228.147/api`)

---

## Local Setup (Detailed)

### Prerequisites
- Node.js installed
- MongoDB reachable (local or hosted)
- Redis reachable (optional; only if you want queue mode)
- OpenRouter API key

### 1. Backend setup
1. Go to `backend/`
2. Install dependencies
3. Create `backend/.env` from `backend/.env.example`
4. Start the backend

Commands (run manually):
```powershell
cd "backend"
npm install
```

Start backend:
```powershell
npm run dev
```

Your backend will start on `PORT` (default `3000`) and expose routes under `/api`.

### 2. Frontend setup
1. Go to `frontend/`
2. Install dependencies
3. Create `frontend/.env.local` (based on your existing `.env.local.example`)
4. Start the frontend

Commands (run manually):
```powershell
cd "frontend"
npm install
```

Start frontend:
```powershell
npm run dev
```

Note: your `frontend/package.json` runs Next on port `8080` (`next dev -p 8080`).

---

## Netlify Deployment (Frontend only, Drag & Drop)

Because you are deploying only the frontend:
- Keep your backend hosted somewhere public (your current backend at `http://44.222.228.147`).
- Set the frontend env vars in Netlify to the same values you use locally.

### Required Netlify config for Next.js
1. Add `frontend/netlify.toml`:
```toml
[[plugins]]
package = "@netlify/plugin-nextjs"

[build]
command = "npm run build"
publish = ".next"
```

2. Ensure the plugin is installed in the frontend project:
- Install `@netlify/plugin-nextjs` as a dev dependency.

### Create ZIP (important)
- Zip the **contents** of `frontend/` (so the zip root contains `package.json`, `next.config.ts`, `netlify.toml`, etc.)
- Do not zip only `.next`.

### Upload using Drag & Drop
- Netlify → “Add new site” → “Deploy manually” → drag & drop the ZIP.

### Netlify Environment Variables
Set:
- `NEXT_PUBLIC_BACKEND_URL`
- `NEXT_PUBLIC_API_URL`

---

## Common Issues
1. **CORS / Socket.IO connection fails**
   - Backend CORS config uses `origin: true` and supports any origin.
   - If you still see errors, it can be due to:
     - backend not reachable from Netlify
     - mixed content (HTTPS frontend calling an HTTP backend)

2. **LLM returns invalid JSON**
   - The backend strips code fences and throws an error if JSON parsing fails.
   - If frequent, reduce prompt strictness only after confirming model behavior.

---

## HLD (High-Level Design)

### Goals
- Allow a teacher to define an exam paper using:
  - `subject`, `className`, `dueDate`
  - `questionConfig` distribution (type/count/marksEach)
  - `additionalInstructions` (teacher notes)
  - `additionalInfo` (paper/topic background for the LLM)
- Generate a complete exam paper automatically via an LLM.
- Provide real-time generation status updates and notifications.
- Render and export the final paper as:
  - PDF (client-side screenshot slicing)
  - DOCX (client-side docx generation)

### Actors
- Teacher (uses frontend UI)
- LLM (OpenRouter model)
- Backend API + Socket.IO server
- MongoDB (assignment + generated paper persistence)
- Optional Redis + BullMQ (async generation worker)

### Key Modules (by responsibility)
- Frontend (Next.js)
  - `CreateAssignmentForm`: collects inputs and calls `POST /api/assignments`
  - `useSocket` + `useBackgroundSocket`: subscribes to Socket.IO events and updates Zustand store
  - `QuestionPaper` + `SectionBlock` + `QuestionItem`: renders the structured JSON output
  - `lib/pdf.ts`: exports the rendered paper into a multi-page A4 PDF
  - `lib/docx.ts`: exports the generated paper into a DOCX
- Backend (Express)
  - `routes/assignmentRouter` + `controllers/assignmentController`
  - `services/assignmentService`: validates inputs and creates assignments
  - `services/aiService`: builds prompt, calls OpenRouter, parses/normalizes JSON response
  - `workers/aiWorker` + `queues/aiQueue` (optional Redis mode)
  - `socket/socketHandler`: handles socket room subscriptions
- Data layer (MongoDB)
  - `Assignment` model: stores inputs + generatedContent + status/errorMessage
  - `Notification` model: stores “Assignment Ready” notifications

### Primary Flows

#### A. Create Assignment + Start Generation
1. Teacher submits `/assignments/create`.
2. Frontend sends payload to backend:
   - `POST /api/assignments` with assignment metadata + `questionConfig` + `additionalInstructions` + `additionalInfo`.
3. Backend:
   - Validates with Zod (`createAssignmentSchema`)
   - Saves an `Assignment` document with `status = pending`
   - Triggers generation:
     - If `USE_REDIS=true`, enqueues a BullMQ job
     - Else, starts generation locally via `setImmediate`
4. Backend emits Socket.IO events:
   - `generation:queued` when queued
   - `generation:processing` when generation starts
   - `generation:complete` + `notification:new` when done
   - `generation:error` if generation fails

#### B. View Assignment Output
1. Teacher opens `/assignments/[id]`.
2. Frontend fetches assignment with `GET /api/assignments/:id`.
3. Frontend subscribes to Socket.IO updates for the assignment.
4. When `generatedContent` exists, frontend renders `QuestionPaper`.

#### C. Real-time Updates & Rooms (Socket.IO)
- Client emits:
  - `subscribe:dashboard` to join the global dashboard room
  - `subscribe:assignment` with `assignmentId` to join `assignment:${assignmentId}`
  - `unsubscribe:assignment` on cleanup
- Server emits:
  - `generation:queued`, `generation:processing`, `generation:complete`, `generation:error`
  - `notification:new` for notifications

#### D. Export
- PDF:
  - `downloadAsPDF('question-paper-root', ...)`
  - Uses `html2canvas` to capture the DOM and slices into A4 pages
- DOCX:
  - `downloadAsDocx(currentAssignment)`
  - Uses `docx` to create sections + questions + answer key

---

## LLD (Low-Level Design)

### 1) Frontend Contracts & Implementation Details

#### 1.1 API Client
- `frontend/lib/api.ts`
  - Axios instance:
    - `baseURL = ${NEXT_PUBLIC_BACKEND_URL}/api`
    - `withCredentials = true`
    - `timeout = 30000`

#### 1.2 Zustand Stores
- `frontend/store/useAssignmentStore.ts`
  - Stores:
    - `assignments[]`
    - `currentAssignment`
    - `generationStatus: Record<assignmentId, AssignmentStatus>`
    - `isLoading`, `isFetchingMore`, `error`, `pagination`
    - `generatingAssignment` / `readyNotification` fields used by background tracking
  - Mutations:
    - `updateGenerationStatus(id, status)` updates both `generationStatus` and assignment entries
    - `setGeneratedContent(id, content)` sets `generatedContent` and forces `status: 'complete'`

#### 1.3 Socket Event Wiring
- `frontend/lib/socket.ts`
  - `getSocket()` uses `socket.io-client` with:
    - `transports: ['websocket', 'polling']`
    - default `autoConnect: true`
    - backend URL: `NEXT_PUBLIC_BACKEND_URL`

- `frontend/hooks/useSocket.ts`
  - On mount:
    - emits `subscribe:assignment` if `assignmentId` is present
    - else emits `subscribe:dashboard`
  - Registers listeners:
    - `generation:queued` → `updateGenerationStatus(id, 'pending')`
    - `generation:processing` → `updateGenerationStatus(id, 'processing')`
    - `generation:complete` → `setGeneratedContent(id, generatedContent)` + `updateGenerationStatus(id, 'complete')`
    - `generation:error` → `updateGenerationStatus(id, 'error')`
    - `notification:new` → pushes notification into notification store
  - Cleanup:
    - removes event listeners
    - unsubscribes from assignment room if `assignmentId` was used

- `frontend/hooks/useBackgroundSocket.ts`
  - Works when generation is tracked in background:
    - subscribes to the assignment room while `generatingAssignment` exists
    - listens for:
      - `generation:complete`
      - `generation:error`
    - updates store fields:
      - `setGeneratingAssignment(null)`
      - `setReadyNotification({id, name})` on completion

#### 1.4 UI Rendering of the LLM Output
- `frontend/components/output/QuestionPaper.tsx`
  - Reads `assignment.generatedContent`
  - Computes question start indices so question numbering is continuous across sections
- `frontend/components/output/SectionBlock.tsx`
  - Displays section title + section questions
  - Uses `QuestionItem` for each question
- `frontend/components/output/QuestionItem.tsx`
  - Renders:
    - difficulty tag (`Easy|Moderate|Hard`)
    - question text
    - marks label
    - MCQ options grid if `question.type === 'mcq'`

#### 1.5 PDF/DOCX Export
- `frontend/lib/pdf.ts`
  - Element targeted by id: `question-paper-root`
  - Optional hide selector (used by the “questions-only” export):
    - `hideSelector: '.answer-key-section, .difficulty-tag'`
  - Uses `html2canvas`:
    - scale: `2`
    - slices captured canvas into A4 dimensions (mm math)
  - Writes PDF using `jsPDF({ format: 'a4' })`

- `frontend/lib/docx.ts`
  - Creates:
    - Title block (paper name)
    - centered info line (subject/class/total marks/time)
    - section headings and instructions
    - each question:
      - question text + marks
      - MCQ options table when options exist
    - answer key section:
      - iterates all questions again and prints `answerKey`

### 2) Backend API & LLM Contracts

#### 2.1 Express Routes
Base path: `/api`

`assignmentRouter` (`/api/assignments`)
- `GET /` → list assignments (pagination + search + status filtering)
  - Implemented in `services/assignmentService.handleGetAllAssignments`
- `POST /` → create assignment + trigger generation
  - Implemented in `controllers/assignmentController.createAssignment` → `handleCreateAssignment`
- `GET /:id` → fetch assignment by id
- `DELETE /:id` → delete assignment
- `POST /:id/regenerate` → re-generate using same configuration
- `POST /:id/duplicate` → clone assignment with name “(Copy)”

`notificationRoutes` (`/api/notifications`)
- `GET /` → last 50 notifications
- `PATCH /:id/read` → mark one read
- `PATCH /read-all` → mark all read
- `DELETE /:id` → delete notification

#### 2.2 Input Validation (Create Assignment)
- `services/assignmentService.js` uses `createAssignmentSchema` (Zod).
- Fields:
  - `name`: string min 1 max 200
  - `subject`: string min 1 max 100
  - `className`: string min 1 max 50
  - `dueDate`: string min 1 and must parse into a valid date
  - `schoolName`: optional max 200
  - `additionalInstructions`: optional max 1000
  - `additionalInfo`: optional max 2000
- `questionConfig`:
  - Parsed from either:
    - direct array
    - or JSON string (if provided as string)
  - Must be a non-empty array

#### 2.3 Assignment Storage (Mongoose Models)
- `models/assignmentModel.js`
  - Core fields:
    - `additionalInstructions`, `additionalInfo`
    - `questionConfig[]`
    - `status`: `pending|processing|complete|error`
  - `generatedContent`:
    - `sections[]` (`sectionSchema`)
    - `totalMarks`, `totalQuestions`, `timeAllowed`
    - `generalInstructions` exists in schema but is not required by the AI output contract

- `models/questionConfigItemSchema.js`
  - Each question type item:
    - `type` (teacher-defined string)
    - `label` (capitalized by schema setter)
    - `count`
    - `marksEach`

- `models/sectionSchema.js` + `models/questionSchema.js`
  - `questionSchema` includes:
    - `difficulty: Easy|Moderate|Hard`
    - `marks`, `answerKey`
    - `options: [String]` (used for `mcq`)

- `models/notificationModel.js`
  - `title`, `message`, `type`, `read`, `assignmentId`

#### 2.4 AI Generation Implementation

##### Prompt Builder
- `backend/prompts/assessmentPrompt.js` (`buildAssessmentPrompt`)
  - Inputs:
    - `subject`, `className`
    - `questionConfig` distribution
    - `additionalInstructions` inserted as:
      - `TEACHER NOTES ... (guide but do NOT include on paper)`
    - `additionalInfo` inserted as:
      - `ADDITIONAL CONTEXT ...`

##### Output Contract (Strict JSON)
- The prompt forces:
  - JSON-only output
  - exact top-level structure:
    - `sections[]` each containing `id`, `title`, `instruction`, and `questions[]`
    - `totalMarks`, `totalQuestions`, `timeAllowed`
  - MCQ rules:
    - include `options` with exactly 4 choices
    - only include `options` for `type === "mcq"`

##### LLM Call & Parsing
- `backend/services/aiService.js`
  - Calls OpenRouter via `openrouter.chat.completions.create`:
    - system message: enforces JSON-only behavior
    - user message: `buildAssessmentPrompt(assignment)`
    - `temperature: 0.7`
    - `max_tokens: 8192`
  - Post-processing:
    - trims output
    - removes code fences if model wraps JSON in ``` blocks
    - `JSON.parse(...)`
  - Normalization:
    - ensures `sections` exists and non-empty
    - normalizes:
      - `difficulty` to one of `Easy|Moderate|Hard` (fallback `Moderate`)
      - `marks` numeric
      - `options` only for `mcq`

#### 2.5 Async Generation: Redis Mode
- Controlled by `USE_REDIS === 'true'`.
- `backend/queues/aiQueue.js`
  - `addAIJob(assignmentId, io)`
  - If Redis mode:
    - enqueues a BullMQ job:
      - queue: `ai-generation`
      - job name: `generate`
      - data: `{ assignmentId }`
      - attempts/backoff configured
  - Else:
    - runs `processAssignment` via `setImmediate`

- `backend/workers/aiWorker.js`
  - `initWorker(io)` starts a BullMQ Worker in Redis mode
  - On job:
    - calls `processAssignment(assignmentId, io)`
  - `processAssignment`:
    - emits `generation:processing`
    - calls `handleGenerateAssessment`
    - updates assignment to `complete` and stores `generatedContent`
    - creates `Notification` record
    - emits `generation:complete` + `notification:new`
    - on error updates assignment to `error` + emits `generation:error`

### 3) Socket.IO Event Contract (Concrete)
- Client emits:
  - `subscribe:dashboard` (no payload)
  - `subscribe:assignment` payload: `{ assignmentId: string }`
  - `unsubscribe:assignment` payload: `assignmentId` (string)

- Server joins rooms:
  - dashboard room: `dashboard`
  - assignment room: `assignment:${assignmentId}`

- Server emits to rooms:
  - `generation:queued` emitted by `assignmentService.handleCreateAssignment` via `io.emit(...)` (queued)
  - `generation:processing` emitted by `workers/aiWorker.processAssignment`
  - `generation:complete` emitted by `workers/aiWorker.processAssignment`
  - `generation:error` emitted by `workers/aiWorker.processAssignment`
  - `notification:new` emitted by `workers/aiWorker.processAssignment`

