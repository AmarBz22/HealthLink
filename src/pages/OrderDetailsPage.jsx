import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiPackage, FiLoader, FiCheckCircle, FiUser, FiMail, FiPhone, FiMapPin, FiTrash2, FiTruck, FiSend, FiX } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import ApproveOrderModal from '../components/ApproveOrderModal';
import DeleteOrderModal from '../components/DeleteOrderModal';
import ShipOrderModal from '../components/ShipOrderModal';
import DeliverOrderModal from '../components/DeliverModal';
import ProductRatingModal from '../components/ProductRatingModal';
import CancelOrderModal from '../components/CancelOrderModal';

// Enhanced OrderStatusStep component with dynamic styling
const OrderStatusStep = ({ title, description, isActive, isCompleted, isError, isSuccess, isLast }) => {
  const getStepColor = () => {
    if (isError) return 'bg-red-500 text-white border-red-500';
    if (isSuccess) return 'bg-blue-500 text-white border-blue-500';
    if (isCompleted) return 'bg-green-500 text-white border-green-500';
    if (isActive) return 'bg-[#00796B] text-white border-[#00796B]';
    return 'bg-gray-200 text-gray-500 border-gray-200';
  };

  const getLineColor = () => {
    if (isCompleted || isActive) return 'bg-[#00796B]';
    if (isError) return 'bg-red-300';
    return 'bg-gray-200';
  };

  const getTextColor = () => {
    if (isError) return 'text-red-700';
    if (isActive || isCompleted) return 'text-gray-900';
    return 'text-gray-500';
  };

  return (
    <div className={`flex items-start ${isActive ? 'opacity-100' : 'opacity-60'}`}>
      <div className="flex flex-col items-center mr-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${getStepColor()}`}>
          {isCompleted || isError || isSuccess ? (
            <FiCheckCircle size={18} />
          ) : isActive ? (
            <div className="w-4 h-4 bg-white rounded-full"></div>
          ) : (
            <div className="w-4 h-4 rounded-full border-2 border-current"></div>
          )}
        </div>
        {!isLast && (
          <div className={`w-0.5 h-20 mt-2 ${getLineColor()}`}></div>
        )}
      </div>
      <div className="flex-1 pb-8">
        <h3 className={`font-semibold text-lg ${getTextColor()}`}>{title}</h3>
        <p className={`text-sm mt-1 ${isActive ? 'text-gray-600' : 'text-gray-500'}`}>
          {description}
        </p>
        {isCompleted && !isError && (
          <p className="text-xs text-gray-400 mt-2">
            ✓ Step completed
          </p>
        )}
      </div>
    </div>
  );
};

