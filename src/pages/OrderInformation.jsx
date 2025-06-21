import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiMapPin, FiPhone, FiUser, FiMail, FiCreditCard, FiShoppingCart } from 'react-icons/fi';

const OrderInformationPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'credit-card'
  });

  const products = state?.products || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Order submitted:', { ...formData, products });
    navigate('/payment-confirmation', { state: { orderDetails: { ...formData, products } } });
  };

  const calculateTotal = () => {
    return products.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0).toFixed(2);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-[#00796B] mb-6 hover:underline transition-colors"
      >
        <FiArrowLeft className="mr-2" /> Back to cart
      </button>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Order Summary - Enhanced Card */}
        <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-md border border-gray-100 h-fit sticky top-8">
          <h2 className="text-xl font-bold mb-6 pb-4 border-b border-gray-200">Order Summary</h2>
          
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
            {products.map((product) => (
              <div key={product.product_id} className="flex justify-between items-center pb-4 border-b border-gray-100 last:border-0">
                <div className="flex items-center space-x-4">
                  {product.image_path ? (
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                      <img 
                        src={`http://192.168.43.102:8000/storage/${product.image_path}`}
                        alt={product.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                      <FiShoppingCart className="text-gray-400 text-xl" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-800">{product.product_name}</p>
                    <p className="text-sm text-gray-500">
                      {product.quantity || 1} × ${product.price.toFixed(2)}
                    </p>
                  </div>
                </div>
                <p className="font-medium text-gray-900">
                  ${(product.price * (product.quantity || 1)).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>${calculateTotal()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping:</span>
              <span>$5.00</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-3">
              <span>Total:</span>
              <span>${(parseFloat(calculateTotal()) + 5).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Order Form - Enhanced Section */}
        <div className="md:col-span-2 space-y-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Order</h1>
          <p className="text-gray-500 mb-6">Please fill in your details to proceed with payment</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold mb-4 flex items-center text-gray-800">
                <div className="bg-[#E0F2F1] p-2 rounded-full mr-3">
                  <FiUser className="text-[#00796B]" />
                </div>
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00796B] focus:border-[#00796B] transition-all"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00796B] focus:border-[#00796B] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold mb-4 flex items-center text-gray-800">
                <div className="bg-[#E0F2F1] p-2 rounded-full mr-3">
                  <FiPhone className="text-[#00796B]" />
                </div>
                Contact Information
              </h2>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00796B] focus:border-[#00796B] transition-all"
                />
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold mb-4 flex items-center text-gray-800">
                <div className="bg-[#E0F2F1] p-2 rounded-full mr-3">
                  <FiMapPin className="text-[#00796B]" />
                </div>
                Shipping Address
              </h2>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Full Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00796B] focus:border-[#00796B] transition-all"
                />
              </div>
            </div>

           

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center py-3.5 px-6 bg-[#00796B] text-white rounded-lg hover:bg-[#00695C] transition-colors font-medium shadow-md hover:shadow-lg"
            >
              <FiCheck className="mr-2" />
              Proceed to Payment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderInformationPage;