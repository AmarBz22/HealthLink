import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import chartData from "../data/chartData";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 rounded-md shadow text-sm border border-gray-200">
        <p className="text-gray-800 font-medium">{payload[0].payload.day}</p>
        <p className="text-blue-500">Views: {payload[0].value}</p>
        <p className="text-orange-500">Sells: {payload[1].value}</p>
      </div>
    );
  }
  return null;
};

const ViewsAndSellsChart = () => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-md w-full h-[320px]">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-lg font-semibold text-gray-800">Views & Sells</h4>
        <span className="text-sm text-gray-500">This Week</span>
      </div>

      {/* Color Indicators */}
      <div className="flex gap-4 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
          Total Views
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span>
          Total Sells
        </div>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={chartData} barCategoryGap={24}>
          <CartesianGrid vertical={false} strokeDasharray="2 4" stroke="#E5E7EB" />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#6B7280" }} />
          <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="views"
            fill="#3B82F6"
            radius={[10, 10, 0, 0]}
            name="Total Views"
            barSize={20}
          />
          <Bar
            dataKey="sells"
            fill="#F97316"
            radius={[10, 10, 0, 0]}
            name="Total Sells"
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ViewsAndSellsChart;
