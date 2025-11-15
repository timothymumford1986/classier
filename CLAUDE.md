# Classier - Intelligent Student Class Sorting Tool

## Project Overview

Classier is a web-based tool designed to help teachers and school administrators create optimal class configurations by managing student placement requests and constraints. The system uses intelligent algorithms to balance multiple factors including parent/student preferences, behavioral considerations, and demographic balance.

## Core Problem

Teachers receive numerous requests from parents and students about class placements:
- "My child should be with X"
- "Please don't put my child with Y"
- "Can you keep these friends together?"

Managing these requests manually while creating balanced classes is time-consuming and error-prone. Classier automates this process while giving teachers full control over the final outcome.

## Key Features

### 1. Student Management
- **NLP-Powered Input**: Paste student lists in any format - NLP extracts structured data automatically
- **Flexible Data**: Works globally (not tied to specific country formats)
- **Required Fields**: Name (minimum)
- **Optional Metadata**: Gender, academic level, behavioral notes, student ID
- **Year/Grade Organization**: Organize students by grade level or year groups
- **Scale**: Supports 20-250 students per grade level

### 2. Class Configuration
- **Flexible Setup**: Define number of classes, class names, teacher names
- **Class Sizes**: Set fixed or variable class sizes
- **Multiple Scenarios**: Create and save different class configurations for comparison

### 3. Request Management
- **Text Snippet Input**: Paste text from parent/student communications (no email integration required)
- **NLP Processing**: Natural language processing extracts placement requests from unstructured text
  - Example: "My kid, Leo, shouldn't be with Gary" → Parsed to hard constraint
- **Structured UI**: Parsed requests displayed in an organized, reviewable format
- **Manual Entry**: Add constraints directly via forms
- **Request Types**:
  - **Hard Constraints**: MUST be together / MUST NOT be together
  - **Soft Constraints**: PREFER to be together / PREFER NOT to be together
- **Expected Volume**: 1-2 requests per student on average

### 4. Intelligent Sorting Algorithm
The algorithm optimizes in priority order:
1. **Class size balancing** (primary goal: equal or target class sizes)
2. **Gender balance** across classes (target: 50/50 per class)
3. **Hard constraints** (absolute must/must-not placements)
4. **Soft constraints** (preferences, weighted)
5. **Academic streaming** (optional, school-configurable)
   - Schools can toggle "academic streaming" to create high/middle/low achievement classes
   - When disabled, algorithm balances academic levels evenly
6. **Behavioral considerations** (from teacher input and requests)

**Conflict Detection & Resolution**:
- Identifies contradictory requests (e.g., "Leo wants to be with Gary" vs "Gary doesn't want to be with Leo")
- **Teacher decides**: All conflicts flagged in real-time conflict pane for manual resolution
- Impossible constraints highlighted immediately
- No automatic conflict resolution - teacher maintains full control

### 5. Interactive Class Management UI
- **Dynamic Kanban Board**: Highly responsive drag-and-drop interface
  - Drag student from one class to another
  - **Instant feedback**: Conflicts appear immediately in bottom pane when student selected or moved
  - Visual indicators update in real-time
- **Real-Time Conflict Pane**: Bottom panel displays:
  - Active conflicts for selected/moved student
  - Violated hard constraints (red)
  - Unmet soft constraints (yellow)
  - Affected students and specific constraint violations
  - All updates happen instantly as you drag/drop
- **Visual Indicators**:
  - Satisfied constraints (green checkmarks)
  - Violated constraints (red warnings)
  - Class balance metrics (gender ratio, size, academic distribution)
- **Freeze Functionality**: Lock specific student placements while re-optimizing others
- **Manual Overrides**: Teacher has final say on all placements
- **Undo/Redo**: Easy reversal of changes

### 6. Export & Reporting
- Export finalized class lists (CSV, PDF, Excel)
- Generate summary reports showing:
  - Request fulfillment rate
  - Class balance metrics
  - Remaining conflicts
- Share class lists with other teachers/administrators

### 7. Multi-Tenancy & Authentication
- **School-Based Isolation**: Each school's data is completely separate
- **Invitation System**: School admins can invite teachers
- **Concurrent Usage**: Supports up to 20 teachers working simultaneously per school
- **Multiple Auth Providers**:
  - Google Workspace
  - Microsoft/Azure AD
  - Additional SSO providers as needed
- **Permission Levels**:
  - School Admin: Manage school, invite users, full access to all classes
  - Teacher: Manage assigned classes/grades

### 8. Security & Privacy
- **Data Isolation**: Complete separation between schools
- **Secure Storage**: Student names and sensitive data encrypted
- **Access Control**: Role-based permissions
- **Audit Logging**: Track who made changes to class configurations
- **Compliance**: FERPA-compliant data handling

## Technical Architecture

### Frontend
- Modern JavaScript framework (React recommended)
- Responsive design for desktop and tablet
- Drag-and-drop library (react-beautiful-dnd or similar)
- Real-time UI updates
- Accessible and intuitive interface

