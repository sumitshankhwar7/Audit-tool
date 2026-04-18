import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import leadApi from "../../api/leadApi";
import auditApi from "../../api/auditApi";

const TelecallerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal states
  const [showCreateLeadModal, setShowCreateLeadModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Form states
  const [leadForm, setLeadForm] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    source: "Manual",
  });

  const [auditData, setAuditData] = useState({
    companyName: "",
    annualRevenue: "",
    employeeCount: "",
    complianceStatus: "Pending",
    riskScore: "",
    auditDate: new Date().toISOString().split("T")[0],
    comments: "",
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
    } else {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role === "admin") {
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
      const leadsRes = await leadApi.getLeads();
      setLeads(Array.isArray(leadsRes) ? leadsRes : []);

      // Get drafts for current user
      const userLeads = leadsRes.filter((l) => l.status === "draft");
      setDrafts(userLeads);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Lead form handlers
  const handleLeadInputChange = (e) => {
    const { name, value } = e.target;
    setLeadForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateLeadForm = () => {
    if (!leadForm.businessName.trim()) return "Business name is required";
    if (!leadForm.contactName.trim()) return "Contact name is required";
    if (!leadForm.email.trim()) return "Email is required";
    if (!leadForm.phone.trim()) return "Phone is required";
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,20})+$/;
    if (!emailRegex.test(leadForm.email)) return "Invalid email format";
    return null;
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();

    const validationError = validateLeadForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const payload = {
        businessName: leadForm.businessName.trim(),
        contactName: leadForm.contactName.trim(),
        email: leadForm.email.trim().toLowerCase(),
        phone: leadForm.phone.trim(),
        source: leadForm.source,
      };

      await leadApi.createLead(payload);
      setSuccess("Lead created successfully!");
      setShowCreateLeadModal(false);
      setLeadForm({
        businessName: "",
        contactName: "",
        email: "",
        phone: "",
        source: "Manual",
      });
      setTimeout(() => setSuccess(""), 3000);
      fetchData();
    } catch (err) {
      console.error("Create lead error:", err);
      setError(err?.response?.data?.message || "Failed to create lead");
    } finally {
      setLoading(false);
    }
  };

  // Audit form handlers
  const handleAuditInputChange = (e) => {
    const { name, value } = e.target;
    setAuditData((prev) => ({ ...prev, [name]: value }));
  };

  const openAuditModal = async (lead) => {
    setSelectedLead(lead);
    setError("");
    setLoading(true);

    try {
      const draft = await auditApi.getDraft(lead._id);
      if (draft && draft.questionnaireData) {
        const d = draft.questionnaireData;
        setAuditData({
          companyName: d.companyName || lead.businessName,
          annualRevenue: d.annualRevenue || "",
          employeeCount: d.employeeCount || "",
          complianceStatus: d.complianceStatus || "Pending",
          riskScore: d.riskScore || "",
          auditDate: d.auditDate
            ? new Date(d.auditDate).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          comments: d.comments || "",
        });
      } else {
        setAuditData({
          companyName: lead.businessName,
          annualRevenue: "",
          employeeCount: "",
          complianceStatus: "Pending",
          riskScore: "",
          auditDate: new Date().toISOString().split("T")[0],
          comments: "",
        });
      }
      setShowAuditModal(true);
    } catch (err) {
      console.error("Get draft error:", err);
      setAuditData({
        companyName: lead.businessName,
        annualRevenue: "",
        employeeCount: "",
        complianceStatus: "Pending",
        riskScore: "",
        auditDate: new Date().toISOString().split("T")[0],
        comments: "",
      });
      setShowAuditModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedLead) return;

    setLoading(true);
    try {
      await auditApi.saveDraft({
        leadId: selectedLead._id,
        questionnaireData: auditData,
      });
      setSuccess("Draft saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
      fetchData();
    } catch (err) {
      console.error("Save draft error:", err);
      setError("Failed to save draft");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!selectedLead) return;

    setLoading(true);
    try {
      await auditApi.submitAudit({
        leadId: selectedLead._id,
        questionnaireData: auditData,
      });
      setSuccess("Report submitted successfully!");
      setShowAuditModal(false);
      setTimeout(() => setSuccess(""), 3000);
      fetchData();
    } catch (err) {
      console.error("Submit error:", err);
      setError(err?.response?.data?.message || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 flex justify-between h-16 items-center">
          <span className="text-xl font-bold text-indigo-600">
            AuditPlatform
          </span>
          <div>
            <span className="mr-4 text-sm">
              {user?.name} ({user?.role})
            </span>
            <button onClick={logout} className="border px-4 py-2 rounded">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* MENU CARDS */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => setShowCreateLeadModal(true)}
              className="p-4 rounded-xl border-2 border-gray-100 hover:border-indigo-500 hover:bg-indigo-50 transition text-left"
            >
              <div className="text-2xl mb-2">➕</div>
              <div className="font-semibold text-gray-900">Create New Lead</div>
              <div className="text-sm text-gray-500">Form with basic info</div>
            </button>
            <button
              onClick={() => {
                const draftLead = leads.find((l) => l.status === "draft");
                if (draftLead) openAuditModal(draftLead);
                else setError("No draft leads found. Create a lead first.");
              }}
              className="p-4 rounded-xl border-2 border-gray-100 hover:border-indigo-500 hover:bg-indigo-50 transition text-left"
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="font-semibold text-gray-900">Audit Question</div>
              <div className="text-sm text-gray-500">Questionnaire form</div>
            </button>
            <button
              onClick={() => {
                const draftLeads = leads.filter((l) => l.status === "draft");
                if (draftLeads.length > 0) openAuditModal(draftLeads[0]);
                else setError("No draft submissions found");
              }}
              className="p-4 rounded-xl border-2 border-gray-100 hover:border-indigo-500 hover:bg-indigo-50 transition text-left"
            >
              <div className="text-2xl mb-2">📝</div>
              <div className="font-semibold text-gray-900">
                Draft Submissions
              </div>
              <div className="text-sm text-gray-500">
                {drafts.length} saved drafts
              </div>
            </button>
            <button
              onClick={() => {
                const submittedLeads = leads.filter(
                  (l) => l.status === "submitted",
                );
                if (submittedLeads.length > 0)
                  openAuditModal(submittedLeads[0]);
                else setError("No submitted leads found");
              }}
              className="p-4 rounded-xl border-2 border-gray-100 hover:border-indigo-500 hover:bg-indigo-50 transition text-left"
            >
              <div className="text-2xl mb-2">📤</div>
              <div className="font-semibold text-gray-900">Submit Report</div>
              <div className="text-sm text-gray-500">Final submission</div>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto py-6 px-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 border border-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-4 border border-green-200">
            {success}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-indigo-600">
              {leads.length}
            </div>
            <div className="text-gray-500 text-sm">Total Leads</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-blue-600">
              {leads.filter((l) => l.status === "new").length}
            </div>
            <div className="text-gray-500 text-sm">New Leads</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {leads.filter((l) => l.status === "draft").length}
            </div>
            <div className="text-gray-500 text-sm">Drafts</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-green-600">
              {leads.filter((l) => l.status === "submitted").length}
            </div>
            <div className="text-gray-500 text-sm">Submitted</div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">My Leads</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : leads.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No leads found. Create your first lead!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Business
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {lead.businessName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {lead.contactName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {lead.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {lead.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(lead.status)}`}
                        >
                          {lead.status || "new"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => openAuditModal(lead)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          {lead.status === "draft"
                            ? "Continue Audit"
                            : "Start Audit"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* CREATE LEAD MODAL */}
      {showCreateLeadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Create New Lead
            </h3>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateLead} className="space-y-4">
              <input
                name="businessName"
                placeholder="Business Name"
                value={leadForm.businessName}
                onChange={handleLeadInputChange}
                required
                className="w-full border p-3 rounded"
              />
              <input
                name="contactName"
                placeholder="Contact Name"
                value={leadForm.contactName}
                onChange={handleLeadInputChange}
                required
                className="w-full border p-3 rounded"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={leadForm.email}
                onChange={handleLeadInputChange}
                required
                className="w-full border p-3 rounded"
              />
              <input
                name="phone"
                placeholder="Phone"
                value={leadForm.phone}
                onChange={handleLeadInputChange}
                required
                className="w-full border p-3 rounded"
              />
              <select
                name="source"
                value={leadForm.source}
                onChange={handleLeadInputChange}
                className="w-full border p-3 rounded"
              >
                <option value="Manual">Manual</option>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Cold Call">Cold Call</option>
              </select>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateLeadModal(false)}
                  className="flex-1 border p-3 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white p-3 rounded disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AUDIT QUESTIONNAIRE MODAL */}
      {showAuditModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Audit Questionnaire
            </h3>
            <p className="text-gray-500 mb-6">
              Lead: {selectedLead.businessName}
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={auditData.companyName}
                  onChange={handleAuditInputChange}
                  className="w-full border p-3 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Annual Revenue
                  </label>
                  <input
                    type="text"
                    name="annualRevenue"
                    value={auditData.annualRevenue}
                    onChange={handleAuditInputChange}
                    className="w-full border p-3 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee Count
                  </label>
                  <input
                    type="text"
                    name="employeeCount"
                    value={auditData.employeeCount}
                    onChange={handleAuditInputChange}
                    className="w-full border p-3 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Compliance Status
                  </label>
                  <select
                    name="complianceStatus"
                    value={auditData.complianceStatus}
                    onChange={handleAuditInputChange}
                    className="w-full border p-3 rounded"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Compliant">Compliant</option>
                    <option value="Non-Compliant">Non-Compliant</option>
                    <option value="Under Review">Under Review</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Risk Score
                  </label>
                  <input
                    type="text"
                    name="riskScore"
                    value={auditData.riskScore}
                    onChange={handleAuditInputChange}
                    className="w-full border p-3 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Audit Date
                </label>
                <input
                  type="date"
                  name="auditDate"
                  value={auditData.auditDate}
                  onChange={handleAuditInputChange}
                  className="w-full border p-3 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comments
                </label>
                <textarea
                  name="comments"
                  value={auditData.comments}
                  onChange={handleAuditInputChange}
                  rows={3}
                  className="w-full border p-3 rounded"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="flex-1 border p-3 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDraft}
                disabled={loading}
                className="flex-1 bg-yellow-500 text-white p-3 rounded hover:bg-yellow-600 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Draft"}
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={loading}
                className="flex-1 bg-green-600 text-white p-3 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TelecallerDashboard;
