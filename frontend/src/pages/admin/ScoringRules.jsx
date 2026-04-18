import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import scoringApi from "../../api/scoringApi";

const ScoringRules = () => {
  const navigate = useNavigate();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "business",
    description: "",
    points: 10,
    weight: 1,
    isActive: true,
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
        fetchRules();
      }
    }
  }, [navigate]);

  const fetchRules = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await scoringApi.getRules();
      setRules(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Fetch rules error:", err);
      setError("Failed to load scoring rules");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = {
        ...formData,
        points: parseInt(formData.points),
        weight: parseFloat(formData.weight),
      };

      if (editingRule) {
        await scoringApi.updateRule(editingRule._id, data);
        setSuccess("Rule updated successfully!");
      } else {
        await scoringApi.createRule(data);
        setSuccess("Rule created successfully!");
      }

      setShowModal(false);
      setEditingRule(null);
      setFormData({
        name: "",
        category: "business",
        description: "",
        points: 10,
        weight: 1,
        isActive: true,
      });
      setTimeout(() => setSuccess(""), 3000);
      fetchRules();
    } catch (err) {
      console.error("Error:", err);
      setError(err?.response?.data?.message || "Failed to save rule");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      category: rule.category,
      description: rule.description || "",
      points: rule.points,
      weight: rule.weight,
      isActive: rule.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this rule?")) return;

    setLoading(true);
    try {
      await scoringApi.deleteRule(id);
      setSuccess("Rule deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
      fetchRules();
    } catch (err) {
      console.error("Delete error:", err);
      setError(err?.response?.data?.message || "Failed to delete rule");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (rule) => {
    try {
      await scoringApi.updateRule(rule._id, { isActive: !rule.isActive });
      fetchRules();
    } catch (err) {
      console.error("Toggle error:", err);
      setError("Failed to update rule");
    }
  };

  const openCreateModal = () => {
    setEditingRule(null);
    setFormData({
      name: "",
      category: "business",
      description: "",
      points: 10,
      weight: 1,
      isActive: true,
    });
    setShowModal(true);
  };

  const getCategoryColor = (category) => {
    const colors = {
      business: "bg-blue-100 text-blue-800",
      seo: "bg-green-100 text-green-800",
      social: "bg-purple-100 text-purple-800",
      compliance: "bg-orange-100 text-orange-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const groupedRules = rules.reduce((acc, rule) => {
    if (!acc[rule.category]) {
      acc[rule.category] = [];
    }
    acc[rule.category].push(rule);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Scoring Rules</h1>
            <p className="text-gray-600 mt-1">
              Configure scoring parameters for audit evaluations
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium"
          >
            + Add Rule
          </button>
        </div>

        {/* Messages */}
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

        {/* Rules by Category */}
        {loading && !rules.length ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            Loading rules...
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(groupedRules).map((category) => (
              <div
                key={category}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <div className="bg-gray-50 px-6 py-3 border-b">
                  <h2 className="text-lg font-semibold text-gray-900 capitalize">
                    {category} Scoring
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Rule Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Points
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Weight
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {groupedRules[category].map((rule) => (
                        <tr key={rule._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">
                              {rule.name}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-gray-600 text-sm">
                              {rule.description || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-900 font-medium">
                              {rule.points}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-900">{rule.weight}x</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleActive(rule)}
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                rule.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {rule.isActive ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => handleEdit(rule)}
                              className="text-indigo-600 hover:text-indigo-900 mr-3 text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(rule._id)}
                              className="text-red-600 hover:text-red-900 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {rules.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            No scoring rules found. Create your first rule!
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {editingRule ? "Edit Rule" : "Add New Rule"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rule Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="business">Business</option>
                  <option value="seo">SEO</option>
                  <option value="social">Social</option>
                  <option value="compliance">Compliance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points
                  </label>
                  <input
                    type="number"
                    name="points"
                    value={formData.points}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (1-10)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    min="0"
                    max="10"
                    step="0.1"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-indigo-600"
                />
                <label className="text-sm text-gray-700">Active</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingRule(null);
                  }}
                  className="flex-1 border border-gray-300 p-3 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingRule ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoringRules;
