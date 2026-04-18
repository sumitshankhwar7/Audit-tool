import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import leadApi from "../../api/leadApi";
import auditApi from "../../api/auditApi";
import CreateLeadForm from "../../components/forms/CreateLeadForm";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [auditData, setAuditData] = useState({
    companyName: "",
    annualRevenue: "",
    employeeCount: "",
    complianceStatus: "Pending",
    riskScore: "",
    auditDate: new Date().toISOString().split("T")[0],
    comments: "",
  });

  // ✅ SAFE FETCH
  const fetchLeads = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await leadApi.getLeads();
      console.log("Leads API:", res);

      setLeads(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Fetch Leads Error:", err);
      setLeads([]);
      setError(typeof err === "string" ? err : "Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // ✅ SAFE CALLBACK
  const handleLeadCreated = (newLead) => {
    if (!newLead) return;

    setSuccess("Lead created successfully!");
    setTimeout(() => setSuccess(""), 3000);

    setShowModal(false);
    fetchLeads();
  };

  // ✅ FIXED AUDIT MODAL (NO CRASH)
  const openAuditModal = async (lead) => {
    setSelectedLead(lead);
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const draft = await auditApi.getDraft(lead._id);
      console.log("Draft:", draft);

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
      console.error("Audit Error:", err);

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

  const handleAuditInputChange = (e) => {
    setAuditData({
      ...auditData,
      [e.target.name]: e.target.value,
    });
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
    } catch (err) {
      console.error(err);
      setError("Failed to save draft");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAudit = async (e) => {
    e.preventDefault();

    if (!selectedLead) return;

    setLoading(true);
    try {
      await auditApi.submitAudit({
        leadId: selectedLead._id,
        questionnaireData: auditData,
      });

      setSuccess("Audit submitted!");
      setTimeout(() => {
        setShowAuditModal(false);
        setSuccess("");
      }, 2000);

      fetchLeads();
    } catch (err) {
      console.error(err);
      setError("Failed to submit audit");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLead = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;

    setLoading(true);
    try {
      await leadApi.deleteLead(id);
      setSuccess("Lead deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
      fetchLeads();
    } catch (err) {
      console.error(err);
      setError("Failed to delete lead");
    } finally {
      setLoading(false);
    }
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

      {/* ADMIN MENU - Only show for admin */}
      {user?.role === "admin" && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button
                onClick={() => navigate("/users")}
                className="p-4 rounded-xl border-2 border-gray-100 hover:border-indigo-500 hover:bg-indigo-50 transition text-left"
              >
                <div className="text-2xl mb-2">👥</div>
                <div className="font-semibold text-gray-900">Manage Users</div>
                <div className="text-sm text-gray-500">
                  Add/Edit/Delete telecaller & sales
                </div>
              </button>
              <button
                onClick={() => navigate("/scoring-rules")}
                className="p-4 rounded-xl border-2 border-gray-100 hover:border-indigo-500 hover:bg-indigo-50 transition text-left"
              >
                <div className="text-2xl mb-2">📊</div>
                <div className="font-semibold text-gray-900">Scoring Rules</div>
                <div className="text-sm text-gray-500">
                  Configure scoring parameters
                </div>
              </button>
              <button
                onClick={() => navigate("/analytics")}
                className="p-4 rounded-xl border-2 border-gray-100 hover:border-indigo-500 hover:bg-indigo-50 transition text-left"
              >
                <div className="text-2xl mb-2">📈</div>
                <div className="font-semibold text-gray-900">Analytics</div>
                <div className="text-sm text-gray-500">
                  Charts, KPIs, performance
                </div>
              </button>
              <button
                onClick={() => navigate("/all-reports")}
                className="p-4 rounded-xl border-2 border-gray-100 hover:border-indigo-500 hover:bg-indigo-50 transition text-left"
              >
                <div className="text-2xl mb-2">📄</div>
                <div className="font-semibold text-gray-900">All Reports</div>
                <div className="text-sm text-gray-500">
                  View all generated reports
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN */}
      <div className="max-w-7xl mx-auto py-6 px-4">
        {success && <p className="text-green-600 mb-4">{success}</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-bold">Lead Management</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            + Create Lead
          </button>
        </div>

        {/* LIST */}
        <div className="bg-white border rounded">
          <ul>
            {loading ? (
              <li className="p-6 text-center text-gray-500">
                Loading leads...
              </li>
            ) : !Array.isArray(leads) || leads.length === 0 ? (
              <li className="p-6 text-center text-gray-500">No leads found</li>
            ) : (
              leads.map((lead) => (
                <li
                  key={lead._id}
                  className="p-4 border-b flex justify-between"
                >
                  <div>
                    <p className="font-bold">{lead.businessName}</p>
                    <p className="text-sm text-gray-500">
                      {lead.contactName} | {lead.email} | {lead.phone}
                    </p>
                    {lead.assignedTo?.name && (
                      <p className="text-xs text-gray-400 mt-1">
                        Assigned to: {lead.assignedTo.name}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openAuditModal(lead)}
                      className="bg-indigo-100 px-3 py-1 rounded text-sm"
                    >
                      Audit
                    </button>
                    <button
                      onClick={() => handleDeleteLead(lead._id)}
                      className="bg-red-100 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* CREATE LEAD */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <CreateLeadForm
            onLeadCreated={handleLeadCreated}
            onCancel={() => setShowModal(false)}
          />
        </div>
      )}

      {/* AUDIT MODAL */}
      {showAuditModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-96">
            <h3 className="font-bold mb-3">
              Audit: {selectedLead.businessName}
            </h3>

            <input
              name="companyName"
              value={auditData.companyName}
              onChange={handleAuditInputChange}
              className="w-full border p-2 mb-2"
            />

            <input
              name="riskScore"
              value={auditData.riskScore}
              onChange={handleAuditInputChange}
              className="w-full border p-2 mb-2"
            />

            <div className="flex gap-2">
              <button onClick={handleSaveDraft} className="border p-2 flex-1">
                Save
              </button>
              <button
                onClick={handleSubmitAudit}
                className="bg-indigo-600 text-white p-2 flex-1"
              >
                Submit
              </button>
            </div>

            <button
              onClick={() => setShowAuditModal(false)}
              className="text-sm mt-3"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