const InfoCard = ({ title, icon, children }) => {
  const Icon = icon;
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
        <div className="flex items-center">
          <Icon className="text-[#00796B] mr-2" size={16} />
          <h2 className="text-sm font-medium text-gray-700">{title}</h2>
        </div>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

const ContactInfoItem = ({ icon, label, value }) => {
  const Icon = icon;
  
  if (!value) return null;
  
  return (
    <div className="flex items-center mb-2 last:mb-0">
      <Icon className="text-gray-500 mr-2 flex-shrink-0" size={14} />
      <span className="text-gray-600 text-sm">
        {label && <span className="font-medium mr-1">{label}:</span>}
        {value}
      </span>
    </div>
  );
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buyerInfo, setBuyerInfo] = useState(null);
  const [sellerInfoCache, setSellerInfoCache] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  
  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showShipModal, setShowShipModal] = useState(false);
  const [showDeliverModal, setShowDeliverModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          toast.error('Please login to view order details');
          navigate('/login');
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        };

        // Get current user data
        const userResponse = await axios.get('http://192.168.43.101:8000/api/user', { headers });
        const userData = userResponse.data;
        setCurrentUser(userData);

        // Fetch order details with eager loaded relationships
        const response = await axios.get(`http://192.168.43.101:8000/api/product-orders/${id}`, { headers });
        const orderData = response.data;
        setOrder(orderData);
        
        // Fetch buyer information
        if (orderData.buyer) {
          setBuyerInfo(orderData.buyer);
        } else if (orderData.buyer_id) {
          try {
            const buyerResponse = await axios.get(`http://192.168.43.101:8000/api/users/${orderData.buyer_id}`, { headers });
            setBuyerInfo(buyerResponse.data);
          } catch (buyerError) {
            console.error('Error fetching buyer details:', buyerError);
            toast.error('Could not load buyer information');
          }
        }

        // Fetch seller information for each item
        if (orderData.items && Array.isArray(orderData.items)) {
          const newSellerInfoCache = { ...sellerInfoCache };
          for (const item of orderData.items) {
            if (item.seller_id && !newSellerInfoCache[item.seller_id]) {
              try {
                const sellerResponse = await axios.get(`http://192.168.43.101:8000/api/users/${item.seller_id}`, { headers });
                newSellerInfoCache[item.seller_id] = sellerResponse.data;
              } catch (sellerError) {
                console.error(`Error fetching seller details for seller ID ${item.seller_id}:`, sellerError);
                newSellerInfoCache[item.seller_id] = {
                  first_name: 'Unknown',
                  last_name: '',
                  email: 'N/A',
                  phone_number: 'N/A',
                  wilaya: 'N/A'
                };
              }
            }
          }
          setSellerInfoCache(newSellerInfoCache);
        }

      } catch (error) {
        console.error('Error fetching order details:', error);
        setError(error.response?.data?.message || 'Failed to load order details');
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          navigate('/login');
        }
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, navigate]);

  // Helper function to get dynamic order status steps
  const getOrderStatusSteps = (order, currentStatus) => {
    const steps = [];
    
    steps.push({
      key: 'placed',
      title: 'Order Placed',
      description: `Your order was placed on ${formatDate(order.order_date)}`,
      isActive: true,
      isCompleted: true,
      alwaysShow: true
    });

    if (currentStatus.toLowerCase() !== 'cancelled') {
      steps.push({
        key: 'processing',
        title: 'Processing',
        description: currentStatus.toLowerCase() === 'processing' ? 'Your order is currently being prepared' : 'Your order is being prepared',
        isActive: ['processing', 'shipped', 'delivered', 'completed'].includes(currentStatus.toLowerCase()),
        isCompleted: ['shipped', 'delivered', 'completed'].includes(currentStatus.toLowerCase())
      });
    }

    if (order.order_type !== 'digital' && currentStatus.toLowerCase() !== 'cancelled') {
      const shippedDesc = order.tracking_number 
        ? `Tracking: ${order.tracking_number}` 
        : 'Your order is on the way';
      
      steps.push({
        key: 'shipped',
        title: 'Shipped',
        description: shippedDesc,
        isActive: ['shipped', 'delivered', 'completed'].includes(currentStatus.toLowerCase()),
        isCompleted: ['delivered', 'completed'].includes(currentStatus.toLowerCase())
      });
    }

    if (currentStatus.toLowerCase() !== 'cancelled') {
      const deliveryDesc = order.estimated_delivery 
        ? `Estimated delivery on ${formatDate(order.estimated_delivery)}` 
        : order.delivery_address
          ? `Delivering to: ${order.delivery_address.substring(0, 40)}${order.delivery_address.length > 40 ? '...' : ''}`
          : 'Your order will be delivered soon';
      
      steps.push({
        key: 'delivered',
        title: order.order_type === 'pickup' ? 'Ready for Pickup' : 'Delivered',
        description: deliveryDesc,
        isActive: ['delivered', 'completed'].includes(currentStatus.toLowerCase()),
        isCompleted: ['completed'].includes(currentStatus.toLowerCase())
      });
    }

    if (currentStatus.toLowerCase() === 'cancelled') {
      steps.push({
        key: 'cancelled',
        title: 'Order Cancelled',
        description: order.cancellation_reason || 'This order has been cancelled',
        isActive: true,
        isCompleted: true,
        isError: true
      });
    }

    return steps;
  };

  // Helper function to format full name
  const formatFullName = (firstName, lastName) => {
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    if (lastName) return lastName;
    return 'Unknown';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateTotal = () => {
    if (!order?.items || order.items.length === 0) return 0;
    return order.items.reduce((sum, item) => {
      const price = item.price || item.unit_price || 0;
      const quantity = item.quantity || 0;
      return sum + (price * quantity);
    }, 0);
  };

  const getOrderStatus = () => {
    return order?.order_status || 'pending';
  };

  const getOrderStatusDisplay = (status) => {
    const statusMap = {
      'processing': 'Processing',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
      'pending': 'Pending',
      'completed': 'Completed'
    };
    return statusMap[status.toLowerCase()] || status;
  };

  const getOrderStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return 'bg-green-50 text-green-700';
      case 'shipped':
        return 'bg-blue-50 text-blue-700';
      case 'processing':
        return 'bg-yellow-50 text-yellow-700';
      case 'cancelled':
        return 'bg-red-50 text-red-700';
      case 'pending':
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getOrderItems = () => {
    if (Array.isArray(order.items) && order.items.length > 0) {
      return order.items;
    } else if (Array.isArray(order.order_items) && order.order_items.length > 0) {
      return order.order_items;
    }
    return [];
  };

  const getProductName = (item) => {
    if (item.product_name) return item.product_name;
    if (item.name) return item.name;
    if (item.product) {
      if (item.product.name) return item.product.name;
      if (item.product.product_name) return item.product.product_name;
    }
    return 'Unknown Product';
  };

  const getItemPrice = (item) => {
    if (item.price) return item.price;
    if (item.unit_price) return item.unit_price;
    if (item.product) {
      if (item.product.price) return item.product.price;
      if (item.product.unit_price) return item.product.unit_price;
    }
    return 0;
  };

  // Order management permissions
  const canManageOrder = () => {
    if (!currentUser || !order) return false;
    return order.items?.some(item => item.seller_id === currentUser.id);
  };

  const canBuyerManageOrder = () => {
    if (!currentUser || !order) return false;
    return currentUser.id === order.buyer_id;
  };

  const canApproveOrder = () => {
    if (!canManageOrder()) return false;
    const status = getOrderStatus().toLowerCase();
    return status === 'pending';
  };

  const canShipOrder = () => {
    if (!canManageOrder()) return false;
    const status = getOrderStatus().toLowerCase();
    return status === 'processing';
  };

  const canDeliverOrder = () => {
    if (!canBuyerManageOrder()) return false;
    const status = getOrderStatus().toLowerCase();
    return status === 'shipped';
  };

  const canRateOrder = () => {
    if (!canBuyerManageOrder()) return false;
    const status = getOrderStatus().toLowerCase();
    return status === 'delivered';
  };

  const canCancelOrder = () => {
    if (!currentUser || !order) return false;
    const status = getOrderStatus().toLowerCase();
    if (canManageOrder()) {
      return ['pending', 'processing', 'shipped'].includes(status);
    }
    if (canBuyerManageOrder()) {
      return status === 'pending';
    }
    return false;
  };

  // Modal handlers
  const handleApproveOrder = () => setShowApproveModal(true);
  const handleDeleteOrder = () => setShowDeleteModal(true);
  const handleCancelOrder = () => setShowCancelModal(true);
  const handleShipOrder = () => setShowShipModal(true);
  const handleDeliverOrder = () => setShowDeliverModal(true);
  const handleRateOrder = () => setShowRatingModal(true);

  // Confirmation functions
  const confirmApproveOrder = async () => {
    if (!order) return;
    
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
        `http://192.168.43.101:8000/api/product-orders/${order.product_order_id}/approve`,
        {},
        { headers }
      );
      
      toast.success('Order approved successfully');
      setOrder(prevOrder => ({ ...prevOrder, order_status: 'processing' }));
      setShowApproveModal(false);
      
    } catch (error) {
      console.error('Error approving order:', error);
      toast.error('Failed to approve order');
    }
  };

  const confirmDeleteOrder = async () => {
    if (!order) return;
    
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
      
      await axios.delete(
        `http://192.168.43.101:8000/api/product-orders/${order.product_order_id}`,
        { headers }
      );
      
      toast.success('Order deleted successfully');
      navigate('/orders');
      
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    }
  };

  const confirmCancelOrder = async () => {
    if (!order) return;
    
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
        `http://192.168.43.101:8000/api/product-orders/${order.product_order_id}/cancel`,
        {},
        { headers }
      );
      
      toast.success('Order cancelled successfully');
      setOrder(prevOrder => ({ ...prevOrder, order_status: 'cancelled' }));
      setShowCancelModal(false);
      
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    }
  };

  const confirmShipOrder = async () => {
    if (!order) return;
    
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
        `http://192.168.43.101:8000/api/product-orders/${order.product_order_id}/ship`,
        {},
        { headers }
      );
      
      toast.success('Order marked as shipped successfully');
      setOrder(prevOrder => ({ ...prevOrder, order_status: 'shipped' }));
      setShowShipModal(false);
      
    } catch (error) {
      console.error('Error shipping order:', error);
      toast.error('Failed to ship order');
    }
  };

  const confirmDeliverOrder = async () => {
    if (!order) return;
    
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
        `http://192.168.43.101:8000/api/product-orders/${order.product_order_id}/deliver`,
        {},
        { headers }
      );
      
      toast.success('Order marked as delivered successfully');
      setOrder(prevOrder => ({ ...prevOrder, order_status: 'delivered' }));
      setShowDeliverModal(false);
      setShowRatingModal(true);
      
    } catch (error) {
      console.error('Error delivering order:', error);
      toast.error('Failed to mark order as delivered');
    }
  };

  const handleSubmitRatings = async (ratingsData) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      const ratingPromises = ratingsData.map(rating => 
        axios.post('http://192.168.43.101:8000/api/ratings', rating, { headers })
      );

      await Promise.all(ratingPromises);
      
      toast.success('Ratings submitted successfully!');
      setShowRatingModal(false);
    } catch (error) {
      console.error('Error submitting ratings:', error);
      toast.error(error.response?.data?.message || 'Failed to submit ratings');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00796B]"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-center">
          <h2 className="text-red-800 text-xl font-semibold mb-2">Error Loading Order</h2>
          <p className="text-red-600">{error || 'Order not found'}</p>
          <button
            onClick={() => navigate('/orders')}
            className="mt-4 px-4 py-2 bg-[#00796B] text-white rounded-lg hover:bg-[#00695C] transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const orderStatus = getOrderStatus();
  const orderItems = getOrderItems();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Management Modals */}
      {showApproveModal && (
        <ApproveOrderModal 
          orderId={order.product_order_id || order.id}
          orderNumber={order.product_order_id || order.id}
          onClose={() => setShowApproveModal(false)}
          onConfirm={confirmApproveOrder}
        />
      )}
      {showDeleteModal && (
        <DeleteOrderModal 
          orderId={order.product_order_id || order.id}
          orderNumber={order.product_order_id || order.id}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDeleteOrder}
        />
      )}
      {showCancelModal && (
        <CancelOrderModal 
          orderId={order.product_order_id || order.id}
          orderNumber={order.product_order_id || order.id}
          onClose={() => setShowCancelModal(false)}
          onConfirm={confirmCancelOrder}
        />
      )}
      {showShipModal && (
        <ShipOrderModal 
          orderId={order.product_order_id || order.id}
          orderNumber={order.product_order_id || order.id}
          onClose={() => setShowShipModal(false)}
          onConfirm={confirmShipOrder}
        />
      )}
      {showDeliverModal && (
        <DeliverOrderModal 
          orderId={order.product_order_id || order.id}
          orderNumber={order.product_order_id || order.id}
          onClose={() => setShowDeliverModal(false)}
          onConfirm={confirmDeliverOrder}
        />
      )}
      {showRatingModal && (
        <ProductRatingModal 
          order={order}
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          onSubmitRatings={handleSubmitRatings}
        />
      )}

      <div className="mb-6">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center text-gray-600 hover:text-[#00796B] transition-colors"
        >
          <FiArrowLeft className="mr-2" /> Back to Orders
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-8 text-gray-800">Order #{order.product_order_id || order.id || 'N/A'}</h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          {/* Order Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex items-center mb-3 sm:mb-0">
              <FiCalendar className="text-[#00796B] mr-2" />
              <span className="text-gray-600">Order Date: <span className="font-medium text-gray-800">{formatDate(order.order_date)}</span></span>
            </div>
            <div className="flex space-x-3">
              <div className={`inline-flex px-3 py-1 rounded-full font-medium text-sm ${getOrderStatusColor(orderStatus)}`}>
                {getOrderStatusDisplay(orderStatus)}
              </div>
            </div>
          </div>

          {/* Order Management Actions */}
          {(canManageOrder() || canBuyerManageOrder()) && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Order Management</h3>
              <div className="flex flex-wrap gap-3">
                {canApproveOrder() && (
                  <button
                    onClick={handleApproveOrder}
                    className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm hover:bg-green-100 transition-colors flex items-center"
                  >
                    <FiCheckCircle className="mr-2" size={16} />
                    Approve Order
                  </button>
                )}
                {canShipOrder() && (
                  <button
                    onClick={handleShipOrder}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors flex items-center"
                  >
                    <FiTruck className="mr-2" size={16} />
                    Ship Order
                  </button>
                )}
                {canDeliverOrder() && (
                  <button
                    onClick={handleDeliverOrder}
                    className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm hover:bg-purple-100 transition-colors flex items-center"
                  >
                    <FiPackage className="mr-2" size={16} />
                    Mark as Delivered
                  </button>
                )}
                {canRateOrder() && (
                  <button
                    onClick={handleRateOrder}
                    className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg text-sm hover:bg-yellow-100 transition-colors flex items-center"
                  >
                    <FiCheckCircle className="mr-2" size={16} />
                    Rate Products
                  </button>
                )}
                {canCancelOrder() && (
                  <button
                    onClick={handleCancelOrder}
                    className="px-4 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm hover:bg-orange-100 transition-colors flex items-center"
                  >
                    <FiX className="mr-2" size={16} />
                    Cancel Order
                  </button>
                )}
                {/* Note: Delete button is displayed for sellers in any status. Consider restricting to specific statuses (e.g., ['pending', 'cancelled']) if desired. */}
                {canManageOrder() && (
                  <button
                    onClick={handleDeleteOrder}
                    className="px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm hover:bg-red-100 transition-colors flex items-center"
                  >
                    <FiTrash2 className="mr-2" size={16} />
                    Delete Order
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Buyer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <InfoCard title="Buyer Information" icon={FiUser}>
              {buyerInfo ? (
                <div>
                  <div className="text-lg font-medium text-gray-800 mb-3">
                    {formatFullName(buyerInfo.first_name, buyerInfo.last_name)}
                  </div>
                  <ContactInfoItem icon={FiMail} value={buyerInfo.email} />
                  <ContactInfoItem icon={FiPhone} value={buyerInfo.phone_number} />
                  <ContactInfoItem icon={FiMapPin} label="Wilaya" value={buyerInfo.wilaya} />
                </div>
              ) : (
                <p className="text-gray-500">Buyer information not available</p>
              )}
            </InfoCard>
            
            {/* Seller Information - Display first seller or note if multiple */}
            <InfoCard title="Seller Information" icon={FiUser}>
              {orderItems.length > 0 && sellerInfoCache[orderItems[0]?.seller_id] ? (
                <div>
                  <div className="text-lg font-medium text-gray-800 mb-3">
                    {formatFullName(
                      sellerInfoCache[orderItems[0].seller_id].first_name,
                      sellerInfoCache[orderItems[0].seller_id].last_name
                    )}
                    {orderItems.some(item => item.seller_id !== orderItems[0].seller_id) && (
                      <span className="text-xs text-gray-500 ml-2">(Multiple sellers, showing first)</span>
                    )}
                  </div>
                  <ContactInfoItem icon={FiMail} value={sellerInfoCache[orderItems[0].seller_id].email} />
                  <ContactInfoItem icon={FiPhone} value={sellerInfoCache[orderItems[0].seller_id].phone_number} />
                  <ContactInfoItem icon={FiMapPin} label="Wilaya" value={sellerInfoCache[orderItems[0].seller_id].wilaya} />
                </div>
              ) : (
                <p className="text-gray-500">Seller information not available</p>
              )}
            </InfoCard>
          </div>

          {/* Delivery and Payment Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <InfoCard title="Delivery Information" icon={FiMapPin}>
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-1">Delivery Address</h3>
                <p className="text-gray-600">{order.delivery_address || order.shipping_address || 'No address provided'}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-1">Estimated Delivery</h3>
                <p className="text-gray-600">{formatDate(order.estimated_delivery)}</p>
              </div>
            </InfoCard>

            <InfoCard title="Payment Information" icon={FiCalendar}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-800">
                  DZD {order.total_amount ? parseFloat(order.total_amount).toFixed(2) : calculateTotal().toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-gray-800">DZD {order.shipping_cost ? parseFloat(order.shipping_cost).toFixed(2) : '0.00'}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Total</span>
                  <span className="font-bold text-gray-900">
                    DZD {order.total_amount ? parseFloat(order.total_amount).toFixed(2) : calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </InfoCard>
          </div>

          {/* Order Status Timeline */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-800">Order Status</h2>
              <div className="text-sm text-gray-500">
                Last updated: {formatDate(order.updated_at || order.order_date)}
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg">
              <div className="space-y-0">
                {getOrderStatusSteps(order, orderStatus).map((step, index, array) => (
                  <OrderStatusStep
                    key={step.key}
                    title={step.title}
                    description={step.description}
                    isActive={step.isActive}
                    isCompleted={step.isCompleted}
                    isError={step.isError}
                    isSuccess={step.isSuccess}
                    isLast={index === array.length - 1}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Order Items with Seller Information */}
          <h2 className="text-lg font-medium text-gray-800 mb-4">Order Items</h2>
          <div className="bg-white rounded-lg overflow-hidden shadow border border-gray-100">
            <div className="divide-y divide-gray-200">
              {orderItems.length > 0 ? (
                orderItems.map((item, index) => (
                  <div key={item.id || `item-${index}`} className="p-4 flex items-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0 mr-4">
                      {item.image_path ? (
                        <img 
                          src={`/api/storage/${item.image_path}`} 
                          alt={getProductName(item)}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-product.png';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiPackage className="text-gray-400" size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{getProductName(item)}</h3>
                      <div className="text-sm text-gray-600 mt-1">
                        Quantity: {item.quantity || 0} × DZD {getItemPrice(item)}
                      </div>
                      {sellerInfoCache[item.seller_id] && (
                        <div className="text-sm text-gray-600 mt-1">
                          Seller: {formatFullName(
                            sellerInfoCache[item.seller_id].first_name,
                            sellerInfoCache[item.seller_id].last_name
                          )}
                        </div>
                      )}
                      <div className="text-sm text-gray-600 mt-1">
                        Total: DZD {(getItemPrice(item) * (item.quantity || 0)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">No items found in this order</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => navigate('/orders')}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back to Orders
        </button>
      </div>
    </div>
  );
};

export default OrderDetailPage;