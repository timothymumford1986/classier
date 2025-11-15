import { create } from 'zustand';
import { scenarioAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useScenarioStore = create((set, get) => ({
  scenarios: [],
  currentScenario: null,
  students: [],
  classes: [],
  requests: [],
  assignments: [],
  conflicts: [],
  loading: false,

  fetchScenarios: async (schoolId) => {
    try {
      set({ loading: true });
      const response = await scenarioAPI.getAll(schoolId);
      set({ scenarios: response.data, loading: false });
    } catch (error) {
      console.error('Failed to fetch scenarios:', error);
      toast.error('Failed to load scenarios');
      set({ loading: false });
    }
  },

  fetchScenario: async (scenarioId) => {
    try {
      set({ loading: true });
      const response = await scenarioAPI.getById(scenarioId);
      set({
        currentScenario: response.data,
        students: response.data.students || [],
        classes: response.data.classes || [],
        requests: response.data.requests || [],
        assignments: response.data.assignments || [],
        loading: false
      });
    } catch (error) {
      console.error('Failed to fetch scenario:', error);
      toast.error('Failed to load scenario');
      set({ loading: false });
    }
  },

  createScenario: async (schoolId, data) => {
    try {
      set({ loading: true });
      const response = await scenarioAPI.create(schoolId, data);
      set((state) => ({
        scenarios: [...state.scenarios, response.data],
        loading: false
      }));
      toast.success('Scenario created');
      return response.data;
    } catch (error) {
      console.error('Failed to create scenario:', error);
      toast.error('Failed to create scenario');
      set({ loading: false });
      throw error;
    }
  },

  importStudents: async (scenarioId, text) => {
    try {
      set({ loading: true });
      const response = await scenarioAPI.importStudents(scenarioId, text);
      set((state) => ({
        students: [...state.students, ...response.data.students],
        loading: false
      }));
      toast.success(`Imported ${response.data.count} students`);
      return response.data;
    } catch (error) {
      console.error('Failed to import students:', error);
      toast.error('Failed to import students');
      set({ loading: false });
      throw error;
    }
  },

  importRequests: async (scenarioId, text) => {
    try {
      set({ loading: true });
      const response = await scenarioAPI.importRequests(scenarioId, text);
      set((state) => ({
        requests: [...state.requests, ...response.data.requests],
        loading: false
      }));
      toast.success(`Imported ${response.data.matchedCount} requests`);
      if (response.data.unmatchedCount > 0) {
        toast.error(`${response.data.unmatchedCount} requests couldn't be matched`);
      }
      return response.data;
    } catch (error) {
      console.error('Failed to import requests:', error);
      toast.error('Failed to import requests');
      set({ loading: false });
      throw error;
    }
  },

  optimizeScenario: async (scenarioId) => {
    try {
      set({ loading: true });
      const response = await scenarioAPI.optimize(scenarioId);
      set({
        assignments: response.data.assignments,
        conflicts: response.data.conflicts,
        loading: false
      });
      toast.success('Classes optimized!');
      if (response.data.conflicts.length > 0) {
        toast.error(`${response.data.conflicts.length} conflicts detected`);
      }
      return response.data;
    } catch (error) {
      console.error('Failed to optimize:', error);
      toast.error('Failed to optimize classes');
      set({ loading: false });
      throw error;
    }
  },

  updateAssignment: async (scenarioId, studentId, classId, options = {}) => {
    try {
      const response = await scenarioAPI.updateAssignment(scenarioId, {
        studentId,
        classId,
        ...options
      });

      // Update local state
      set((state) => {
        const newAssignments = state.assignments.filter(a => a.student_id !== studentId);
        newAssignments.push(response.data);
        return { assignments: newAssignments };
      });

      // Recalculate conflicts for this student
      get().calculateConflicts(studentId);

      return response.data;
    } catch (error) {
      console.error('Failed to update assignment:', error);
      toast.error('Failed to move student');
      throw error;
    }
  },

  calculateConflicts: (studentId) => {
    const state = get();
    const { assignments, requests, students } = state;

    const assignmentMap = {};
    assignments.forEach(a => {
      assignmentMap[a.student_id] = a.class_id;
    });

    const studentConflicts = [];

    requests.forEach(request => {
      if (request.student_id !== studentId && request.target_student_id !== studentId) {
        return; // Not relevant to this student
      }

      const studentClass = assignmentMap[request.student_id];
      const targetClass = assignmentMap[request.target_student_id];

      if (request.type === 'together' && studentClass !== targetClass) {
        studentConflicts.push({
          ...request,
          type: 'together_violated',
          message: `${request.student_name} should be with ${request.target_student_name}`
        });
      } else if (request.type === 'not_together' && studentClass === targetClass) {
        studentConflicts.push({
          ...request,
          type: 'not_together_violated',
          message: `${request.student_name} should not be with ${request.target_student_name}`
        });
      }
    });

    set({ conflicts: studentConflicts });
  },

  getStudentsByClass: (classId) => {
    const state = get();
    const studentIds = state.assignments
      .filter(a => a.class_id === classId)
      .map(a => a.student_id);

    return state.students.filter(s => studentIds.includes(s.id));
  },
}));
