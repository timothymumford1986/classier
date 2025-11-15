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
- Google Gemini API key

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Database Setup

```bash
cd backend
npm run migrate
```

## Development

See [CLAUDE.md](./CLAUDE.md) for comprehensive project specification and implementation details.

## License

MIT
