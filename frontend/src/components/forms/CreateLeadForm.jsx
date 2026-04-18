import React, { useState } from "react";
import leadApi from "../../api/leadApi";

const CreateLeadForm = ({ onLeadCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    source: "Manual",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Safe input handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setError("");
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Basic validation (prevents 400 error)
  const validateForm = () => {
    if (!formData.businessName.trim()) return "Business name required";
    if (!formData.contactName.trim()) return "Contact name required";
    if (!formData.email.trim()) return "Email required";
    if (!formData.phone.trim()) return "Phone required";

    // simple email check (synchronized with backend)
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,20})+$/;
    if (!emailRegex.test(formData.email)) return "Invalid email format";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      businessName: formData.businessName.trim(),
      contactName: formData.contactName.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      source: formData.source,
    };

    // ✅ validation check
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    console.log("🚀 Sending Data:", payload);

    try {
      const res = await leadApi.createLead(payload);

      console.log("✅ Lead Created:", res);

      // ✅ safe callback
      if (onLeadCreated && typeof onLeadCreated === "function") {
        onLeadCreated(res);
      }

      // ✅ reset form
      setFormData({
        businessName: "",
        contactName: "",
        email: "",
        phone: "",
        source: "Manual",
      });
    } catch (err) {
      console.error("❌ Error:", err);
      console.error("FULL ERROR 👉", err);
      console.error("RESPONSE 👉", err.response);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Something went wrong";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Create New Lead
      </h3>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="businessName"
          placeholder="Business Name"
          value={formData.businessName}
          onChange={handleInputChange}
          required
          className="w-full border p-3 rounded"
        />

        <input
          name="contactName"
          placeholder="Contact Name"
          value={formData.contactName}
          onChange={handleInputChange}
          required
          className="w-full border p-3 rounded"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          required
          className="w-full border p-3 rounded"
        />

        <input
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleInputChange}
          required
          className="w-full border p-3 rounded"
        />

        <select
          name="source"
          value={formData.source}
          onChange={handleInputChange}
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
            onClick={() => onCancel && onCancel()}
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
  );
};

export default CreateLeadForm;
