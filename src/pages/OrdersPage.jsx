import { useState, useEffect } from 'react';
import { 
  FiPackage, 
  FiCalendar, 
  FiLoader, 
  FiSearch, 
  FiEye, 
  FiTruck, 
  FiClock,
  FiShoppingBag,
  FiDollarSign,
  FiSend,
  FiShoppingCart,
  FiX
} from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import React from 'react';
import ApproveOrderModal from '../components/ApproveOrderModal';

const OrdersPage = () => {
  // State management
  const [activeTab, setActiveTab] = useState('placed'); // 'placed' or 'received'
  const [placedOrders, setPlacedOrders] = useState([]);
  const [receivedOrders, setReceivedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [orderToApprove, setOrderToApprove] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          toast.error('Please login to view your orders');
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        };

        setLoading(true);
        
        // Fetch orders placed by the user (buyer orders)
        const buyerResponse = await axios.get('http://localhost:8000/api/buyer-orders', { headers });
        const buyerOrders = buyerResponse.data.orders || buyerResponse.data;
        setPlacedOrders(buyerOrders);
        
        // Fetch orders received by the user (seller orders)
        // Using the seller ID from the user profile or context
        // We'll need to get the current user's ID to use as sellerId
        const userProfileResponse = await axios.get('http://localhost:8000/api/user', { headers });
        const userId = userProfileResponse.data.id || userProfileResponse.data.user_id;
        
        const sellerResponse = await axios.get(`http://localhost:8000/api/product-orders/seller/${userId}`, { headers });
        const sellerOrders = sellerResponse.data.orders || sellerResponse.data;
        setReceivedOrders(sellerOrders);
        
        console.log('Placed orders:', buyerOrders);
        console.log('Received orders:', sellerOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError(error.response?.data?.message || 'Failed to load orders');
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
        }
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null || isNaN(parseFloat(price))) {
      return '0.00';
    }
    return parseFloat(price).toFixed(2);
  };

  const getOrderTotal = (order) => {
    // First try to use total_amount if available
    if (order.total_amount && !isNaN(parseFloat(order.total_amount))) {
      return parseFloat(order.total_amount);
    }
    
    // Fall back to calculating from items if total_amount isn't available
    if (!Array.isArray(order.items) || order.items.length === 0) return 0;
    
    return order.items.reduce((total, item) => {
      // Try to get price from the item or from the linked product
      const price = item.price || (item.product ? item.product.price : 0) || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'canceled':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <FiPackage className="mr-1" />;
      case 'shipped':
        return <FiTruck className="mr-1" />;
      case 'canceled':
      case 'cancelled':
        return <FiClock className="mr-1" />;
      case 'processing':
        return <FiClock className="mr-1" />;
      case 'pending':
      default:
        return <FiClock className="mr-1" />;
    }
  };

  const filterOrders = (orders) => {
    if (!searchQuery) return orders;
    
    const searchLower = searchQuery.toLowerCase();
    return orders.filter(order => {
      return (
        (order.product_order_id?.toString().includes(searchLower)) ||
        (order.order_status?.toLowerCase().includes(searchLower)) ||
        (order.order_date && new Date(order.order_date).toLocaleDateString().includes(searchLower))
      );
    });
  };

  // Functions to handle orders
  const toggleOrderExpand = (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };
  
  const handleApproveOrder = (order) => {
    setOrderToApprove(order);
    setShowApproveModal(true);
  };
  
  const confirmApproveOrder = async () => {
    if (!orderToApprove) return;
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      };
      
      await axios.put(
        `http://localhost:8000/api/product-orders/${orderToApprove.product_order_id}/approve`,
        {},
        { headers }
      );
      
      toast.success('Order approved successfully');
      
      // Update the order status locally
      setReceivedOrders(prevOrders => 
        prevOrders.map(o => 
          o.product_order_id === orderToApprove.product_order_id 
            ? { ...o, order_status: 'Processing' } 
            : o
        )
      );
      
      // Close the modal
      setShowApproveModal(false);
      setOrderToApprove(null);
    } catch (error) {
      console.error('Error approving order:', error);
      toast.error('Failed to approve order');
    }
  };
  
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      };
      
      await axios.put(
        `http://localhost:8000/api/product-orders/${orderId}`,
        { order_status: newStatus },
        { headers }
      );
      
      toast.success(`Order status updated to ${newStatus}`);
      
      // Update local state to reflect the change
      if (activeTab === 'placed') {
        setPlacedOrders(prevOrders => 
          prevOrders.map(order => 
            order.product_order_id === orderId 
              ? { ...order, order_status: newStatus } 
              : order
          )
        );
      } else {
        setReceivedOrders(prevOrders => 
          prevOrders.map(order => 
            order.product_order_id === orderId 
              ? { ...order, order_status: newStatus } 
              : order
          )
        );
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const renderOrdersTable = (orders) => {
    const filteredOrders = filterOrders(orders);
    
    if (orders.length === 0) {
      return (
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <FiPackage className="mx-auto text-gray-400 text-5xl mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Orders Yet</h2>
          <p className="text-gray-600 mb-6">
            {activeTab === 'placed' ? 
              "You haven't placed any orders yet." : 
              "You haven't received any orders yet."}
          </p>
          {activeTab === 'placed' && (
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-2 bg-[#00796B] text-white rounded-lg hover:bg-[#00695C] transition-colors"
            >
              Start Shopping
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    No orders match your search
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <React.Fragment key={order.product_order_id}>
                    <tr 
                      className={`hover:bg-gray-50 cursor-pointer ${expandedOrderId === order.product_order_id ? 'bg-gray-50' : ''}`}
                      onClick={() => toggleOrderExpand(order.product_order_id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiCalendar className="text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">
                            {formatDate(order.order_date)}
                            <div className="text-xs text-gray-500">#{order.product_order_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.order_status)}`}>
                          {getStatusIcon(order.order_status)}
                          {order.order_status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <FiDollarSign className="text-gray-400 mr-1" />
                          <span>${formatPrice(getOrderTotal(order))}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleOrderExpand(order.product_order_id);
                          }}
                          className="text-[#00796B] hover:text-[#00695C]"
                        >
                          <FiEye className="inline mr-1" /> View
                        </button>
                      </td>
                    </tr>
                    {expandedOrderId === order.product_order_id && (
                      <tr>
                        <td colSpan="4" className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                          <div className="py-3">
                            <h3 className="text-sm font-medium text-gray-600 mb-3">Order Items</h3>
                            <div className="space-y-2">
                              {Array.isArray(order.items) && order.items.length > 0 ? (
                                order.items.map((item, index) => {
                                  // Get product data either from direct properties or nested object
                                  const productName = item.product_name || 
                                    (item.product ? item.product.product_name : 'Unnamed Product');
                                  const productPrice = item.price || 
                                    (item.product ? item.product.price : 0);
                                  
                                  return (
                                    <div key={item.id || `item-${index}`} className="flex justify-between items-center p-3 bg-white rounded-md border border-gray-100">
                                      <div className="flex items-center">
                                        <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                                          <FiShoppingBag className="text-gray-500" />
                                        </div>
                                        <div className="ml-3">
                                          <h4 className="font-medium text-gray-800">{productName}</h4>
                                          <p className="text-xs text-gray-500">Qty: {item.quantity || 1}</p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-medium text-gray-800">${formatPrice(productPrice)}</p>
                                        <p className="text-xs text-gray-500">
                                          Total: ${formatPrice(productPrice * (item.quantity || 1))}
                                        </p>
                                      </div>
                                    </div>
                                  )
                                })
                              ) : (
                                <div className="p-3 bg-white rounded-md border border-gray-100 text-center text-gray-500 text-sm">
                                  No items found for this order
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col md:flex-row justify-between">
                              <div className="text-sm mb-2 md:mb-0">
                                <span className="text-gray-600 font-medium">Delivery Address: </span>
                                <span className="text-gray-700">{order.delivery_address || 'No address provided'}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-600 font-medium">Est. Delivery: </span>
                                <span className="text-gray-700">{formatDate(order.estimated_delivery)}</span>
                              </div>
                            </div>

                            {order.payment_status && (
                              <div className="mt-2 pt-2 text-sm">
                                <span className="text-gray-600 font-medium">Payment Status: </span>
                                <span className={order.payment_status === 'Paid' ? 'text-green-700' : 'text-orange-700'}>
                                  {order.payment_status}
                                </span>
                              </div>
                            )}
                            
                            {activeTab === 'received' && (
                              <div className="mt-4 pt-3 border-t border-gray-100">
                                <div className="flex justify-between items-center">
                                  <h3 className="text-sm font-medium text-gray-600">Manage Order</h3>
                                  <div className="space-x-2">
                                    {order.order_status?.toLowerCase() !== 'processing' && 
                                     order.order_status?.toLowerCase() !== 'shipped' &&
                                     order.order_status?.toLowerCase() !== 'delivered' && (
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleApproveOrder(order);
                                        }}
                                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-sm hover:bg-blue-100 transition-colors"
                                      >
                                        <FiTruck className="inline mr-1" /> Approve Order
                                      </button>
                                    )}
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Show a modal or navigate to a contact page
                                        toast.info('Contact feature coming soon');
                                      }}
                                      className="px-3 py-1 bg-green-50 text-green-700 rounded-md text-sm hover:bg-green-100 transition-colors"
                                    >
                                      <FiSend className="inline mr-1" /> Contact Buyer
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <FiLoader className="animate-spin text-[#00796B] text-4xl mb-4" />
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-center">
          <h2 className="text-red-800 text-xl font-semibold mb-2">Error Loading Orders</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-4 px-4 py-2 bg-[#00796B] text-white rounded-lg hover:bg-[#00695C] transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Approve Order Modal */}
      {showApproveModal && orderToApprove && (
        <ApproveOrderModal 
          orderId={orderToApprove.product_order_id}
          orderNumber={orderToApprove.product_order_id}
          onClose={() => {
            setShowApproveModal(false);
            setOrderToApprove(null);
          }}
          onConfirm={confirmApproveOrder}
        />
      )}
      
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <FiShoppingBag className="text-[#00796B] text-2xl mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">Marketplace Orders</h1>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00796B] focus:border-transparent outline-none w-full md:w-64"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Tabs for switching between placed and received orders */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('placed')}
            className={`py-4 px-1 flex items-center space-x-2 border-b-2 font-medium text-sm ${
              activeTab === 'placed'
                ? 'border-[#00796B] text-[#00796B]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiShoppingCart className="text-lg" />
            <span>Orders You've Placed</span>
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={`py-4 px-1 flex items-center space-x-2 border-b-2 font-medium text-sm ${
              activeTab === 'received'
                ? 'border-[#00796B] text-[#00796B]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiSend className="text-lg" />
            <span>Orders You've Received</span>
          </button>
        </div>
      </div>

      {/* Display active tab content */}
      {activeTab === 'placed' ? renderOrdersTable(placedOrders) : renderOrdersTable(receivedOrders)}
    </div>
  );
};

export default OrdersPage;