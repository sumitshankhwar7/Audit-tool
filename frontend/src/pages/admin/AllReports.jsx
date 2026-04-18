import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import reportApi from "../../api/reportApi";
import leadApi from "../../api/leadApi";

const AllReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/login");
    } else {
      const parsedUser = JSON.parse(user);
      if (parsedUser.role !== "admin") {
        navigate("/dashboard");
      } else {
        fetchData();
      }
    }
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [reportsRes, leadsRes] = await Promise.all([
        reportApi.getReports(),
        leadApi.getLeads(),
      ]);

      setReports(Array.isArray(reportsRes) ? reportsRes : []);
      setLeads(Array.isArray(leadsRes) ? leadsRes : []);
    } catch (err) {
      console.error("Fetch data error:", err);
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const getLeadName = (leadId) => {
    const lead = leads.find((l) => l._id === leadId);
    return lead?.businessName || "Unknown";
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const filteredReports =
    filter === "all" ? reports : reports.filter((r) => r.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Reports</h1>
            <p className="text-gray-600 mt-1">
              View and manage all generated audit reports
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex gap-2">
            {["all", "pending", "processing", "completed", "failed"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                    filter === status
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 border border-red-200">
            {error}
          </div>
        )}

        {/* Reports Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading reports...
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {filter === "all" ? "No reports found" : `No ${filter} reports`}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Lead
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Requested By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Requested At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Generated At
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredReports.map((report) => (
                    <tr key={report._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {getLeadName(report.leadId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(report.status)}`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-600">
                          {report.requestedBy?.name || "Unknown"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-500 text-sm">
                          {report.createdAt
                            ? new Date(report.createdAt).toLocaleString()
                            : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-500 text-sm">
                          {report.generatedAt
                            ? new Date(report.generatedAt).toLocaleString()
                            : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {report.reportUrl && (
                          <a
                            href={report.reportUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          >
                            View Report
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-gray-900">
              {reports.length}
            </div>
            <div className="text-gray-500 text-sm">Total Reports</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {reports.filter((r) => r.status === "pending").length}
            </div>
            <div className="text-gray-500 text-sm">Pending</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-green-600">
              {reports.filter((r) => r.status === "completed").length}
            </div>
            <div className="text-gray-500 text-sm">Completed</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-red-600">
              {reports.filter((r) => r.status === "failed").length}
            </div>
            <div className="text-gray-500 text-sm">Failed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllReports;
