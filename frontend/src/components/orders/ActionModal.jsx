import React, { useState } from "react";
import { IoClose } from "react-icons/io5";

// ─────────────────────────────────────────────
// ActionModal
//
// mode prop controls which form is rendered:
//   "reject"   — cancellationReason textarea
//   "cancel"   — cancellationReason textarea
//   "complete" — hoursWorked, hourlyRate, finalDescription
// ─────────────────────────────────────────────

const TITLES = {
  reject:   "Reject Order",
  cancel:   "Cancel Order",
  complete: "Complete Order",
};

const ActionModal = ({ mode, onConfirm, onClose, loading, prefilledRate }) => {
  const [fields, setFields] = useState({
    cancellationReason: "",
    hoursWorked:        "",
    hourlyRate:         prefilledRate || "",
    finalDescription:   "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if ((mode === "reject" || mode === "cancel") && !fields.cancellationReason.trim()) {
      newErrors.cancellationReason = "Please provide a reason.";
    }
    if (mode === "complete") {
      if (!fields.hoursWorked || Number(fields.hoursWorked) <= 0)
        newErrors.hoursWorked = "Valid hours worked is required.";
      if (!fields.hourlyRate || Number(fields.hourlyRate) <= 0)
        newErrors.hourlyRate  = "Valid hourly rate is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onConfirm(fields);
  };

  const totalPreview =
    mode === "complete" && fields.hoursWorked && fields.hourlyRate
      ? (Number(fields.hoursWorked) * Number(fields.hourlyRate)).toFixed(2)
      : null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      {/* Modal panel — stops click propagation */}
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">{TITLES[mode]}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <IoClose className="text-gray-500 text-xl" />
          </button>
        </div>

        {/* ── Reject / Cancel form ─────────────────────────────────────── */}
        {(mode === "reject" || mode === "cancel") && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5 ms-1">
              Reason <span className="text-red-400">*</span>
            </label>
            <textarea
              name="cancellationReason"
              rows={4}
              placeholder="Explain why you are cancelling this order..."
              value={fields.cancellationReason}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:border-secondary resize-none text-sm transition-colors ${
                errors.cancellationReason ? "border-red-400" : "border-gray-200"
              }`}
            />
            {errors.cancellationReason && (
              <p className="text-red-500 text-xs mt-1">{errors.cancellationReason}</p>
            )}
          </div>
        )}

        {/* ── Complete form ─────────────────────────────────────────────── */}
        {mode === "complete" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Hours Worked */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 ms-1 uppercase tracking-wide">
                  Hours Worked <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="hoursWorked"
                  min="0"
                  step="0.5"
                  placeholder="e.g. 3"
                  value={fields.hoursWorked}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-full focus:outline-none focus:border-secondary text-sm transition-colors ${
                    errors.hoursWorked ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {errors.hoursWorked && (
                  <p className="text-red-500 text-xs mt-1">{errors.hoursWorked}</p>
                )}
              </div>

              {/* Hourly Rate */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 ms-1 uppercase tracking-wide">
                  Hourly Rate (Rs) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="hourlyRate"
                  min="0"
                  placeholder="e.g. 500"
                  value={fields.hourlyRate}
                  onChange={handleChange}
                  readOnly
                  className={`w-full px-4 py-2.5 border rounded-full focus:outline-none focus:border-secondary text-sm transition-colors ${
                    errors.hourlyRate ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {errors.hourlyRate && (
                  <p className="text-red-500 text-xs mt-1">{errors.hourlyRate}</p>
                )}
              </div>
            </div>

            {/* Total Amount Preview */}
            {totalPreview && (
              <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
                <span className="text-sm font-medium text-emerald-700">Total Amount</span>
                <span className="text-base font-bold text-emerald-700">Rs {totalPreview}</span>
              </div>
            )}

            {/* Final Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 ms-1 uppercase tracking-wide">
                Final Description <span className="text-gray-300">(Optional)</span>
              </label>
              <textarea
                name="finalDescription"
                rows={3}
                placeholder="Describe the work completed..."
                value={fields.finalDescription}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-secondary resize-none text-sm transition-colors"
              />
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-bold bg-white border border-gray-200 text-gray-600 rounded-full hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex-1 py-2.5 text-sm font-bold text-white rounded-full transition-all flex items-center justify-center ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : mode === "complete"
                ? "bg-secondary hover:bg-[#0e5641]"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </>
            ) : mode === "complete" ? (
              "Submit & Complete"
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;
