import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import leadApi from "../../api/leadApi";
import authApi from "../../api/authApi";
import auditApi from "../../api/auditApi";

const Analytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalLeads: 0,
    leadsByStatus: {},
    leadsBySource: {},
    users: [],
    userPerformance: [],
  });

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/login");
    } else {
      const parsedUser = JSON.parse(user);
      if (parsedUser.role !== "admin") {
        navigate("/dashboard");
      } else {
        fetchAnalytics();
      }
    }
  }, [navigate]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError("");
    try {
      const [leadsRes, usersRes] = await Promise.all([
        leadApi.getLeads(),
        authApi.getAllUsers(),
      ]);

      const leads = Array.isArray(leadsRes) ? leadsRes : [];
      const users = Array.isArray(usersRes) ? usersRes : [];

      // Calculate leads by status
      const leadsByStatus = leads.reduce((acc, lead) => {
        const status = lead.status || "new";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      // Calculate leads by source
      const leadsBySource = leads.reduce((acc, lead) => {
        const source = lead.source || "Manual";
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {});

      // Calculate user performance
      const userPerformance = users.map((user) => {
        const userLeads = leads.filter(
          (lead) => lead.assignedTo && lead.assignedTo._id === user._id,
        );
        return {
          _id: user._id,
          name: user.name,
          role: user.role,
          totalLeads: userLeads.length,
          newLeads: userLeads.filter((l) => l.status === "new").length,
          qualifiedLeads: userLeads.filter((l) => l.status === "qualified")
            .length,
        };
      });

      setStats({
        totalLeads: leads.length,
        leadsByStatus,
        leadsBySource,
        users,
        userPerformance,
      });
    } catch (err) {
      console.error("Fetch analytics error:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      new: "bg-blue-500",
      contacted: "bg-yellow-500",
      qualified: "bg-green-500",
      lost: "bg-red-500",
      draft: "bg-gray-500",
      submitted: "bg-purple-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: "bg-red-100 text-red-800",
      telecaller: "bg-blue-100 text-blue-800",
      sales: "bg-green-100 text-green-800",
      user: "bg-gray-100 text-gray-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics & Performance
          </h1>
          <p className="text-gray-600 mt-1">
            Overview of leads, users, and performance metrics
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 border border-red-200">
            {error}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-3xl font-bold text-indigo-600">
              {stats.totalLeads}
            </div>
            <div className="text-gray-500 text-sm mt-1">Total Leads</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-3xl font-bold text-blue-600">
              {stats.users.length}
            </div>
            <div className="text-gray-500 text-sm mt-1">Total Users</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-3xl font-bold text-green-600">
              {stats.leadsByStatus.qualified || 0}
            </div>
            <div className="text-gray-500 text-sm mt-1">Qualified Leads</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-3xl font-bold text-yellow-600">
              {stats.leadsByStatus.contacted || 0}
            </div>
            <div className="text-gray-500 text-sm mt-1">Contacted</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Leads by Status */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Leads by Status
            </h2>
            <div className="space-y-3">
              {Object.keys(stats.leadsByStatus).length === 0 ? (
                <div className="text-gray-500 text-sm">No data available</div>
              ) : (
                Object.entries(stats.leadsByStatus).map(([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}
                      ></div>
                      <span className="text-gray-700 capitalize">{status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getStatusColor(status)}`}
                          style={{
                            width: `${(count / stats.totalLeads) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-gray-900 font-medium w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Leads by Source */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Leads by Source
            </h2>
            <div className="space-y-3">
              {Object.keys(stats.leadsBySource).length === 0 ? (
                <div className="text-gray-500 text-sm">No data available</div>
              ) : (
                Object.entries(stats.leadsBySource).map(([source, count]) => (
                  <div
                    key={source}
                    className="flex items-center justify-between"
                  >
                    <span className="text-gray-700">{source}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500"
                          style={{
                            width: `${(count / stats.totalLeads) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-gray-900 font-medium w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* User Performance Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              User Performance
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total Leads
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    New
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Qualified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Conversion
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.userPerformance.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {user.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadge(user.role)}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900 font-medium">
                        {user.totalLeads}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-600">{user.newLeads}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-green-600 font-medium">
                        {user.qualifiedLeads}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">
                        {user.totalLeads > 0
                          ? Math.round(
                              (user.qualifiedLeads / user.totalLeads) * 100,
                            )
                          : 0}
                        %
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
