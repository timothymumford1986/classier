# Classier

**Intelligent Student Class Sorting Tool**

Classier helps teachers and school administrators create optimal class configurations by managing student placement requests and constraints using intelligent algorithms.

## Project Structure

```
classier/
├── backend/          # Node.js API server
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic (NLP, optimization, etc.)
│   │   ├── models/       # Database models
│   │   ├── middleware/   # Express middleware
│   │   ├── config/       # Configuration
│   │   └── utils/        # Utility functions
│   └── package.json
├── frontend/         # React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API clients
│   │   ├── hooks/        # Custom React hooks
│   │   ├── utils/        # Utility functions
│   │   └── styles/       # CSS/styling
│   └── package.json
├── docs/             # Documentation
├── CLAUDE.md         # Project specification
└── README.md         # This file
```

## Tech Stack

### Backend
- **Runtime**: Node.js v18+
- **Framework**: Express
- **Database**: PostgreSQL
- **NLP**: Google Gemini API (@google/genai)
- **Optimization**: genetic-js, simulated-annealing
- **Auth**: JWT, OAuth 2.0 (Google, Microsoft)

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router
- **State**: Zustand
- **Drag & Drop**: @hello-pangea/dnd (react-beautiful-dnd fork)
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites
- Node.js v18 or higher
- PostgreSQL 14 or higher
- Google Gemini API key (get one at https://aistudio.google.com/app/apikey)

### Quick Start

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd classier
```

2. **Set up PostgreSQL database**
```bash
# Create database
createdb classier

# Or using psql
psql -U postgres
CREATE DATABASE classier;
\q
```

3. **Backend Setup**
```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your credentials:
# - GEMINI_API_KEY (required for NLP features)
# - DATABASE_URL or DB_* credentials
# - JWT_SECRET (for authentication)

# Run database migrations
npm run migrate

# Start backend server
npm run dev
```

Backend will run on http://localhost:3000

4. **Frontend Setup** (in a new terminal)
```bash
cd frontend
npm install

# Create .env file (optional)
cp .env.example .env

# Start frontend dev server
npm run dev
```

Frontend will run on http://localhost:5173

5. **Access the application**
- Open http://localhost:5173
- Click "Sign in with Google (Mock)" to use mock authentication
- Create your first scenario and start sorting classes!

## Features Implemented

### Backend (Node.js)
✅ **Authentication**
- JWT-based authentication
- Google & Microsoft OAuth endpoints
- Role-based access control (admin/teacher)
- Multi-tenant architecture (school isolation)

✅ **NLP Service (Google Gemini API)**
- Parse student lists from any text format
- Extract placement requests from parent communications
- Automatic student name matching
- Academic level extraction

✅ **Optimization Algorithm**
- Genetic algorithm using genetic-js
- Priority weighting: Class size → Gender → Hard → Soft constraints
- Frozen assignment support
- Real-time conflict detection
- Academic streaming toggle

✅ **API Endpoints**
- `/api/auth/*` - Authentication
- `/api/scenarios/*` - Scenario management
- Full CRUD for students, classes, requests, assignments

### Frontend (React + Vite)
✅ **Kanban Board**
- Drag-and-drop interface using @hello-pangea/dnd
- Real-time visual feedback
- Class size and gender balance indicators
- Student cards with metadata

✅ **Conflict Pane**
- Real-time conflict detection
- Hard vs soft constraint violations
- Color-coded warnings (red/yellow)
- Auto-updates on drag/drop

✅ **Dashboard**
- Scenario management
- Create/view scenarios
- School overview

✅ **Import Wizards**
- NLP-powered student import
- NLP-powered request import
- Modal interfaces with validation

✅ **State Management**
- Zustand for global state
- Optimistic UI updates
- Toast notifications

## Development Workflow

1. **Create a scenario** - Define grade level and number of classes
2. **Import students** - Paste student list, AI parses it
3. **Import requests** - Paste parent emails/requests, AI extracts constraints
4. **Optimize** - Algorithm generates balanced class assignments
5. **Refine** - Drag and drop students, freeze placements
6. **Re-optimize** - Run again with frozen placements
7. **Export** - Download final class lists (coming soon)

## Environment Variables

### Backend (.env)
```bash
# Required
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=postgresql://user:password@localhost:5432/classier
JWT_SECRET=your_jwt_secret

# Optional
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3000/api
```

## Development

See [CLAUDE.md](./CLAUDE.md) for comprehensive project specification and implementation details.

## Next Steps

- Test locally with sample data
- Add export functionality (CSV, PDF, Excel)
- Implement real Google/Microsoft OAuth
- Add scenario comparison
- Deploy to Railway
- Add audit logging UI

## License

MIT
