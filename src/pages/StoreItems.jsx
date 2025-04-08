import React, { useState } from "react";
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiFilter } from "react-icons/fi";
import { FaRegStar, FaStar } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';


const StoreItemsPage = () => {
  // Sample medical product data
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Portable Ultrasound Machine",
      sku: "HL-MED-2301",
      category: "Diagnostic",
      price: 12500,
      stock: 15,
      supplier: "MedEquip Inc.",
      status: "Active",
      rating: 4.7,
      lastUpdated: "2023-10-15"
    },
    {
      id: 2,
      name: "Surgical Sterilization Kit",
      sku: "HL-SUR-4582",
      category: "Surgical",
      price: 320,
      stock: 0,
      supplier: "SafeSurg Co.",
      status: "Out of Stock",
      rating: 4.2,
      lastUpdated: "2023-10-10"
    },
    // Add more medical products...
  ]);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Diagnostic", "Surgical", "Disposables", "Therapeutic"];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const deleteProduct = (id) => {
    setProducts(products.filter(product => product.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Medical Products Inventory</h1>
          <p className="text-gray-600">Manage your healthcare equipment and supplies</p>
        </div>
        <button 
          onClick={() => navigate('add')} 
          className="mt-4 md:mt-0 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md flex items-center"
        >
          <FiPlus className="mr-2" /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search products or SKU..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <select
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Out of Stock">Out of Stock</option>
            <option value="Discontinued">Discontinued</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.supplier}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sku}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      product.category === "Diagnostic" ? "bg-blue-100 text-blue-800" :
                      product.category === "Surgical" ? "bg-green-100 text-green-800" :
                      "bg-purple-100 text-purple-800"
                    }`}>
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${product.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.stock > 0 ? product.stock : (
                      <span className="text-red-500">0</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      product.status === "Active" ? "bg-green-100 text-green-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        i < Math.floor(product.rating) ? (
                          <FaStar key={i} className="text-yellow-400" />
                        ) : (
                          <FaRegStar key={i} className="text-gray-300" />
                        )
                      ))}
                      <span className="ml-1 text-sm text-gray-500">({product.rating})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-500 hover:text-blue-700 mr-3">
                      <FiEdit />
                    </button>
                    <button 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => deleteProduct(product.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

     
    </div>
  );
};

export default StoreItemsPage;