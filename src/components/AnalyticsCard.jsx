// components/AnalyticsCard.jsx
import React from "react";

const AnalyticsCard = ({
  title,
  value,
  subtitle,
  icon,
  bgColor = "bg-white",
  iconBg = "bg-gray-100"
}) => {
  return (
    <div className={`p-6 mx-4 rounded-2xl shadow-sm ${bgColor} w-64`}>
      <div className="flex flex-col gap-4">
        {/* Icon on top */}
        <div className={`p-3 rounded-xl ${iconBg} w-fit`}>
          {icon}
        </div>

        {/* Text content */}
        <div>
          <h4 className="text-sm text-gray-500">{title}</h4>
          <p className="text-2xl font-bold text-gray-800">{value}</p>

          {/* Horizontal divider */}
          <hr className="my-3 border-gray-200" />

          {/* Subtitle */}
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCard;
