import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiShoppingBag,
  FiSearch,
  FiUser,
  FiCalendar,
  FiPackage,
  FiDollarSign,
  FiClock,
  FiTruck
} from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminOrders = () => {
  const navigate = useNavigate();
  
  // State management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch current user data and check if admin
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

        if (userData.role !== 'Admin') {
          toast.error('Access denied. Admin privileges required.');
          navigate('/orders');
          return;
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

  // Fetch all orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser || currentUser.role !== 'Admin') return;

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

        const response = await axios.get('http://localhost:8000/api/product-orders', { headers });
        setOrders(response.data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  // Filter orders based on search query and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.product_order_id?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.delivery_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.total_amount?.toString().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || 
      order.order_status?.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Get status badge color
  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': 'bg-amber-100 text-amber-800',
      'Processing': 'bg-blue-100 text-blue-800', 
      'Completed': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };

    return statusConfig[status] || 'bg-gray-100 text-gray-800';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get total quantity for an order
  const getTotalQuantity = (order) => {
    if (!order.items || order.items.length === 0) return 0;
    return order.items.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  // Get product names for an order
  const getProductNames = (order) => {
    if (!order.items || order.items.length === 0) return 'No items';
    return order.items
      .map(item => item.product?.product_name || 'Unknown Product')
      .join(', ');
  };

  if (userLoading || loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00796B]"></div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'Admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 p-8 rounded-xl text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUser className="text-red-600 text-2xl" />
          </div>
          <h2 className="text-red-800 text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-red-600 mb-6">Admin privileges required to view all orders.</p>
          <button
            onClick={() => navigate('/orders')}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Go to Your Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FiShoppingBag className="mr-2 text-[#00796B]" />
            All Orders
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and monitor all platform orders
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Search */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Orders Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { 
            title: 'Total Orders', 
            value: orders.length, 
            icon: FiPackage, 
            color: 'border-blue-500'
          },
          { 
            title: 'Pending', 
            value: orders.filter(o => o.order_status === 'Pending').length, 
            icon: FiClock, 
            color: 'border-amber-500'
          },
          { 
            title: 'Processing', 
            value: orders.filter(o => o.order_status === 'Processing').length, 
            icon: FiTruck, 
            color: 'border-blue-500'
          },
          { 
            title: 'Completed', 
            value: orders.filter(o => o.order_status === 'Completed').length, 
            icon: FiDollarSign, 
            color: 'border-green-500'
          }
        ].map((stat, index) => (
          <div key={index} className={`bg-white rounded-xl shadow p-6 border-l-4 ${stat.color}`}>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gray-100 mr-4">
                <stat.icon className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiShoppingBag className="text-gray-400 text-3xl" />
            </div>
            <h2 className="text-xl font-medium text-gray-700 mb-2">No Orders Found</h2>
            <p className="text-gray-500">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'No orders have been placed yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.product_order_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          #{order.product_order_id}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <FiUser className="mr-1" />
                          Buyer ID: {order.buyer_id}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          📍 {order.delivery_address || 'No address'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {getProductNames(order)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getTotalQuantity(order)} items
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(order.total_amount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.payment_status || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(order.order_status)}`}>
                        {order.order_status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FiCalendar className="mr-2 text-gray-400" />
                        {formatDate(order.created_at)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center">
        <p className="text-gray-500 text-sm">
          Showing {filteredOrders.length} of {orders.length} orders
        </p>
      </div>
    </div>
  );
};

export default AdminOrders;