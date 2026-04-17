import React from "react";

const TABS = [
  { label: "All",         value: ""            },
  { label: "Pending",     value: "pending"      },
  { label: "Accepted",    value: "accepted"     },
  { label: "In Progress", value: "in-progress"  },
  { label: "Completed",   value: "completed"    },
  { label: "Cancelled",   value: "cancelled"    },
];

const OrderTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={`px-5 py-2 text-sm font-bold rounded-full transition-all border ${
            activeTab === tab.value
              ? "bg-secondary text-white border-secondary"
              : "bg-white text-gray-600 border-gray-200 hover:border-secondary hover:text-secondary"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default OrderTabs;