### Backend
- Node.js v18+ with Express or similar framework
- RESTful API or GraphQL
- **NLP service** for intelligent text parsing:
  - Student list parsing (any format → structured data)
  - Placement request extraction from parent communication text
  - **Google Gemini API** (@google/genai npm package)
- **Optimization algorithm service**:
  - Constraint satisfaction problem (CSP) solver
  - **genetic-js** - Genetic algorithm for multi-objective optimization
  - **simulated-annealing** - Alternative optimization approach
  - Custom CSP logic for hard constraints
- Background job processing for heavy computations
- WebSocket support for real-time UI updates

### Database
- **PostgreSQL** for relational data
- Schema includes:
  - Schools
  - Users (teachers, admins)
  - Students
  - Classes
  - Requests/Constraints
  - Scenarios
  - Audit logs

### Authentication
- OAuth 2.0 integration
- Support for multiple providers (Google, Microsoft)
- JWT-based session management
- Secure token storage

### Hosting & Deployment
- **Platform**: Railway
- **CI/CD**: GitHub Actions
- **Deployment**: Automatic deployment on push to main branch
- **Environment**: Production, staging, and development environments

### Data Model (Simplified)

```
School
  - id
  - name
  - created_at
  - settings (JSONB)
    - academic_streaming_enabled (boolean)
    - default_class_size (integer)

User
  - id
  - email
  - school_id
  - role (admin, teacher)
  - auth_provider
  - created_at

Student
  - id
  - name (required)
  - school_id
  - grade_level
  - gender (optional)
  - academic_level (optional, manually set by teacher)
  - behavioral_notes (optional, text)
  - student_id (optional, for school systems that use it)
  - created_at

Class
  - id
  - school_id
  - scenario_id
  - name
  - teacher_name
  - target_size
  - grade_level
  - created_at

ClassAssignment
  - id
  - student_id
  - class_id
  - frozen (boolean)
  - assigned_at
  - manually_placed (boolean)

PlacementRequest
  - id
  - school_id
  - scenario_id
  - student_id
  - target_student_id
  - type (together, not_together)
  - priority (hard, soft)
  - source (text_paste, manual)
  - original_text
  - created_at
  - created_by

Scenario
  - id
  - school_id
  - grade_level
  - name
  - created_by
  - created_at
  - last_optimized_at
```

## Algorithm Approach

This is a **Constraint Satisfaction Problem (CSP)** with weighted priorities.

### Phase 1: Input Validation & Preprocessing
1. Parse all hard and soft constraints from NLP-extracted requests
2. Detect conflicts and impossibilities
3. Build constraint graph
4. Identify frozen placements (if re-optimizing)
5. **Flag conflicts to teacher** - no automatic resolution

### Phase 2: Initial Assignment
1. Distribute students to balance **class sizes** first (highest priority)
2. Apply **gender balance** (target: 50/50 per class)
3. Apply **hard constraints** (must-be-together, must-not-be-together)
   - Create student groups based on must-be-together constraints
   - Ensure must-not-be-together constraints are satisfied
4. Keep frozen placements locked during optimization

### Phase 3: Optimization Loop
1. Score current configuration with weighted function:
   - **Class size balance** (highest weight)
   - **Gender balance** (second highest)
   - **Hard constraint satisfaction** (very high penalty for violations)
   - **Soft constraint satisfaction** (lower weight, best-effort)
   - **Academic streaming** (if enabled by school)
   - **Behavioral considerations** (from notes and requests)
2. Apply optimization algorithm:
   - Options: Genetic algorithm, simulated annealing, or constraint programming solver
   - Iteratively improve until convergence or time limit
3. Never move frozen students
4. Maintain class size balance throughout

### Phase 4: Real-Time Manual Refinement
1. Present results to teacher in Kanban UI
2. **Dynamic updates**: When student is dragged/moved:
   - Re-calculate scores instantly
   - Update conflict pane in real-time
   - Show visual feedback (red/green indicators)
   - Display impact on class balance
3. Teacher can:
   - Freeze specific placements
   - Manually override any assignment
   - Re-run optimization with new constraints
4. Frozen placements maintained during re-optimization

## User Workflows

### Workflow 1: Initial Setup (Start of School Year)
1. Teacher logs in via Google/Microsoft
2. Selects grade level / year group
3. **Pastes student list** (any format) - NLP structures the data
   - Reviews extracted names and metadata
   - Manually adds missing info (gender, academic level if desired)
4. **Configures classes**: number, names, teacher names, target sizes
5. **Pastes text snippets** from parent communications
   - NLP extracts placement requests automatically
   - Example: "Leo shouldn't be with Gary" → Hard constraint parsed
6. **Reviews parsed requests** in structured UI
   - Edits misunderstood requests
   - Adds manual constraints via forms
7. **Runs sorting algorithm**
   - Algorithm generates initial class assignments
   - Conflict detection runs automatically
8. **Reviews results in Kanban UI**
   - Drag-and-drop adjustments
   - Bottom pane shows conflicts in real-time
9. **Freezes satisfied placements**
   - Re-run optimization for remaining students if needed
10. **Exports final class lists** (CSV, PDF, Excel)

