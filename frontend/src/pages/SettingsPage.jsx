import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { ConfirmDialog } from '../components/ConfirmDialog';
import toast from 'react-hot-toast';

export const SettingsPage = () => {
  const { user } = useAuthStore();
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  // School settings
  const [schoolSettings, setSchoolSettings] = useState({
    name: user?.school?.name || '',
    academicStreaming: user?.school?.settings?.academic_streaming_enabled || false,
    defaultClassSize: user?.school?.settings?.default_class_size || 25
  });

  const handleSaveSchoolSettings = async () => {
    try {
      // API call to save settings
      toast.success('School settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // API call to delete account
      toast.success('Account deleted');
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        {/* School Settings */}
        {user?.role === 'admin' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">School Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Name
                </label>
                <input
                  type="text"
                  value={schoolSettings.name}
                  onChange={(e) => setSchoolSettings({ ...schoolSettings, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Class Size
                </label>
                <input
                  type="number"
                  min="10"
                  max="50"
                  value={schoolSettings.defaultClassSize}
                  onChange={(e) => setSchoolSettings({ ...schoolSettings, defaultClassSize: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="academicStreaming"
                  checked={schoolSettings.academicStreaming}
                  onChange={(e) => setSchoolSettings({ ...schoolSettings, academicStreaming: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="academicStreaming" className="text-sm font-medium text-gray-700">
                  Enable Academic Streaming
                  <p className="text-xs text-gray-500 font-normal">
                    When enabled, the algorithm will create high/medium/low achievement classes
                  </p>
                </label>
              </div>

              <button
                onClick={handleSaveSchoolSettings}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save School Settings
              </button>
            </div>
          </div>
        )}

        {/* Team Members */}
        {user?.role === 'admin' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Members</h2>

            <div className="space-y-3">
              {/* Mock team members */}
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  Admin
                </span>
              </div>
            </div>

            <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              + Invite Team Member
            </button>

            <p className="text-xs text-gray-500 mt-2">
              Coming soon: Invite teachers and admins to your school
            </p>
          </div>
        )}

        {/* Account Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account</h2>

          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-700">Email</div>
              <div className="text-gray-900">{user?.email}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700">Role</div>
              <div className="text-gray-900 capitalize">{user?.role}</div>
            </div>

            <div className="pt-4 border-t">
              <button
                onClick={() => setShowDeleteAccount(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Account
              </button>
              <p className="text-xs text-gray-500 mt-2">
                This will permanently delete your account and all associated data
              </p>
            </div>
          </div>
        </div>

        {/* Billing (Placeholder) */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Billing</h2>
          <p className="text-gray-600">
            Billing features coming soon. Contact us for enterprise pricing.
          </p>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone and will delete all your scenarios and data."
        confirmText="Delete Account"
        confirmStyle="danger"
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteAccount(false)}
      />
    </div>
  );
};
