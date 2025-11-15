# Pre-Launch Suggestions & Improvements

## 🚨 Potential Issues to Watch For

### 1. **genetic-js Import**
The `genetic-js` package might need a different import syntax. If you get errors:
```javascript
// Try this instead:
import * as Genetic from 'genetic-js';
// Or:
const Genetic = require('genetic-js');
```

### 2. **Google Gemini API Rate Limits**
- Free tier has limits on requests/minute
- Add retry logic with exponential backoff
- Consider caching parsed results
- **Recommendation**: Start with small batches for testing

### 3. **Mock Authentication Issue**
The mock login doesn't call the backend `/api/auth/google/callback`. You'll need to either:
- Keep using mock (fine for dev)
- Implement real Google OAuth flow later
- Or temporarily make the mock call the backend endpoint

### 4. **Database Connection on Startup**
Add a connection test in `backend/src/index.js`:
```javascript
// After app.listen()
import pool from './config/database.js';
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Database connected successfully');
  }
});
```

## 🎯 Quick Wins to Add

### 1. **Error Boundaries in React**
Add to catch rendering errors:
```jsx
// frontend/src/components/ErrorBoundary.jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh.</div>;
    }
    return this.props.children;
  }
}
```

### 2. **Loading State During Optimization**
The genetic algorithm can take 5-30 seconds. Add visual feedback:
- Progress bar
- "Optimizing... this may take a moment" message
- Disable UI during optimization

### 3. **Better Validation**
Add validation before running optimization:
- Ensure students exist
- Ensure classes exist
- Warn if no requests exist (still works, just FYI)

### 4. **Undo/Redo for Drag & Drop**
Store assignment history in Zustand:
```javascript
history: [],
currentIndex: -1,
undo: () => { /* restore previous state */ },
redo: () => { /* restore next state */ }
```

## 🔧 Developer Experience Improvements

### 1. **Better Logging**
Use the included `winston` package:
```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});
```

### 2. **API Documentation**
Consider adding Swagger/OpenAPI docs:
```bash
npm install swagger-ui-express swagger-jsdoc
```

### 3. **Sample .env File with Actual Values**
Create `backend/.env.local.example` with working local config:
```bash
GEMINI_API_KEY=get-from-google-ai-studio
DATABASE_URL=postgresql://postgres:password@localhost:5432/classier
DB_HOST=localhost
DB_PORT=5432
DB_NAME=classier
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=local-dev-secret-change-in-production
FRONTEND_URL=http://localhost:5173
PORT=3000
NODE_ENV=development
```

## 🎨 UX Enhancements

### 1. **Export Functionality**
Add CSV export (high priority for MVP):
```javascript
// In frontend
const exportToCSV = (classData) => {
  const csv = classData.map(cls =>
    cls.students.map(s => `${s.name},${cls.name}`).join('\n')
  ).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'class-assignments.csv';
  a.click();
};
```

### 2. **Student Search/Filter**
When dealing with 100+ students, search is essential:
```javascript
const [searchTerm, setSearchTerm] = useState('');
const filteredStudents = students.filter(s =>
  s.name.toLowerCase().includes(searchTerm.toLowerCase())
);
```

