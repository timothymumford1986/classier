import { GoogleGenerativeAI } from '@google/genai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-api-key');

/**
 * Parse student list from unstructured text
 * Returns array of student objects
 */
export const parseStudentList = async (text, gradeLevel) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
You are a data extraction assistant. Parse the following student list and extract structured information.

The text may be in any format (comma-separated, line-by-line, table format, etc.).

Extract for each student:
- name (required)
- gender (optional: male, female, or omit if not mentioned)
- studentId (optional: any ID number if present)

Return ONLY a valid JSON array with no additional text or markdown formatting. Example format:
[
  {"name": "John Smith", "gender": "male", "studentId": "12345"},
  {"name": "Jane Doe", "gender": "female"}
]

Student list text:
${text}

Return JSON array:`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let responseText = response.text().trim();

    // Remove markdown code blocks if present
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    const students = JSON.parse(responseText);

    // Add grade level to all students
    return students.map(student => ({
      ...student,
      gradeLevel
    }));
  } catch (error) {
    console.error('Error parsing student list:', error);
    throw new Error('Failed to parse student list: ' + error.message);
  }
};

/**
 * Parse placement requests from unstructured text
 * Returns array of placement request objects
 */
export const parsePlacementRequests = async (text, students) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const studentNames = students.map(s => s.name).join(', ');

    const prompt = `
You are a request extraction assistant. Parse placement requests from parent/teacher communications.

Available student names: ${studentNames}

Extract placement requests from the text. Look for patterns like:
- "X should be with Y" or "keep X and Y together" → type: "together"
- "X shouldn't be with Y" or "separate X and Y" → type: "not_together"
- "must", "needs to", "required" → priority: "hard"
- "prefer", "would like", "hope" → priority: "soft"

Return ONLY a valid JSON array with no additional text or markdown. Each request should have:
- studentName: name of the student making/receiving request
- targetStudentName: name of the other student
- type: "together" or "not_together"
- priority: "hard" or "soft"
- originalText: the relevant snippet from the text

Example format:
[
  {
    "studentName": "Leo",
    "targetStudentName": "Gary",
    "type": "not_together",
    "priority": "hard",
    "originalText": "My kid, Leo, shouldn't be with Gary"
  }
]

Text to parse:
${text}

Return JSON array:`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let responseText = response.text().trim();

    // Remove markdown code blocks if present
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    const requests = JSON.parse(responseText);

    // Match student names to IDs
    return requests.map(request => {
      const student = students.find(s =>
        s.name.toLowerCase().includes(request.studentName.toLowerCase()) ||
        request.studentName.toLowerCase().includes(s.name.toLowerCase())
      );

      const targetStudent = students.find(s =>
        s.name.toLowerCase().includes(request.targetStudentName.toLowerCase()) ||
        request.targetStudentName.toLowerCase().includes(s.name.toLowerCase())
      );

      return {
        ...request,
        studentId: student?.id || null,
        targetStudentId: targetStudent?.id || null,
        matched: !!(student && targetStudent)
      };
    });
  } catch (error) {
    console.error('Error parsing placement requests:', error);
    throw new Error('Failed to parse placement requests: ' + error.message);
  }
};

/**
 * Parse and extract academic level from behavioral notes
 */
export const extractAcademicLevel = async (behavioralNotes) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Based on these behavioral/academic notes, determine the student's academic level.

Return ONLY one of these exact values: "high", "medium", "low", or "unknown"

Notes: ${behavioralNotes}

Academic level:`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const level = response.text().trim().toLowerCase();

    if (['high', 'medium', 'low'].includes(level)) {
      return level;
    }

    return 'unknown';
  } catch (error) {
    console.error('Error extracting academic level:', error);
    return 'unknown';
  }
};
