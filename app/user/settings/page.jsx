"use client";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
  Settings, 
  ArrowLeft, 
  Bell, 
  Shield, 
  X, 
  User,
  Key,
  Trash2,
  UserX,
  ChevronRight,
  Mail,
  AlertTriangle,
  Check
} from "lucide-react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { toast } from "sonner"; // Assuming you have sonner for toasts
import { useRouter } from "next/navigation"; // Import useRouter here

export default function UserSettingsPage() {
  const [token, setToken] = useState(null);
  const [isClient, setIsClient] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Notification settings state
  const [notifications, setNotifications] = useState({
    email: true,
    orderUpdates: true,
    marketing: false
  });

  useEffect(() => {
    setIsClient(true);
    const getSessionToken = () => {
      const match = document.cookie.match(/(?:^|; )sessionToken=([^;]+)/);
      return match ? decodeURIComponent(match[1]) : null;
    };
    
    const sessionToken = getSessionToken();
    setToken(sessionToken);
  }, []);

  const me = useQuery(api.users.meByToken, token ? { token } : "skip");
  const moveToTrash = useMutation(api.users.moveUserToTrash);
  const deactivateUser = useMutation(api.users.deactivateUser);

  // Redirect to login if no session token
  useEffect(() => {
    if (isClient && !token) {
      router.push('/login'); // Assuming router is imported from 'next/navigation'
    }
  }, [token, isClient]);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-800 mx-auto mb-4"></div>
          <p className="text-gray-800 text-lg">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!me) {
    // Check if we have a token but no user (invalid/expired session)
    if (token) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-800 mx-auto mb-4"></div>
            <p className="text-gray-800 text-lg">Loading your settings...</p>
            <p className="text-gray-600 text-sm mt-2">Please wait while we fetch your information</p>
          </div>
        </div>
      );
    } else {
      // No token, redirect to login
      return <RequireLogin />;
    }
  }

  // Check if user is deleted or inactive
  if (me.isDeleted || me.isActive === false) {
    // router.push('/login'); // Assuming router is imported from 'next/navigation'
    return <RequireLogin message="Your account is not active or has been deleted. Please log in again." />;
  }

  const settingsSections = [
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Manage how you receive notifications',
      icon: Bell,
      color: 'gray',
      content: (
        <div className="space-y-4">
          {Object.entries({
            email: 'Email notifications',
            orderUpdates: 'Order updates',
            marketing: 'Marketing emails'
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                <span className="font-medium text-gray-900">{label}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={notifications[key]}
                  onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-800"></div>
              </label>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'security',
      title: 'Privacy & Security',
      description: 'Control your privacy and security settings',
      icon: Shield,
      color: 'gray',
      content: (
        <div className="space-y-3">
          {[
            { label: 'Change password', icon: Key, action: () => setShowPasswordModal(true) },
            { label: 'Two-factor authentication', icon: Shield, action: () => setShow2FAModal(true) },
            { label: 'Privacy policy', icon: User, action: () => setShowPrivacyModal(true) }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={item.action}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 hover:border-gray-300 border border-gray-200 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center group-hover:bg-gray-300 transition-colors">
                  <item.icon className="w-5 h-5 text-gray-700" />
                </div>
                <span className="font-medium text-gray-900">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>
          ))}
        </div>
      )
    },
    {
      id: 'account',
      title: 'Account Management',
      description: 'Manage your account settings',
      icon: Settings,
      color: 'gray',
      isDanger: true,
      content: (
        <div className="space-y-3">
          {[
            { 
              label: 'Deactivate account', 
              description: 'Temporarily disable your account',
              icon: UserX, 
              action: () => setShowDeactivateModal(true),
              severity: 'warning'
            },
            { 
              label: 'Move account to trash', 
              description: 'Your account will be moved to trash and can be restored by administrators within 30 days.',
              icon: Trash2, 
              action: () => setShowDeleteModal(true),
              severity: 'danger'
            }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={item.action}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group ${
                item.severity === 'danger' 
                  ? 'bg-gray-900 border-gray-700 hover:bg-black hover:border-gray-800 text-white' 
                  : 'bg-gray-100 border-gray-300 hover:bg-gray-200 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  item.severity === 'danger' 
                    ? 'bg-gray-800 group-hover:bg-black' 
                    : 'bg-gray-300 group-hover:bg-gray-400'
                }`}>
                  <item.icon className={`w-5 h-5 ${
                    item.severity === 'danger' 
                      ? 'text-white' 
                      : 'text-gray-700'
                  }`} />
                </div>
                <div className="text-left">
                  <div className={`font-medium ${item.severity === 'danger' ? 'text-white' : 'text-gray-900'}`}>{item.label}</div>
                  <div className={`text-sm ${item.severity === 'danger' ? 'text-gray-300' : 'text-gray-500'}`}>{item.description}</div>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 transition-colors ${
                item.severity === 'danger' 
                  ? 'text-gray-400 group-hover:text-white' 
                  : 'text-gray-400 group-hover:text-gray-600'
              }`} />
            </button>
          ))}
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white/95 backdrop-blur-2xl border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo/Brand */}
            <Link href="/">
            <div className="flex items-center space-x-4">
              <img 
                src="/logo.png" 
                alt="AesthetX Logo" 
                className="h-12 object-contain drop-shadow-sm"
              />
            </div>
            </Link>
            {/* Navigation Links */}
            <div className="flex items-center space-x-2">
              <Link
                href="/user/profile"
                className="px-6 py-3 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 font-semibold transition-all duration-300 hover:scale-105 border border-transparent hover:border-gray-200/50"
              >
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </div>
              </Link>
              <Link
                href="/user/settings"
                className="px-6 py-3 rounded-xl text-gray-900 bg-gradient-to-r from-gray-100 to-gray-200 font-semibold transition-all duration-300 hover:from-gray-200 hover:to-gray-300 hover:scale-105 shadow-sm border border-gray-200/50"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Settings</span>
                </div>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200/50">
                <div className="flex items-center space-x-2">
                  {me.photoUrl ? (
                    <img 
                      src={me.photoUrl} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">
                      {me.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 leading-tight">
                      {me.email}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Mobile User Menu */}
              <div className="md:hidden">
                {me.photoUrl ? (
                  <img 
                    src={me.photoUrl} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center border-2 border-gray-200 shadow-sm">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <div className="text-center mb-12 pt-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Settings</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Manage your account preferences and settings
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - User Info & Account Status */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Info Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Account Info</h3>

                {/* Profile Photo */}
                <div className="relative mb-6">
                  {me.photoUrl ? (
                    <img
                      src={me.photoUrl}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-gray-200 shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full mx-auto border-4 border-gray-200 shadow-lg flex items-center justify-center">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{me.name || 'User'}</h2>
                  <p className="text-gray-600 flex items-center justify-center space-x-2 mt-2">
                    <Mail className="w-4 h-4" />
                    <span>{me.email}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm font-medium text-gray-900">
                    {me.createdAt ? new Date(me.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm font-medium text-gray-900">
                    {me.updatedAt ? new Date(me.updatedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Settings Sections */}
          <div className="lg:col-span-2 space-y-6">
            {settingsSections.map((section, index) => (
              <div
                key={section.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Section Header */}
                <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md bg-gray-200">
                      <section.icon className="w-6 h-6 text-gray-700" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
                      <p className="text-gray-600 mt-1">{section.description}</p>
                    </div>
                  </div>
                </div>

                {/* Section Content */}
                <div className="p-8">
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals with improved styling */}
      {showPasswordModal && (
        <PasswordChangeModal 
          onClose={() => setShowPasswordModal(false)}
          userId={me._id}
        />
      )}

      {show2FAModal && (
        <TwoFactorModal 
          onClose={() => setShow2FAModal(false)}
          userId={me._id}
        />
      )}

      {showPrivacyModal && (
        <PrivacyPolicyModal 
          onClose={() => setShowPrivacyModal(false)}
        />
      )}

      {showDeactivateModal && (
        <DeactivateAccountModal 
          onClose={() => setShowDeactivateModal(false)}
          userId={me._id}
          deactivateUser={deactivateUser}
        />
      )}

      {showDeleteModal && (
        <DeleteAccountModal 
          onClose={() => setShowDeleteModal(false)}
          userId={me._id}
          moveToTrash={moveToTrash}
        />
      )}
    </div>
  );
}

// Enhanced Password Change Modal
function PasswordChangeModal({ onClose, userId }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      setBusy(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      setBusy(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess("Password changed successfully!");
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError("Failed to change password. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
              <Key className="w-5 h-5 text-gray-700" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Change Password</h3>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                placeholder="Enter current password"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                placeholder="Enter new password"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                placeholder="Confirm new password"
                required
              />
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-3 bg-gray-100 border border-gray-300 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-gray-600" />
                <p className="text-gray-700 text-sm">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="flex items-center space-x-2 p-3 bg-gray-100 border border-gray-300 rounded-lg">
                <Check className="w-5 h-5 text-gray-600" />
                <p className="text-gray-700 text-sm">{success}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? "Changing..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Enhanced Two-Factor Modal
function TwoFactorModal({ onClose, userId }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-gray-700" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Two-Factor Authentication</h3>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-gray-700" />
          </div>
          
          <h4 className="text-2xl font-bold text-gray-900 mb-3">Coming Soon!</h4>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Two-factor authentication is currently under development. This feature will add an extra layer of security to your account.
          </p>
          
          <div className="bg-gray-100 rounded-xl p-4 mb-6">
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                <span>QR codes for authenticator apps</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                <span>SMS verification codes</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                <span>Backup recovery codes</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                <span>Enhanced account security</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-black transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

// Enhanced Privacy Policy Modal
function PrivacyPolicyModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-gray-700" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Privacy Policy</h3>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="prose prose-gray max-w-none">
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Information We Collect</h4>
                <p className="text-gray-600 leading-relaxed">
                  We collect information you provide directly to us, such as when you create an account, 
                  make a purchase, or contact us for support.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">How We Use Your Information</h4>
                <p className="text-gray-600 leading-relaxed">
                  We use the information we collect to provide, maintain, and improve our services, 
                  process transactions, and communicate with you.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Information Sharing</h4>
                <p className="text-gray-600 leading-relaxed">
                  We do not sell, trade, or otherwise transfer your personal information to third parties 
                  without your consent, except as described in this policy.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Data Security</h4>
                <p className="text-gray-600 leading-relaxed">
                  We implement appropriate security measures to protect your personal information 
                  against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Your Rights</h4>
                <p className="text-gray-600 leading-relaxed">
                  You have the right to access, update, or delete your personal information. 
                  You can also opt out of certain communications.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Contact Us</h4>
                <p className="text-gray-600 leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at 
                  <span className="font-medium text-gray-800"> privacy@aesthetx.ways</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-black transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Enhanced Deactivate Account Modal
function DeactivateAccountModal({ onClose, userId, deactivateUser }) {
  const [reason, setReason] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  const handleDeactivate = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please provide a reason for deactivation");
      return;
    }
    if (!password) {
      setError("Please enter your password to confirm");
      return;
    }

    setBusy(true);
    try {
      await deactivateUser({ 
        userId: userId, 
        reason: reason.trim() 
      });
      
      setSuccess("Account deactivated successfully. Logging you out...");
      
      setTimeout(() => {
        document.cookie = "sessionToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "/";
      }, 2000);
      
    } catch (err) {
      setError("Failed to deactivate account. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
              <UserX className="w-5 h-5 text-gray-700" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Deactivate Account</h3>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Warning */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start space-x-3 p-4 bg-gray-100 border border-gray-300 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <p className="text-gray-800 font-medium text-sm">Account Deactivation</p>
              <p className="text-gray-700 text-sm mt-1">
                Your account will be temporarily deactivated. You can reactivate it by logging in again.
              </p>
            </div>
          </div>
        </div>
        
        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleDeactivate} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for deactivation
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Select a reason</option>
                <option value="temporary">Taking a break</option>
                <option value="privacy">Privacy concerns</option>
                <option value="not_using">Not using the service</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm your password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-3 bg-gray-100 border border-gray-300 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-gray-600" />
                <p className="text-gray-700 text-sm">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="flex items-center space-x-2 p-3 bg-gray-100 border border-gray-300 rounded-lg">
                <Check className="w-5 h-5 text-gray-600" />
                <p className="text-gray-700 text-sm">{success}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? "Deactivating..." : "Deactivate Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Enhanced Delete Account Modal
function DeleteAccountModal({ onClose, userId, moveToTrash }) {
  const [reason, setReason] = useState("");
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please provide a reason for deletion");
      return;
    }
    if (!password) {
      setError("Please enter your password to confirm");
      return;
    }
    if (confirmText !== "DELETE") {
      setError("Please type DELETE to confirm");
      return;
    }

    setBusy(true);
    try {
      await moveToTrash({ 
        userId: userId, 
        reason: reason.trim() 
      });
      
      setSuccess("Account moved to trash successfully. Logging you out...");
      
      setTimeout(() => {
        document.cookie = "sessionToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "/";
      }, 2000);
      
    } catch (err) {
      setError("Failed to move account to trash. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-gray-700" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Move Account to Trash</h3>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Warning */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start space-x-3 p-4 bg-gray-900 border border-gray-700 rounded-xl text-white">
            <AlertTriangle className="w-5 h-5 text-white mt-0.5" />
            <div>
              <p className="font-medium text-sm mb-2">⚠️ Warning: This action will move your account to trash!</p>
              <p className="text-gray-300 text-sm">
                Your account will be moved to trash and can be restored by administrators within 30 days. 
                After 30 days, it will be permanently deleted.
              </p>
            </div>
          </div>
        </div>
        
        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleDelete} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for deletion
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Select a reason</option>
                <option value="privacy">Privacy concerns</option>
                <option value="not_satisfied">Not satisfied with service</option>
                <option value="duplicate">Duplicate account</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm your password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type "DELETE" to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                placeholder="Type DELETE"
                required
              />
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-3 bg-gray-100 border border-gray-300 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-gray-600" />
                <p className="text-gray-700 text-sm">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="flex items-center space-x-2 p-3 bg-gray-100 border border-gray-300 rounded-lg">
                <Check className="w-5 h-5 text-gray-600" />
                <p className="text-gray-700 text-sm">{success}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-colors disabled:opacity-50"
              >
                {busy ? "Moving to Trash..." : "Move to Trash"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function RequireLogin({ message = "Please log in to access your settings and preferences." }) {
  const router = useRouter(); // Import useRouter here
  
  useEffect(() => {
    // Redirect to login after a short delay to display the message
    const timer = setTimeout(() => {
      router.push('/login');
    }, 3000); 
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-6">
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-200 text-center max-w-md w-full">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center mx-auto mb-6">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Authentication Required</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <Link 
          href="/login"
          className="inline-flex items-center px-6 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-black transition-colors"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}

function getSessionToken() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )sessionToken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
} 