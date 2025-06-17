import { useState, useEffect, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../components/contexts/authContext/authContext';
import { adminService } from '../../services/adminService';
import { FaUsers, FaCalendarAlt, FaChartBar } from 'react-icons/fa';

interface SystemStats {
  totalUsers: number;
  totalEvents: number;
}

const AdminDashboard = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.isLoggedIn) {
      navigate('/login');
      return;
    }

    if (!auth.isAdmin) {
      alert('Access denied: You are not an administrator.');
      navigate('/');
      return;
    }

    const fetchStats = async () => {
      setLoadingStats(true);
      setStatsError(null);

      try {
        const systemStatsData = await adminService.getSystemStats();

        setStats({
          totalUsers: systemStatsData.totalUsers || 0,
          totalEvents: systemStatsData.totalEvents || 0,
        });
      } catch (err) {
        console.error('Failed to fetch system stats:', err);
        setStatsError(
          err instanceof Error ? err.message : 'Could not load site statistics.'
        );
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [auth.isLoggedIn, navigate, auth.isAdmin]);

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-primary">Admin Dashboard</h1>
          <p className="mt-2 text-lg text-base-content/70">
            Overview and management tools for the platform.
          </p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="card bg-base-100 shadow-xl border border-primary/20">
            <div className="card-body items-center text-center">
              <FaUsers className="text-5xl text-primary mb-3" />
              <h2 className="card-title text-2xl">Total Users</h2>
              {loadingStats ? (
                <span className="loading loading-dots loading-md"></span>
              ) : (
                <p className="text-4xl font-bold">
                  {stats?.totalUsers ?? (
                    <span className="text-base-content/50">N/A</span>
                  )}
                </p>
              )}
            </div>
          </div>
          <div className="card bg-base-100 shadow-xl border border-secondary/20">
            <div className="card-body items-center text-center">
              <FaCalendarAlt className="text-5xl text-secondary mb-3" />
              <h2 className="card-title text-2xl">Total Events</h2>
              {loadingStats ? (
                <span className="loading loading-dots loading-md"></span>
              ) : (
                <p className="text-4xl font-bold">
                  {stats?.totalEvents ?? (
                    <span className="text-base-content/50">N/A</span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        {statsError && (
          <div className="alert alert-error my-6">
            <FaChartBar />
            <span>Error loading statistics: {statsError}</span>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NavLink
            to="/admin/manage-users" // This route will need to render the user management table
            className="card bg-base-100 shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1"
          >
            <div className="card-body">
              <div className="flex items-center mb-3">
                <FaUsers className="text-3xl text-accent mr-4" />
                <h2 className="card-title text-2xl font-semibold text-accent">
                  Manage Users
                </h2>
              </div>
              <p className="text-base-content/80">
                View, search, block/unblock users, and manage roles.
              </p>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-accent btn-outline">
                  Go to Users
                </button>
              </div>
            </div>
          </NavLink>

          <NavLink
            to="/admin/manage-events" // This route will need to render the event management table
            className="card bg-base-100 shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1"
          >
            <div className="card-body">
              <div className="flex items-center mb-3">
                <FaCalendarAlt className="text-3xl text-info mr-4" />
                <h2 className="card-title text-2xl font-semibold text-info">
                  Manage Events
                </h2>
              </div>
              <p className="text-base-content/80">
                Browse, search, edit, or delete events on the platform.
              </p>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-info btn-outline">
                  Go to Events
                </button>
              </div>
            </div>
          </NavLink>
        </div>
        <div className="mt-12 p-6 bg-base-100 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <FaChartBar className="text-2xl text-neutral mr-3" />
            <h2 className="text-xl font-semibold text-neutral">
              Additional Site Statistics
            </h2>
          </div>
          <p className="text-base-content/70">
            This section can be expanded to display more detailed metrics,
            charts, or reports. For example:
          </p>
          <ul className="list-disc list-inside text-base-content/70 mt-2 pl-5">
            <li>Active users in the last 30 days</li>
            <li>Event creation trends</li>
            <li>Most popular event categories</li>
            <li>User registration growth</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
