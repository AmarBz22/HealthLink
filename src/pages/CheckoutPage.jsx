import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBasket } from '../context/BasketContext';
import { FiArrowLeft, FiShoppingCart, FiAlertCircle, FiCheckCircle, FiTag } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { basket, subtotal, clearBasket, getEffectivePrice } = useBasket();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [userData, setUserData] = useState({
    id: null,
    first_name: '',
    last_name: '',
    email: '',
    phone_number: ''
  });

  // Form state
  const [formData, setFormData] = useState({
    delivery_address: '',
    estimated_delivery: '',
  });

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          toast.error('Please login to checkout');
          navigate('/login');
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        };

        const response = await axios.get('http://192.168.43.102:8000/api/user', { headers });
        setUserData({
          id: response.data.id,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          email: response.data.email,
          phone_number: response.data.phone_number || ''
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          navigate('/login');
        }
        toast.error('Failed to load user data');
      }
    };

    fetchUserData();
  }, [navigate]);

  // Check if basket is empty
  useEffect(() => {
    if (basket.length === 0 && !orderSuccess) {
      navigate('/');
      toast.info('Your basket is empty');
    }
  }, [basket, navigate, orderSuccess]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOrderError(null);

    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      const orderData = {
        buyer_id: userData.id,
        delivery_address: formData.delivery_address,
        estimated_delivery: formData.estimated_delivery || null,
        items: basket.map(item => {
          const effectivePrice = item.effective_price || getEffectivePrice(item);
          return {
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: effectivePrice // Include the effective price used
          };
        })
      };

      console.log('Submitting order:', orderData);

      const response = await axios.post(
        'http://192.168.43.102:8000/api/product-orders',
        orderData,
        { headers }
      );

      console.log('Order response:', response.data);
      setOrderSuccess(true);
      clearBasket();
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Order creation error:', error);
      setOrderError(error.response?.data?.error || error.response?.data?.message || 'Failed to place order');
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToShopping = () => {
    navigate('/');
  };

  if (orderSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle size={32} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for your order. We've received your request and will process it shortly.
            You can view your order status in your account dashboard.
          </p>
          <button
            onClick={handleBackToShopping}
            className="px-6 py-3 bg-[#00796B] text-white rounded-lg hover:bg-[#00695C] transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-[#00796B] transition-colors"
        >
          <FiArrowLeft className="mr-2" /> Back
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-8 text-gray-800">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Form */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Delivery Information</h2>

            {orderError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
                <FiAlertCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-red-800">Error placing order</h3>
                  <p className="text-red-700 text-sm">{orderError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">First Name</label>
                  <input
                    type="text"
                    value={userData.first_name}
                    disabled
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Last Name</label>
                  <input
                    type="text"
                    value={userData.last_name}
                    disabled
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={userData.email}
                    disabled
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={userData.phone_number}
                    disabled
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="delivery_address">
                  Delivery Address *
                </label>
                <textarea
                  id="delivery_address"
                  name="delivery_address"
                  value={formData.delivery_address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#00796B] focus:border-[#00796B] text-gray-700"
                  rows="3"
                  placeholder="Enter your full delivery address"
                ></textarea>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="estimated_delivery">
                  Preferred Delivery Date (Optional)
                </label>
                <input
                  type="date"
                  id="estimated_delivery"
                  name="estimated_delivery"
                  value={formData.estimated_delivery}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]} // Prevent past dates
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#00796B] focus:border-[#00796B] text-gray-700"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Leave blank for standard delivery time
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 ${loading ? 'bg-gray-400' : 'bg-[#00796B] hover:bg-[#00695C]'} text-white rounded-lg transition-colors font-medium flex items-center justify-center`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                    Processing...
                  </>
                ) : (
                  <>Place Order</>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <FiShoppingCart className="mr-2" /> Order Summary
            </h2>

            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-3">Items ({basket.length})</h3>
              <ul className="divide-y divide-gray-100">
                {basket.map(item => {
                  const effectivePrice = item.effective_price || getEffectivePrice(item);
                  const hasInventoryPrice = item.inventory_price && item.inventory_price > 0;
                  const isDiscounted = hasInventoryPrice && item.inventory_price < item.price;
                  const itemTotal = effectivePrice * item.quantity;
                  
                  return (
                    <li key={item.product_id} className="py-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="text-gray-800 font-medium">{item.product_name}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                            
                            {/* Product type badge */}
                            {item.type && (
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                item.type === 'inventory' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : item.type === 'used_equipment'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {item.type === 'inventory' ? 'Inventory' : 
                                 item.type === 'used_equipment' ? 'Used' : 'New'}
                              </span>
                            )}
                          </div>
                          
                          {/* Price display */}
                          <div className="mt-1">
                            {hasInventoryPrice ? (
                              <div className="flex items-center space-x-2">
                                <span className="text-[#00796B] font-medium text-sm">
                                  DZD {item.inventory_price} each
                                </span>
                                {isDiscounted && (
                                  <>
                                    <span className="text-xs text-gray-400 line-through">
                                      DZD {item.price}
                                    </span>
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                      <FiTag className="mr-1" size={8} />
                                      Special
                                    </span>
                                  </>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-600 text-sm">DZD {item.price} each</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <span className="font-medium text-gray-800">
                            DZD {itemTotal.toFixed(2)}
                          </span>
                          {isDiscounted && (
                            <div className="text-xs text-gray-500 line-through">
                              DZD {(item.price * item.quantity).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">DZD {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">DZD 0.00</span>
              </div>
              
              {/* Show savings if any items have discounts */}
              {basket.some(item => item.inventory_price && item.inventory_price < item.price) && (
                <div className="flex justify-between mb-2 text-green-600">
                  <span>You Save</span>
                  <span className="font-medium">
                    DZD {basket.reduce((savings, item) => {
                      if (item.inventory_price && item.inventory_price < item.price) {
                        return savings + ((item.price - item.inventory_price) * item.quantity);
                      }
                      return savings;
                    }, 0).toFixed(2)}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between font-bold text-lg mt-4 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>DZD {subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;