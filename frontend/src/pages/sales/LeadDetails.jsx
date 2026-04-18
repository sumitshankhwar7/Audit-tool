import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import leadApi from "../../api/leadApi";

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchLead();
  }, [id]);

  const fetchLead = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await leadApi.getLeadById(id);
      setLead(res);
    } catch (err) {
      console.error("Fetch lead error:", err);
      setError("Failed to load lead details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      const res = await leadApi.updateLead(id, { status: newStatus });
      setLead(res);
    } catch (err) {
      console.error("Update error:", err);
      setError("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;

    try {
      await leadApi.deleteLead(id);
      navigate("/leads");
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete lead");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      new: "bg-blue-100 text-blue-800",
      contacted: "bg-yellow-100 text-yellow-800",
      qualified: "bg-green-100 text-green-800",
      lost: "bg-red-100 text-red-800",
      draft: "bg-gray-100 text-gray-800",
      submitted: "bg-purple-100 text-purple-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading lead details...</div>
      </div>
    );
  }

  if (error && !lead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/leads")}
            className="text-indigo-600 hover:text-indigo-800 mb-4 flex items-center gap-2"
          >
            ← Back to Leads
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 border border-red-200">
            {error}
          </div>
        )}

        {lead && (
          <>
            {/* Lead Info Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {lead.businessName}
                  </h1>
                  <p className="text-gray-500 mt-1">Lead ID: {lead._id}</p>
                </div>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(lead.status)}`}
                >
                  {lead.status || "new"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Contact Name
                  </label>
                  <p className="text-gray-900">{lead.contactName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900">{lead.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Phone
                  </label>
                  <p className="text-gray-900">{lead.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Source
                  </label>
                  <p className="text-gray-900">{lead.source}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Created At
                  </label>
                  <p className="text-gray-900">
                    {lead.createdAt
                      ? new Date(lead.createdAt).toLocaleString()
                      : "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Last Updated
                  </label>
                  <p className="text-gray-900">
                    {lead.updatedAt
                      ? new Date(lead.updatedAt).toLocaleString()
                      : "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Update Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Update Status
              </h2>
              <div className="flex flex-wrap gap-2">
                {[
                  "new",
                  "contacted",
                  "qualified",
                  "lost",
                  "draft",
                  "submitted",
                ].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={updating || lead.status === status}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                      lead.status === status
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } disabled:opacity-50`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Delete Button */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Danger Zone
              </h2>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium"
              >
                Delete Lead
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LeadDetails;
