import express from 'express';
import {
  getScenarios,
  getScenario,
  createScenario,
  importStudents,
  importRequests,
  optimizeScenario,
  updateAssignment,
  deleteScenario
} from '../controllers/scenarioController.js';
import { authenticate, validateSchoolAccess } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Scenario management
router.get('/school/:schoolId', validateSchoolAccess, getScenarios);
router.post('/school/:schoolId', validateSchoolAccess, createScenario);
router.get('/:scenarioId', getScenario);
router.delete('/:scenarioId', deleteScenario);

// Student import
router.post('/:scenarioId/students/import', importStudents);

// Request import
router.post('/:scenarioId/requests/import', importRequests);

// Optimization
router.post('/:scenarioId/optimize', optimizeScenario);

// Assignment updates (drag & drop)
router.put('/:scenarioId/assignments', updateAssignment);

export default router;