### Workflow 2: Mid-Year Adjustment
1. Load existing scenario
2. Add new students
3. Add new requests
4. Unfreeze specific placements
5. Re-run optimization
6. Export updated lists

### Workflow 3: Comparing Scenarios
1. Create multiple scenarios with different parameters
2. Compare results side-by-side
3. Select best configuration
4. Export chosen scenario

## UI/UX Principles

- **Intuitive**: Minimal learning curve for non-technical teachers
- **Fast**: Bulk operations for efficiency
- **Visual**: Clear representation of constraints and balance
- **Forgiving**: Easy undo, multiple scenarios for experimentation
- **Transparent**: Show why algorithm made specific decisions
- **Accessible**: WCAG 2.1 AA compliance

## MVP Feature Set & Timeline

**Target: 6 months to production-ready MVP**

**Phase 1 (MVP - Months 1-4)**:
- **Multi-school architecture** built from day one (but launch with single pilot school)
- **Authentication**: Google OAuth (Microsoft in Phase 2)
- **Student input**: NLP-powered text paste for student lists
- **Request input**: NLP-powered text paste + manual entry forms
- **Algorithm**: Full CSP solver with priority weighting
  - Class size balance
  - Gender balance
  - Hard constraints
  - Soft constraints (best-effort)
- **Dynamic Kanban UI**: Real-time drag-and-drop with instant conflict feedback
- **Conflict pane**: Bottom panel with live updates
- **Freeze functionality**: Lock placements during re-optimization
- **Export**: CSV and PDF
- **Security**: Full data isolation, encryption at rest
- **Rollout**: Single pilot school

**Phase 2 (Post-MVP - Months 5-6)**:
- **Multi-school rollout**: Onboard additional schools
- **Microsoft/Azure AD** authentication
- **Academic streaming** toggle (school setting)
- **Advanced export**: Excel format, detailed reports
- **Scenario comparison**: Side-by-side view
- **Audit logging**: Track who made what changes
- **Mobile-responsive** refinements

**Phase 3 (Future - Months 7+)**:
- **Improved NLP**: Machine learning for better parsing accuracy
- **Historical analysis**: Learn from past year's successful configurations
- **SIS integration**: Import from school management systems
- **Collaborative editing**: Multiple teachers working simultaneously
- **Advanced reporting**: Constraint satisfaction dashboards
- **Language localization**
- **Dark mode**

## Success Metrics

- Time saved per teacher (target: 80% reduction in class sorting time)
- Constraint satisfaction rate (target: >90% of requests honored)
- User adoption within schools
- User satisfaction (NPS score)
- Class balance quality (measured by demographic distribution)

## Security Considerations

- Never expose student data across schools
- Encrypt sensitive data at rest
- Use HTTPS for all communications
- Implement rate limiting on API
- Regular security audits
- GDPR/FERPA compliance
- Secure credential storage
- XSS/CSRF protection
- SQL injection prevention

## Development Priorities

1. **Security First**: Data isolation and auth must be rock-solid
2. **Core Algorithm**: Sorting logic is the heart of the product
   - Correct priority weighting (class size → gender → hard → soft)
   - Fast optimization (handle 250 students per grade)
   - Real-time conflict detection
3. **Dynamic UI/UX**: Teachers must find it easier than manual sorting
   - Instant feedback on drag-and-drop
   - Real-time conflict pane updates
   - Intuitive, minimal learning curve
4. **Performance**:
   - Handle 20-250 students per grade
   - Support 20 concurrent teachers per school
   - Real-time UI updates (< 100ms response time for drag operations)
5. **Reliability**: Never lose data, always recoverable
   - Auto-save scenarios
   - Version history for rollback

## Future Enhancements

- Mobile app for on-the-go adjustments
- Integration with school management systems (SIS)
- Machine learning to improve constraint parsing
- Predictive conflict detection
- Historical data analysis
- Automated balance optimization suggestions
- Support for special education requirements
- Language localization
- Dark mode
- Collaborative editing (multiple teachers working simultaneously)

## Questions & Decisions Log

### Answered
✅ **Scale**: 20-250 students per grade, 20 concurrent teachers per school
✅ **Student input**: NLP-powered text paste (not just CSV)
✅ **Request volume**: 1-2 requests per student on average
✅ **Request input**: Text snippets pasted from parent communications (not email integration)
✅ **Priority order**: Class size → Gender → Hard constraints → Soft constraints
✅ **Academic streaming**: Optional, school-level toggle
✅ **Conflict resolution**: Teacher decides, system only flags
✅ **Siblings/twins in same grade**: No special handling, teacher overrides if needed
✅ **Special education**: Teacher handles via manual overrides
✅ **Timeline**: 6 months to MVP
✅ **Rollout**: Single pilot school, multi-school architecture from day one
✅ **Global**: Not US-centric, flexible metadata fields

### Open Questions
- How to handle mid-year student transfers? (Workflow 2 covers basics)
- Should we support cross-grade constraints (siblings in different grades)?
- Should scenarios be shareable across schools (anonymized templates)?
- How long should we retain historical data?
- Should we support bulk student removal/archiving at end of year?

## Project Name

**Classier** - Because class sorting should be classy, and teachers deserve better tools.