### 3. **Keyboard Shortcuts**
- `Ctrl/Cmd + K` - Search students
- `Ctrl/Cmd + O` - Optimize
- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Shift + Z` - Redo

### 4. **Class Statistics Dashboard**
Show aggregate stats:
- Total students
- Average class size
- Gender distribution across all classes
- Constraint satisfaction rate (%)

## 🐛 Bug Fixes

### 1. **Frozen Assignments Not Preserved**
Ensure frozen students aren't moved during drag:
```javascript
// In KanbanBoard
const handleDragStart = (start) => {
  const student = students.find(s => s.id === start.draggableId);
  const assignment = assignments.find(a => a.student_id === student.id);
  if (assignment?.frozen) {
    // Prevent drag
    return false;
  }
};
```

### 2. **Conflict Calculation on Every Render**
Move to useEffect or memoize:
```javascript
const conflicts = useMemo(() =>
  calculateConflicts(assignments, requests),
  [assignments, requests]
);
```

### 3. **Missing Error Handling in NLP Service**
Add fallback for malformed Gemini responses:
```javascript
try {
  const students = JSON.parse(responseText);
  if (!Array.isArray(students)) {
    throw new Error('Response is not an array');
  }
  return students;
} catch (error) {
  console.error('Failed to parse NLP response:', responseText);
  throw new Error('AI parsing failed. Please check the format and try again.');
}
```

## 🚀 Performance Optimizations

### 1. **Debounce Conflict Calculation**
Don't recalculate on every keystroke:
```javascript
import { debounce } from 'lodash';

const debouncedCalculate = useMemo(
  () => debounce(calculateConflicts, 300),
  []
);
```

### 2. **Lazy Load Scenarios**
Only load full scenario data when viewing it:
```javascript
// Dashboard only shows scenario list
// ScenarioPage fetches full details
```

### 3. **Optimize Genetic Algorithm Parameters**
Tune based on student count:
```javascript
const config = {
  size: Math.min(50, Math.max(20, students.length / 5)),
  crossover: 0.7,
  mutation: 0.3,
  iterations: students.length < 50 ? 50 : 100
};
```

## 📊 Testing Recommendations

### 1. **Test Cases to Try**
- 0 students (should show empty state)
- 1 class (should put everyone in one class)
- More classes than students (some classes empty)
- All hard constraints impossible to satisfy (should show conflicts)
- Very large dataset (200+ students)

### 2. **Edge Cases**
- Students with no gender specified
- Requests referencing non-existent students
- Circular constraints (A with B, B with C, C not with A)
- Empty scenario name
- Negative class sizes

### 3. **NLP Testing**
Test with various formats:
```
John Smith, Jane Doe, Bob Johnson
1. Emma - Female
Sarah (ID: 12345)
Mike | Male | High achiever
```

## 🔐 Security Hardening (Before Production)

1. **Environment Variables**: Never commit `.env` files
2. **SQL Injection**: Using parameterized queries ✅ (already done)
3. **XSS Protection**: Sanitize user input (add DOMPurify)
4. **CSRF Protection**: Add CSRF tokens for forms
5. **Rate Limiting**: Already included ✅
6. **Input Validation**: Add Zod or Joi schemas
7. **Helmet.js**: Already included ✅

## 📝 Documentation to Add

1. **API docs** - Document all endpoints
2. **Component docs** - Props and usage for each component
3. **Algorithm docs** - Explain fitness function weights
4. **Deployment guide** - Railway setup steps
5. **Troubleshooting** - Common errors and solutions

## 🎯 Priority Order

**Must Have (Before Testing):**
1. ✅ Seed script (done!)
2. Database connection test on startup
3. Better error messages in UI
4. Export to CSV

**Should Have (Before MVP Launch):**
5. Undo/redo
6. Student search
7. Loading states during optimization
8. Fix frozen assignments drag prevention

**Nice to Have (Post-MVP):**
9. Keyboard shortcuts
10. Statistics dashboard
11. Real OAuth
12. PDF export

## 🧪 Quick Test Script

After you migrate locally, run this:
```bash
# Terminal 1
cd backend
npm run migrate
npm run seed
npm run dev

# Terminal 2
cd frontend
npm run dev

# Then in browser:
# 1. Go to http://localhost:5173
# 2. Click mock login
# 3. You should see "Demo Scenario - Grade 5"
# 4. Click it
# 5. Click "Optimize Classes"
# 6. Should see students distributed across 3 classes
# 7. Drag a student to another class
# 8. Check bottom pane for conflicts
```

---

**Need anything else before pulling? Let me know!** 🚀
