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
- **Bulk Import**: Paste large student lists directly into the system
- **Student Profiles**: Track additional metadata (gender, academic level, behavioral notes)
- **Year/Grade Organization**: Organize students by grade level or year groups

### 2. Class Configuration
- **Flexible Setup**: Define number of classes, class names, teacher names
- **Class Sizes**: Set fixed or variable class sizes
- **Multiple Scenarios**: Create and save different class configurations for comparison

### 3. Request Management
- **Email Parsing**: Paste parent/student emails directly
- **NLP Processing**: Natural language processing extracts placement requests from unstructured text
- **Structured UI**: Parsed requests displayed in an organized, reviewable format
- **Request Types**:
  - **Hard Constraints**: MUST be together / MUST NOT be together
  - **Soft Constraints**: PREFER to be together / PREFER NOT to be together

### 4. Intelligent Sorting Algorithm
The algorithm optimizes for:
- Hard constraints (absolute must/must-not placements)
- Soft constraints (preferences, weighted)
- Gender balance across classes
- Academic level distribution
- Behavioral considerations
- Class size targets

**Conflict Detection**:
- Identifies contradictory requests (e.g., "Leo wants to be with Gary" vs "Gary doesn't want to be with Leo")
- Alerts teachers to impossible constraints
- Provides conflict resolution suggestions

### 5. Interactive Class Management UI
- **Kanban-Style Board**: Drag-and-drop students between classes
- **Real-Time Feedback**: Visual indicators for:
  - Satisfied constraints (green)
  - Violated constraints (red)
  - Class balance metrics
- **Conflict Pane**: Bottom panel shows active conflicts and unmet requests for selected student
- **Freeze Functionality**: Lock specific student placements while re-optimizing others
- **Manual Overrides**: Move students freely with automatic constraint checking

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
- Node.js with Express or similar framework
- RESTful API or GraphQL
- NLP service for email parsing (OpenAI API, AWS Comprehend, or custom)
- Optimization algorithm service
- Background job processing for heavy computations

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

User
  - id
  - email
  - school_id
  - role (admin, teacher)
  - auth_provider

Student
  - id
  - name
  - school_id
  - grade_level
  - metadata (gender, academic_level, behavioral_notes)

Class
  - id
  - school_id
  - scenario_id
  - name
  - teacher_name
  - target_size
  - grade_level

ClassAssignment
  - student_id
  - class_id
  - frozen (boolean)

PlacementRequest
  - id
  - school_id
  - scenario_id
  - student_id
  - target_student_id
  - type (together, not_together)
  - priority (hard, soft)
  - source (email, manual)
  - original_text

Scenario
  - id
  - school_id
  - grade_level
  - name
  - created_by
  - created_at
```

## Algorithm Approach

### Phase 1: Constraint Validation
1. Parse all hard and soft constraints
2. Detect conflicts and impossibilities
3. Build constraint graph
4. Report conflicts to user

### Phase 2: Initial Assignment
1. Start with hard constraints (must-be-together, must-not-be-together)
2. Create student groups based on must-be-together constraints
3. Apply must-not-be-together constraints
4. Distribute groups across classes

### Phase 3: Optimization
1. Score current configuration
2. Apply genetic algorithm or simulated annealing
3. Optimize for:
   - Soft constraint satisfaction
   - Gender balance (target: 50/50 per class)
   - Academic level distribution
   - Behavioral balance
   - Class size targets
4. Iteratively improve until convergence or time limit

### Phase 4: Manual Refinement
1. Present results to teacher
2. Allow drag-and-drop adjustments
3. Re-score and show impact of changes
4. Maintain frozen placements during re-optimization

## User Workflows

### Workflow 1: Initial Setup
1. Teacher logs in via Google/Microsoft
2. Selects grade level / year group
3. Pastes student list
4. Configures classes (number, names, sizes)
5. Pastes parent emails
6. Reviews parsed requests
7. Adds manual constraints
8. Runs sorting algorithm
9. Reviews and adjusts results
10. Freezes and exports final class lists

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

## MVP Feature Set

**Phase 1 (MVP)**:
- Single school setup
- Google OAuth
- Manual student list entry (CSV import)
- Manual request entry (structured form)
- Basic algorithm (hard constraints only)
- Simple class assignment view
- Basic export (CSV)

**Phase 2**:
- Multi-school support
- Email parsing with NLP
- Soft constraints
- Kanban drag-and-drop UI
- Class balancing (gender, academic)
- Scenario management
- Microsoft auth

**Phase 3**:
- Advanced optimization algorithm
- Behavioral balancing
- Conflict resolution suggestions
- Advanced reporting
- Audit logging
- Mobile-responsive design

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
3. **Usability**: Teachers must find it easier than manual sorting
4. **Performance**: Handle schools with 500+ students per grade
5. **Reliability**: Never lose data, always recoverable

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

- How to handle mid-year student transfers?
- Should we support cross-grade constraints (siblings in different grades)?
- What's the maximum number of students we need to support per scenario?
- Should scenarios be shareable across schools (anonymized templates)?
- How long should we retain historical data?

## Project Name

**Classier** - Because class sorting should be classy, and teachers deserve better tools.
