import React, { useState } from "react";
import { FiSave, FiX, FiUpload } from "react-icons/fi";
import { Link } from "react-router-dom";

const AddProductPage = () => {
  const [productData, setProductData] = useState({
    name: "",
    sku: "",
    category: "Diagnostic",
    price: "",
    stock: "",
    supplier: "",
    description: "",
    certifications: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your submission logic here
    console.log("Product submitted:", productData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Add New Medical Product</h1>
          <Link 
            to="/store/items" 
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <FiX className="mr-1" /> Cancel
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-blue-500 border-b pb-2">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name*</label>
                <input
                  type="text"
                  name="name"
                  value={productData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU*</label>
                <input
                  type="text"
                  name="sku"
                  value={productData.sku}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                <select
                  name="category"
                  value={productData.category}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Diagnostic">Diagnostic Equipment</option>
                  <option value="Surgical">Surgical Instruments</option>
                  <option value="Therapeutic">Therapeutic Devices</option>
                  <option value="Disposables">Medical Disposables</option>
                </select>
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-blue-500 border-b pb-2">Pricing & Inventory</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD)*</label>
                <input
                  type="number"
                  name="price"
                  value={productData.price}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity*</label>
                <input
                  type="number"
                  name="stock"
                  value={productData.stock}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier*</label>
                <input
                  type="text"
                  name="supplier"
                  value={productData.supplier}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Additional Fields */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-blue-500 border-b pb-2 mb-4">Additional Information</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={productData.description}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
              <div className="flex flex-wrap gap-2">
                {['FDA', 'CE', 'ISO 13485', 'Other'].map(cert => (
                  <label key={cert} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                      checked={productData.certifications.includes(cert)}
                      onChange={() => {
                        setProductData(prev => ({
                          ...prev,
                          certifications: prev.certifications.includes(cert)
                            ? prev.certifications.filter(c => c !== cert)
                            : [...prev.certifications, cert]
                        }));
                      }}
                    />
                    <span className="ml-2 text-sm text-gray-700">{cert}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-blue-500 border-b pb-2 mb-4">Product Images</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-1 text-sm text-gray-600">
                Drag and drop images here, or click to browse
              </p>
              <input
                type="file"
                className="hidden"
                multiple
                accept="image/*"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <FiSave className="mr-2" /> Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductPage;