// components/ProductTable.jsx
import React from "react";
import img1 from "../assets/img.jpg"

const ProductTable = ({ data }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 mt-6">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="font-bold border-b border-gray-200">
            <th className="py-3 px-4">No</th>
            <th className="py-3 px-4">Product Name</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Sold</th>
            <th className="py-3 px-4">View</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 font-medium">{index + 1}</td>
              <td className="py-3 px-4 flex items-center gap-3">
                <img src={img1} alt={item.name} className="w-10 h-10 rounded-md object-cover" />
                {item.name}
              </td>
              <td className="py-3 px-4">
                <span className="text-blue-500 cursor-pointer hover:underline">{item.status}</span>
              </td>
              <td className="py-3 px-4">{item.sold}</td>
              <td className="py-3 px-4">{item.view}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
