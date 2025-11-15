import { User } from '../models/User.js';
import { School } from '../models/School.js';
import { generateToken } from '../utils/jwt.js';

/**
 * Google OAuth callback handler
 * In production, this would verify the Google token and extract user info
 */
export const googleCallback = async (req, res) => {
  try {
    const { token, email, name, googleId } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ error: 'Email and Google ID required' });
    }

    // Find or create user
    let user = await User.findByOAuth('google', googleId);

    if (!user) {
      // Check if user exists with this email but different provider
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          error: 'User already exists with different auth provider'
        });
      }

      // For MVP, auto-create school if user doesn't exist
      // In production, this would require invitation system
      const schoolName = email.split('@')[1]; // Use domain as school name
      let school = await School.findByName(schoolName);

      if (!school) {
        school = await School.create({ name: schoolName });
      }

      // Create new user as admin (first user in school)
      const existingUsers = await User.findBySchool(school.id);
      const role = existingUsers.length === 0 ? 'admin' : 'teacher';

      user = await User.create({
        email,
        schoolId: school.id,
        role,
        authProvider: 'google',
        authProviderId: googleId,
        name
      });
    }

    // Generate JWT
    const jwtToken = generateToken(user.id, user.email, user.school_id, user.role);

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        schoolId: user.school_id
      }
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Microsoft OAuth callback handler
 */
export const microsoftCallback = async (req, res) => {
  try {
    const { token, email, name, microsoftId } = req.body;

    if (!email || !microsoftId) {
      return res.status(400).json({ error: 'Email and Microsoft ID required' });
    }

    // Find or create user
    let user = await User.findByOAuth('microsoft', microsoftId);

    if (!user) {
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          error: 'User already exists with different auth provider'
        });
      }

      const schoolName = email.split('@')[1];
      let school = await School.findByName(schoolName);

      if (!school) {
        school = await School.create({ name: schoolName });
      }

      const existingUsers = await User.findBySchool(school.id);
      const role = existingUsers.length === 0 ? 'admin' : 'teacher';

      user = await User.create({
        email,
        schoolId: school.id,
        role,
        authProvider: 'microsoft',
        authProviderId: microsoftId,
        name
      });
    }

    const jwtToken = generateToken(user.id, user.email, user.school_id, user.role);

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        schoolId: user.school_id
      }
    });
  } catch (error) {
    console.error('Microsoft OAuth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Get current user info
 */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const school = await School.findById(user.school_id);

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      schoolId: user.school_id,
      school: {
        id: school.id,
        name: school.name,
        settings: school.settings
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
};

/**
 * Logout (client-side token removal, this is just a placeholder)
 */
export const logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};
