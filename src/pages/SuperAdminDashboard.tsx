import { useAuthStore, UserRole } from "@/stores/authStore";
import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Users,
  UserPlus,
  Mail,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Calendar,
  Trash2,
  Edit,
  Shield,
  AlertCircle,
  X,
} from "lucide-react";
import { axiosInstance } from "@/lib/api_provider";

interface User {
  id: number;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  created_by: number | null;
}

export default function SuperAdminDashboard() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/auth/users");
      setUsers(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users
  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.is_active).length,
    inactiveUsers: users.filter((u) => !u.is_active).length,
    superAdmins: users.filter((u) => u.role === UserRole.SUPER_ADMIN).length,
    admins: users.filter((u) => u.role === UserRole.ADMIN).length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Super Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Full system control and management</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">
              Super Administrator
            </span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active"
          value={stats.activeUsers}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Inactive"
          value={stats.inactiveUsers}
          icon={XCircle}
          color="gray"
        />
        <StatCard
          title="Super Admins"
          value={stats.superAdmins}
          icon={ShieldCheck}
          color="purple"
        />
        <StatCard
          title="Admins"
          value={stats.admins}
          icon={Shield}
          color="cyan"
        />
      </div>

      {/* User Management Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                User Management
              </h2>
            </div>

            <div className="flex items-center gap-3 flex-1 max-w-2xl">
              {/* Search Bar */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Create User Button */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Add User</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-gray-600">Loading users...</span>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                {searchQuery ? "No users found" : "No users yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <SuperAdminUserRow
                  key={user.id}
                  user={user}
                  currentUser={currentUser}
                  onRefresh={fetchUsers}
                  onEdit={(u) => {
                    setSelectedUser(u);
                    setShowEditModal(true);
                  }}
                  setError={setError}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchUsers();
          }}
          setError={setError}
        />
      )}

      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedUser(null);
            fetchUsers();
          }}
          setError={setError}
        />
      )}
    </div>
  );
}

// Helper Components

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: "blue" | "green" | "purple" | "gray" | "cyan";
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: "from-blue-50 to-blue-100 text-blue-600",
    green: "from-green-50 to-green-100 text-green-600",
    purple: "from-purple-50 to-purple-100 text-purple-600",
    gray: "from-gray-50 to-gray-100 text-gray-600",
    cyan: "from-cyan-50 to-cyan-100 text-cyan-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} inline-flex mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
}

interface SuperAdminUserRowProps {
  user: User;
  currentUser: any;
  onRefresh: () => void;
  onEdit: (user: User) => void;
  setError: (error: string) => void;
}

function SuperAdminUserRow({
  user,
  currentUser,
  onRefresh,
  onEdit,
  setError,
}: SuperAdminUserRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const isCurrentUser = user.id === currentUser?.id;

  const handleToggleActive = async () => {
    if (isCurrentUser) {
      setError("You cannot deactivate your own account");
      return;
    }

    try {
      setIsToggling(true);
      await axiosInstance.patch(`/auth/users/${user.id}/toggle-active`);
      onRefresh();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to toggle user status");
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    if (isCurrentUser) {
      setError("You cannot delete your own account");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete user ${user.email}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      await axiosInstance.delete(`/auth/users/${user.id}`);
      onRefresh();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleBadge = (role: UserRole) => {
    if (role === UserRole.SUPER_ADMIN) {
      return (
        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          Super Admin
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
        <Shield className="w-3 h-3" />
        Admin
      </span>
    );
  };

  return (
    <div
      className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition ${
        isCurrentUser ? "ring-2 ring-purple-300" : ""
      }`}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
          <Users className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900 truncate">
              {user.full_name || "No name"}
            </p>
            {isCurrentUser && (
              <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded flex-shrink-0">
                You
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <p className="text-sm text-gray-600 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 ml-4">
        <div className="text-right hidden lg:block">
          <p className="text-xs text-gray-500">Created</p>
          <div className="flex items-center gap-1 mt-1">
            <Calendar className="w-3 h-3 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">
              {formatDate(user.created_at)}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleActive}
          disabled={isToggling || isCurrentUser}
          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition ${
            user.is_active
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          } ${isCurrentUser ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          {user.is_active ? (
            <CheckCircle className="w-3 h-3" />
          ) : (
            <XCircle className="w-3 h-3" />
          )}
          {user.is_active ? "Active" : "Inactive"}
        </button>

        {getRoleBadge(user.role)}

        <button
          onClick={() => onEdit(user)}
          disabled={isCurrentUser}
          className={`p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition ${
            isCurrentUser ? "opacity-50 cursor-not-allowed" : ""
          }`}
          title="Edit role"
        >
          <Edit className="w-4 h-4" />
        </button>

        <button
          onClick={handleDelete}
          disabled={isDeleting || isCurrentUser}
          className={`p-2 text-red-600 hover:bg-red-50 rounded-lg transition ${
            isDeleting || isCurrentUser ? "opacity-50 cursor-not-allowed" : ""
          }`}
          title="Delete user"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Create User Modal
interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
  setError: (error: string) => void;
}

function CreateUserModal({ onClose, onSuccess, setError }: CreateUserModalProps) {
  const [formData, setFormData] = useState<{
    email: string;
    password: string;
    full_name: string;
    role: UserRole;
  }>({
    email: "",
    password: "",
    full_name: "",
    role: UserRole.ADMIN,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      setIsSubmitting(true);
      await axiosInstance.post("/auth/users", formData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Create New User</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Min 8 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value as UserRole })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={UserRole.ADMIN}>Admin</option>
              <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit User Modal (Role Change)
interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
  setError: (error: string) => void;
}

function EditUserModal({ user, onClose, onSuccess, setError }: EditUserModalProps) {
  const [role, setRole] = useState(user.role);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      await axiosInstance.put(`/auth/users/${user.id}/role`, { role });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update user role");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Edit User Role</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-gray-600" />
              <p className="text-sm font-medium text-gray-900">{user.email}</p>
            </div>
            <p className="text-sm text-gray-600">{user.full_name || "No name"}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={UserRole.ADMIN}>Admin</option>
              <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || role === user.role}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isSubmitting ? "Updating..." : "Update Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}