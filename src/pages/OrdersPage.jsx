import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiShoppingBag,
  FiLoader,
  FiSearch,
  FiShoppingCart,
  FiSend,
  FiTruck,
  FiPackage
} from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import React from 'react';
import ApproveOrderModal from '../components/ApproveOrderModal';
import DeleteOrderModal from '../components/DeleteOrderModal';
import ShipOrderModal from '../components/ShipOrderModal';
import DeliverOrderModal from '../components/DeliverModal';
import ProductRatingModal from '../components/ProductRatingModal';
import OrdersTable from '../components/OrdersTable';
import { useOrderData } from '../hooks/UseOrderData';

const OrdersPage = () => {
  const navigate = useNavigate();
  
  // State management
  const [activeTab, setActiveTab] = useState('placed'); // 'placed' or 'received'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [orderToApprove, setOrderToApprove] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [showShipModal, setShowShipModal] = useState(false);
  const [orderToShip, setOrderToShip] = useState(null);
  const [showDeliverModal, setShowDeliverModal] = useState(false);
  const [orderToDeliver, setOrderToDeliver] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [orderToRate, setOrderToRate] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  // Use custom hook for order data management
  const {
    placedOrders,
    receivedOrders,
    loading,
    error,
    setPlacedOrders,
    setReceivedOrders,
    userDetails,
    getBuyerInfo,
    getSellerInfo
  } = useOrderData();

  // Fetch current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          toast.error('Please login to view orders');
          navigate('/login');
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        };

        const userResponse = await axios.get('http://localhost:8000/api/user', { headers });
        const userData = userResponse.data;
        setCurrentUser(userData);

        // Set default tab based on user role
        // If user is a supplier, they can only receive orders, not place them
        if (userData.role === 'Supplier') {
          setActiveTab('received');
        }
        
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          navigate('/login');
        }
        toast.error('Failed to load user information');
      } finally {
        setUserLoading(false);
      }
    };

    fetchCurrentUser();
  }, [navigate]);

  // Check if user can place orders (not a supplier)
  const canPlaceOrders = currentUser && currentUser.role !== 'Supplier';

  // Functions to handle orders
  const toggleOrderExpand = (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  // Add navigation function for order details
  const navigateToOrderDetails = (orderId) => {
    navigate(`/orders/${orderId}`);
  };
  
  const handleApproveOrder = (order) => {
    setOrderToApprove(order);
    setShowApproveModal(true);
  };

  const handleDeleteOrder = (order) => {
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };

  // New function to handle shipping orders
  const handleShipOrder = (order) => {
    setOrderToShip(order);
    setShowShipModal(true);
  };

  // New function to handle delivering orders
  const handleDeliverOrder = (order) => {
    setOrderToDeliver(order);
    setShowDeliverModal(true);
  };

  // New function to handle submitting ratings
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

      // Submit each rating individually
      const ratingPromises = ratingsData.map(rating => 
        axios.post('http://localhost:8000/api/ratings', rating, { headers })
      );

      await Promise.all(ratingPromises);
      
      toast.success('Ratings submitted successfully!');
      setShowRatingModal(false);
      setOrderToRate(null);
    } catch (error) {
      console.error('Error submitting ratings:', error);
      toast.error(error.response?.data?.message || 'Failed to submit ratings');
      throw error; // Re-throw to handle in modal
    }
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
      toast.error(error.response?.data?.message || 'Failed to approve order');
    }
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    
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
        `http://localhost:8000/api/product-orders/${orderToDelete.product_order_id}`,
        { headers }
      );
      
      toast.success('Order deleted successfully');
      
      // Remove the order from local state
      if (activeTab === 'placed') {
        setPlacedOrders(prevOrders => 
          prevOrders.filter(o => o.product_order_id !== orderToDelete.product_order_id)
        );
      } else {
        setReceivedOrders(prevOrders => 
          prevOrders.filter(o => o.product_order_id !== orderToDelete.product_order_id)
        );
      }
      
      // Close the modal
      setShowDeleteModal(false);
      setOrderToDelete(null);
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error(error.response?.data?.message || 'Failed to delete order');
    }
  };

  // New function to confirm shipping order
  const confirmShipOrder = async () => {
    if (!orderToShip) return;
    
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
        `http://localhost:8000/api/product-orders/${orderToShip.product_order_id}/ship`,
        {},
        { headers }
      );
      
      toast.success('Order marked as shipped successfully');
      
      // Update the order status locally
      setReceivedOrders(prevOrders => 
        prevOrders.map(o => 
          o.product_order_id === orderToShip.product_order_id 
            ? { ...o, order_status: 'Shipped' } 
            : o
        )
      );
      
      // Close the modal
      setShowShipModal(false);
      setOrderToShip(null);
    } catch (error) {
      console.error('Error shipping order:', error);
      toast.error(error.response?.data?.message || 'Failed to ship order');
    }
  };

  // Updated function to confirm delivering order and show rating modal
  const confirmDeliverOrder = async () => {
    if (!orderToDeliver) return;
    
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
        `http://localhost:8000/api/product-orders/${orderToDeliver.product_order_id}/deliver`,
        {},
        { headers }
      );
      
      toast.success('Order marked as delivered successfully');
      
      // Update the order status locally in placed orders (buyer's perspective)
      setPlacedOrders(prevOrders => 
        prevOrders.map(o => 
          o.product_order_id === orderToDeliver.product_order_id 
            ? { ...o, order_status: 'Delivered' } 
            : o
        )
      );
      
      // Close the deliver modal
      setShowDeliverModal(false);
      
      // Show rating modal for the delivered order
      setOrderToRate(orderToDeliver);
      setShowRatingModal(true);
      
      // Clear the order to deliver
      setOrderToDeliver(null);
    } catch (error) {
      console.error('Error delivering order:', error);
      toast.error(error.response?.data?.message || 'Failed to mark order as delivered');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00796B]"></div>
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

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <p className="text-gray-600">Unable to load user information</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-4 py-2 bg-[#00796B] text-white rounded-lg hover:bg-[#00695C] transition-colors"
          >
            Login
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

      {/* Delete Order Modal */}
      {showDeleteModal && orderToDelete && (
        <DeleteOrderModal 
          orderId={orderToDelete.product_order_id}
          orderNumber={orderToDelete.product_order_id}
          onClose={() => {
            setShowDeleteModal(false);
            setOrderToDelete(null);
          }}
          onConfirm={confirmDeleteOrder}
        />
      )}

      {/* Ship Order Modal */}
      {showShipModal && orderToShip && (
        <ShipOrderModal 
          orderId={orderToShip.product_order_id}
          orderNumber={orderToShip.product_order_id}
          onClose={() => {
            setShowShipModal(false);
            setOrderToShip(null);
          }}
          onConfirm={confirmShipOrder}
        />
      )}

      {/* Deliver Order Modal */}
      {showDeliverModal && orderToDeliver && (
        <DeliverOrderModal 
          orderId={orderToDeliver.product_order_id}
          orderNumber={orderToDeliver.product_order_id}
          onClose={() => {
            setShowDeliverModal(false);
            setOrderToDeliver(null);
          }}
          onConfirm={confirmDeliverOrder}
        />
      )}

      {/* Product Rating Modal */}
      {showRatingModal && orderToRate && (
        <ProductRatingModal 
          order={orderToRate}
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            setOrderToRate(null);
          }}
          onSubmitRatings={handleSubmitRatings}
        />
      )}
      
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <FiShoppingBag className="text-[#00796B] text-2xl mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Marketplace Orders</h1>
            <p className="text-sm text-gray-600">
              Welcome, {currentUser.first_name} {currentUser.last_name} ({currentUser.role})
            </p>
          </div>
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
          {canPlaceOrders && (
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
          )}
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

      {/* Role-based message for suppliers */}
      {!canPlaceOrders && activeTab === 'placed' && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> As a supplier, you can only view orders you've received from customers. 
            You cannot place orders yourself.
          </p>
        </div>
      )}

      {/* Display active tab content */}
      {canPlaceOrders || activeTab === 'received' ? (
        <OrdersTable 
          orders={activeTab === 'placed' ? placedOrders : receivedOrders}
          activeTab={activeTab}
          searchQuery={searchQuery}
          expandedOrderId={expandedOrderId}
          onToggleExpand={toggleOrderExpand}
          onNavigateToDetails={navigateToOrderDetails}
          onApproveOrder={handleApproveOrder}
          onDeleteOrder={handleDeleteOrder}
          onShipOrder={handleShipOrder}
          onDeliverOrder={handleDeliverOrder}
          getBuyerInfo={getBuyerInfo}
          getSellerInfo={getSellerInfo}
          currentUser={currentUser}
        />
      ) : (
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <FiShoppingBag className="mx-auto text-gray-400 text-5xl mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-6">
            As a supplier, you can only view orders you've received. Please switch to the "Orders You've Received" tab.
          </p>
          <button
            onClick={() => setActiveTab('received')}
            className="px-6 py-2 bg-[#00796B] text-white rounded-lg hover:bg-[#00695C] transition-colors"
          >
            View Received Orders
          </button>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;