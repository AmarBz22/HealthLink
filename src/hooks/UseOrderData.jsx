import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const useOrderData = () => {
  const [placedOrders, setPlacedOrders] = useState([]);
  const [receivedOrders, setReceivedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  const formatFullName = (firstName, lastName) => {
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    if (lastName) return lastName;
    return 'Unknown';
  };

  const fetchUserDetails = async (userId) => {
    if (!userId || userDetails[userId]) return userDetails[userId];

    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;

      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      };

      const response = await axios.get(`http://192.168.43.102:8000/api/users/${userId}`, { headers });
      const userData = response.data.user || response.data;

      setUserDetails((prev) => ({
        ...prev,
        [userId]: userData,
      }));

      return userData;
    } catch (error) {
      console.error(`Failed to fetch user details for ID ${userId}:`, error);
      return null;
    }
  };

  const getBuyerInfo = (order) => {
    const buyer = order.buyer || order.customer || order.user || order.buyer_info;

    if (buyer) {
      return {
        name: formatFullName(buyer.first_name, buyer.last_name),
        email: buyer.email || 'No email',
        phone_number: buyer.phone_number || 'N/A',
        wilaya: buyer.wilaya || 'N/A',
      };
    }

    if (order.buyer_id && userDetails[order.buyer_id]) {
      const buyerUser = userDetails[order.buyer_id];
      return {
        name: formatFullName(buyerUser.first_name, buyerUser.last_name),
        email: buyerUser.email || 'No email',
        phone_number: buyerUser.phone_number || 'N/A',
        wilaya: buyerUser.wilaya || 'N/A',
      };
    }

    return {
      name: 'Unknown',
      email: 'No email',
      phone_number: 'N/A',
      wilaya: 'N/A',
    };
  };

  const getSellerInfo = (order, item = null) => {
    // For received orders, use currentUser as the seller
    if (order.isReceivedOrder && currentUser) {
      return {
        name: formatFullName(currentUser.first_name, currentUser.last_name),
        email: currentUser.email || 'No email',
        phone_number: currentUser.phone_number || 'N/A',
        wilaya: currentUser.wilaya || 'N/A',
      };
    }

    // Check for seller at order level
    const seller = order.seller || order.vendor || order.shop_owner || order.seller_info;
    if (seller) {
      return {
        name: formatFullName(seller.first_name, seller.last_name),
        email: seller.email || 'No email',
        phone_number: seller.phone_number || 'N/A',
        wilaya: seller.wilaya || 'N/A',
      };
    }

    // Check for seller at item level
    if (item && item.seller_id && userDetails[item.seller_id]) {
      const sellerUser = userDetails[item.seller_id];
      return {
        name: formatFullName(sellerUser.first_name, sellerUser.last_name),
        email: sellerUser.email || 'No email',
        phone_number: sellerUser.phone_number || 'N/A',
        wilaya: sellerUser.wilaya || 'N/A',
      };
    }

    // Check for seller_id at order level
    if (order.seller_id && userDetails[order.seller_id]) {
      const sellerUser = userDetails[order.seller_id];
      return {
        name: formatFullName(sellerUser.first_name, sellerUser.last_name),
        email: sellerUser.email || 'No email',
        phone_number: sellerUser.phone_number || 'N/A',
        wilaya: sellerUser.wilaya || 'N/A',
      };
    }

    return {
      name: 'Unknown',
      email: 'No email',
      phone_number: 'N/A',
      wilaya: 'N/A',
    };
  };

  const fetchMissingUserDetails = async (orders) => {
    const missingUserIds = new Set();

    orders.forEach((order) => {
      if (order.buyer_id && !order.buyer && !userDetails[order.buyer_id]) {
        missingUserIds.add(order.buyer_id);
      }
      if (order.seller_id && !order.seller && !userDetails[order.seller_id]) {
        missingUserIds.add(order.seller_id);
      }
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          if (item.seller_id && !userDetails[item.seller_id]) {
            missingUserIds.add(item.seller_id);
          }
        });
      }
    });

    const fetchPromises = Array.from(missingUserIds).map((userId) => fetchUserDetails(userId));
    await Promise.all(fetchPromises);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          toast.error('Please login to view your orders');
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        };

        setLoading(true);

        // Fetch current user
        const userResponse = await axios.get('http://192.168.43.102:8000/api/user', { headers });
        const userData = userResponse.data.user || userResponse.data;
        setCurrentUser(userData);

        // Fetch placed orders (for non-suppliers)
        let buyerOrders = [];
        if (userData.role !== 'Supplier') {
          try {
            const buyerResponse = await axios.get('http://192.168.43.102:8000/api/buyer-orders', { headers });
            buyerOrders = buyerResponse.data.orders || buyerResponse.data || [];
            if (!Array.isArray(buyerOrders)) buyerOrders = [];
            buyerOrders = buyerOrders.map((order) => ({ ...order, isReceivedOrder: false }));
            setPlacedOrders(buyerOrders);
          } catch (buyerError) {
            console.error('Error fetching buyer orders:', buyerError);
            setPlacedOrders([]);
          }
        }

        // Fetch received orders (for sellers)
        let sellerOrders = [];
        try {
          const userId = userData.id || userData.user_id;
          const sellerResponse = await axios.get(`http://192.168.43.102:8000/api/product-orders/seller/${userId}`, { headers });
          sellerOrders = sellerResponse.data.orders || sellerResponse.data || [];
          if (!Array.isArray(sellerOrders)) sellerOrders = [];
          sellerOrders = sellerOrders.map((order) => ({ ...order, isReceivedOrder: true }));
          setReceivedOrders(sellerOrders);
        } catch (sellerError) {
          console.error('Error fetching seller orders:', sellerError);
          setReceivedOrders([]);
        }

        // Fetch user details for all orders
        await fetchMissingUserDetails([...buyerOrders, ...sellerOrders]);

      } catch (error) {
        console.error('Error fetching orders:', error);
        setError(error.response?.data?.message || 'Failed to load orders');
        toast.error('Failed to load orders');
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return {
    placedOrders,
    receivedOrders,
    loading,
    error,
    userDetails,
    currentUser,
    setPlacedOrders,
    setReceivedOrders,
    getBuyerInfo,
    getSellerInfo,
  };
};