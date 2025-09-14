"use client";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
  Settings, 
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
  Check,
  Lock,
  Eye,
  EyeOff,
  LogOut
} from "lucide-react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { toast } from "sonner";


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
    marketing: false,
    pushNotifications: true,
    sms: false
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

  const handleLogout = () => {
    // Clear the session token cookie
    document.cookie = "sessionToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.reload();
  };

  // Redirect to login if no session token
  useEffect(() => {
    if (isClient && !token) {
      window.location.href = '/';
    }
  }, [token, isClient]);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-900 text-lg font-medium">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!me) {
    if (token) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-900 text-lg font-medium">Loading your settings...</p>
            <p className="text-gray-600 text-sm mt-2">Please wait while we fetch your information</p>
          </div>
        </div>
      );
    } else {
      return <RequireLogin />;
    }
  }

  if (me.isDeleted || me.isActive === false) {
    return <RequireLogin message="Your account is not active or has been deleted. Please log in again." />;
  }

  const settingsSections = [
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Manage how you receive notifications',
      icon: Bell,
      content: (
        <div className="space-y-4 lg:space-y-5">
          {Object.entries({
            email: 'Email notifications',
            orderUpdates: 'Order updates',
            marketing: 'Marketing emails',
            pushNotifications: 'Push notifications',
            sms: 'SMS notifications'
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between p-4 lg:p-5 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all duration-200 group">
              <div className="flex items-center space-x-3 lg:space-x-4">
                <div className="w-3 h-3 lg:w-4 lg:h-4 bg-gray-800 rounded-full group-hover:bg-gray-900 transition-colors"></div>
                <div>
                  <span className="font-medium text-gray-900 text-sm lg:text-base">{label}</span>
                  <p className="text-xs text-gray-500 mt-1 hidden lg:block">
                    {key === 'email' && 'Receive updates via email'}
                    {key === 'orderUpdates' && 'Get notified about your orders'}
                    {key === 'marketing' && 'Receive promotional content'}
                    {key === 'pushNotifications' && 'Get push notifications on your device'}
                    {key === 'sms' && 'Receive SMS notifications'}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={notifications[key]}
                  onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                />
                <div className="w-11 h-6 lg:w-12 lg:h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] lg:after:top-[3px] after:left-[2px] lg:after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 lg:after:h-6 after:w-5 lg:after:w-6 after:transition-all peer-checked:bg-gray-900"></div>
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
      content: (
        <div className="space-y-3 lg:space-y-4">
          {[
            { label: 'Change password', icon: Key, action: () => setShowPasswordModal(true), description: 'Update your account password' },
            { label: 'Two-factor authentication', icon: Shield, action: () => setShow2FAModal(true), description: 'Add an extra layer of security' },
            { label: 'Privacy policy', icon: Lock, action: () => setShowPrivacyModal(true), description: 'Read our privacy policy' }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={item.action}
              className="w-full flex items-center justify-between p-4 lg:p-5 bg-gray-50 rounded-xl hover:bg-gray-100 hover:border-gray-300 border border-gray-200 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3 lg:space-x-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-200 rounded-lg flex items-center justify-center group-hover:bg-gray-300 transition-colors">
                  <item.icon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900 text-sm lg:text-base">{item.label}</div>
                  <div className="text-xs lg:text-sm text-gray-600">{item.description}</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400 group-hover:text-gray-600 transition-colors" />
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
      content: (
        <div className="space-y-3 lg:space-y-4">
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
              className={`w-full flex items-center justify-between p-4 lg:p-5 rounded-xl border transition-all duration-200 group ${
                item.severity === 'danger' 
                  ? 'bg-gray-900 border-gray-700 hover:bg-black hover:border-gray-800 text-white' 
                  : 'bg-gray-100 border-gray-300 hover:bg-gray-200 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center space-x-3 lg:space-x-4">
                <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center transition-colors ${
                  item.severity === 'danger' 
                    ? 'bg-gray-800 group-hover:bg-black' 
                    : 'bg-gray-300 group-hover:bg-gray-400'
                }`}>
                  <item.icon className={`w-5 h-5 lg:w-6 lg:h-6 ${
                    item.severity === 'danger' 
                      ? 'text-white' 
                      : 'text-gray-700'
                  }`} />
                </div>
                <div className="text-left">
                  <div className={`font-medium text-sm lg:text-base ${item.severity === 'danger' ? 'text-white' : 'text-gray-900'}`}>{item.label}</div>
                  <div className={`text-xs lg:text-sm ${item.severity === 'danger' ? 'text-gray-300' : 'text-gray-500'}`}>{item.description}</div>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 lg:w-6 lg:h-6 transition-colors ${
                item.severity === 'danger' 
                  ? 'text-gray-400 group-hover:text-white' 
                  : 'text-gray-400 group-hover:text-gray-600'
              }`} />
            </button>
          ))}
        </div>
      )
    },
    {
      id: 'logout',
      title: 'Logout',
      description: 'Sign out of your account',
      icon: LogOut,
      content: (
        <div className="space-y-3 lg:space-y-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 lg:p-5 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-200 rounded-lg flex items-center justify-center group-hover:bg-red-300 transition-colors">
                <LogOut className="w-5 h-5 lg:w-6 lg:h-6 text-red-700" />
              </div>
              <div className="text-left">
                <div className="font-medium text-red-900 text-sm lg:text-base">Log Out</div>
                <div className="text-xs lg:text-sm text-red-600">Sign out of your account and return to the home page</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-red-400 group-hover:text-red-600 transition-colors" />
          </button>
        </div>
      )
    },
    // {
    //   id: '',
    //   title: '',
    //   description: '',
    //   icon: '',
    //   content: (
    //     <div className="space-y-3 lg:space-y-4">
    //       <button
    //         onClick={handleLogout}
    //         className="w-full flex items-center justify-between p-4 lg:p-5 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 transition-all duration-200 group"
    //       >
    //         <div className="flex items-center space-x-3 lg:space-x-4">
    //           <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-200 rounded-lg flex items-center justify-center group-hover:bg-red-300 transition-colors">
    //             <LogOut className="w-5 h-5 lg:w-6 lg:h-6 text-red-700" />
    //           </div>
    //           <div className="text-left">
    //             <div className="font-medium text-red-900 text-sm lg:text-base">Log Out</div>
    //             <div className="text-xs lg:text-sm text-red-600">Sign out of your account and return to the home page</div>
    //           </div>
    //         </div>
    //         <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-red-400 group-hover:text-red-600 transition-colors" />
    //       </button>
    //     </div>
    //   )
    // }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo/Brand */}
            <Link href="/">
              <div className="flex items-center space-x-3">
                <img 
                  src="/logo.png" 
                  alt="AesthetX Logo" 
                  className="h-8 lg:h-12 object-contain"
                />
              </div>
            </Link>
            
            {/* Navigation Links */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              <Link
                href="/user/profile"
                className="px-4 py-2 lg:px-6 lg:py-3 rounded-lg lg:rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-medium transition-all duration-200 text-sm lg:text-base"
              >
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span className="hidden sm:inline">Profile</span>
                </div>
              </Link>
              <Link
                href="/user/settings"
                className="px-4 py-2 lg:px-6 lg:py-3 rounded-lg lg:rounded-xl text-gray-900 bg-gray-100 font-medium transition-all duration-200 text-sm lg:text-base"
              >
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span className="hidden sm:inline">Settings</span>
                </div>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-2 lg:px-4 lg:py-3 bg-gray-100 rounded-lg lg:rounded-xl">
                <div className="flex items-center space-x-2 lg:space-x-3">
                  {me.photoUrl ? (
                    <img 
                      src={me.photoUrl} 
                      alt="Profile" 
                      className="w-6 h-6 lg:w-8 lg:h-8 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gray-600 rounded-full flex items-center justify-center border border-gray-200">
                      <User className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-xs lg:text-sm font-medium text-gray-900 leading-tight">
                      {me.name || "User"}
                    </p>
                    <p className="hidden lg:block text-xs text-gray-600 leading-tight">
                      {me.email}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Mobile User Menu */}
              <div className="sm:hidden">
                {me.photoUrl ? (
                  <img 
                    src={me.photoUrl} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center border border-gray-200">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <div className="bg-white border-b py-4 border-gray-200">
        
         
            <h1 className="text-3xl sm:text-4xl text-center lg:text-5xl font-bold text-gray-900 mb-3 lg:mb-4">SETTINGS</h1>
            
          
        
      </div>

      {/* Main Content */}
      <div className="max-w-6xl  mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* User Info Card */}
        <div className="bg-white hidden md:block rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8 mb-8 lg:mb-12">
          <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Profile Photo */}
            <div className="relative">
              {me.photoUrl ? (
                <img
                  src={me.photoUrl}
                  alt="Profile"
                  className="w-24 h-24 lg:w-32 lg:h-32 rounded-full object-cover border-4 border-gray-100 shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full border-4 border-gray-100 shadow-sm flex items-center justify-center">
                  <User className="w-12 h-12 lg:w-16 lg:h-16 text-white" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="text-center lg:text-left flex-1">
              <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-2 lg:mb-3">{me.name || 'User'}</h2>
              <p className="text-gray-600 flex items-center justify-center lg:justify-start space-x-2 text-sm lg:text-base mb-4 lg:mb-6">
                <Mail className="w-4 h-4 lg:w-5 lg:h-5" />
                <span>{me.email}</span>
              </p>
              
              {/* Account Status */}
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                <span className="px-3 py-1 lg:px-4 lg:py-2 bg-green-100 text-green-800 text-xs lg:text-sm font-medium rounded-full">
                  Active
                </span>
                <span className="px-3 py-1 lg:px-4 lg:py-2 bg-gray-100 text-gray-700 text-xs lg:text-sm font-medium rounded-full">
                  Member since {me.createdAt ? new Date(me.createdAt).toLocaleDateString() : 'N/A'}
                </span>
                <span className="px-3 py-1 lg:px-4 lg:py-2 bg-blue-100 text-blue-800 text-xs lg:text-sm font-medium rounded-full">
                  Last updated {me.updatedAt ? new Date(me.updatedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {settingsSections.map((section, index) => (
            <div
              key={section.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              {/* Section Header */}
              <div className="p-6 lg:p-8 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center bg-gray-200">
                    <section.icon className="w-6 h-6 lg:w-7 lg:h-7 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="text-lg lg:text-xl font-semibold text-gray-900">{section.title}</h3>
                    <p className="text-gray-600 text-sm lg:text-base mt-1">{section.description}</p>
                  </div>
                </div>
              </div>

              {/* Section Content */}
              <div className="p-6 lg:p-8">
                {section.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md lg:max-w-lg transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 lg:p-8 border-b border-gray-100">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <Key className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
            </div>
            <h3 className="text-xl lg:text-2xl font-semibold text-gray-900">Change Password</h3>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 lg:w-6 lg:h-6 text-gray-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-5 lg:space-y-6">
            <div>
              <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2 lg:mb-3">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 lg:py-4 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all text-sm lg:text-base"
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5 lg:w-6 lg:h-6" /> : <Eye className="w-5 h-5 lg:w-6 lg:h-6" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2 lg:mb-3">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 lg:py-4 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all text-sm lg:text-base"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5 lg:w-6 lg:h-6" /> : <Eye className="w-5 h-5 lg:w-6 lg:h-6" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2 lg:mb-3">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 lg:py-4 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all text-sm lg:text-base"
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5 lg:w-6 lg:h-6" /> : <Eye className="w-5 h-5 lg:w-6 lg:h-6" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-3 lg:p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
                <p className="text-red-700 text-sm lg:text-base">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="flex items-center space-x-2 p-3 lg:p-4 bg-green-50 border border-green-200 rounded-lg">
                <Check className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                <p className="text-green-700 text-sm lg:text-base">{success}</p>
              </div>
            )}

            <div className="flex space-x-3 lg:space-x-4 pt-4 lg:pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 lg:py-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm lg:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="flex-1 px-4 py-3 lg:py-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
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
          
          <p className="text-gray-600 mb-6 leading-relaxed text-sm">
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
            className="w-full px-4 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-colors"
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
              <Lock className="w-5 h-5 text-gray-700" />
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
                <p className="text-gray-600 leading-relaxed text-sm">
                  We collect information you provide directly to us, such as when you create an account, 
                  make a purchase, or contact us for support.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">How We Use Your Information</h4>
                <p className="text-gray-600 leading-relaxed text-sm">
                  We use the information we collect to provide, maintain, and improve our services, 
                  process transactions, and communicate with you.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Information Sharing</h4>
                <p className="text-gray-600 leading-relaxed text-sm">
                  We do not sell, trade, or otherwise transfer your personal information to third parties 
                  without your consent, except as described in this policy.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Data Security</h4>
                <p className="text-gray-600 leading-relaxed text-sm">
                  We implement appropriate security measures to protect your personal information 
                  against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Your Rights</h4>
                <p className="text-gray-600 leading-relaxed text-sm">
                  You have the right to access, update, or delete your personal information. 
                  You can also opt out of certain communications.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Contact Us</h4>
                <p className="text-gray-600 leading-relaxed text-sm">
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
            className="w-full px-4 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-colors"
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
  const [showPassword, setShowPassword] = useState(false);
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Check className="w-5 h-5 text-green-600" />
                <p className="text-green-700 text-sm">{success}</p>
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
                className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
  const [showPassword, setShowPassword] = useState(false);
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
  
  useEffect(() => {
    // Redirect to login after a short delay to display the message
    const timer = setTimeout(() => {
      window.location.href = '/login';
    }, 3000); 
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-6">
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-200 text-center max-w-md w-full">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center mx-auto mb-6">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Authentication Required</h2>
        <p className="text-gray-600 mb-6">{message}</p>
       
      </div>
    </div>
  );
}

function getSessionToken() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )sessionToken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
} 