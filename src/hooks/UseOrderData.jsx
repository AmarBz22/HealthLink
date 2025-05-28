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

  // Helper function to format full name from first and last name
  const formatFullName = (firstName, lastName) => {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    } else {
      return 'Unknown';
    }
  };

  // Function to fetch user details by ID
  const fetchUserDetails = async (userId) => {
    // Check if we already have this user's details cached
    if (userDetails[userId]) {
      return userDetails[userId];
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      };

      const response = await axios.get(`http://localhost:8000/api/users/${userId}`, { headers });
      const userData = response.data.user || response.data;
      
      // Cache the user details
      setUserDetails(prev => ({
        ...prev,
        [userId]: userData
      }));

      return userData;
    } catch (error) {
      console.log(`Failed to fetch user details for ID ${userId}:`, error);
      return null;
    }
  };

  // Helper function to safely get buyer/seller info
  const getBuyerInfo = (order) => {
    // First check if buyer object is nested in the order
    const buyer = order.buyer || order.customer || order.user || order.buyer_info;
    
    if (buyer) {
      return {
        name: formatFullName(buyer.first_name, buyer.last_name),
        email: buyer.email || 'No email',
        phone_number: buyer.phone_number,
        wilaya: buyer.wilaya
      };
    }
    
    // If no nested buyer object, check if we have cached user details
    if (order.buyer_id && userDetails[order.buyer_id]) {
      const buyerUser = userDetails[order.buyer_id];
      return {
        name: formatFullName(buyerUser.first_name, buyerUser.last_name),
        email: buyerUser.email || 'No email',
        phone_number: buyerUser.phone_number,
        wilaya: buyerUser.wilaya
      };
    }
    
    // Return default if no buyer info available
    return {
      name: 'Loading...',
      email: 'Loading...',
      phone_number: null,
      wilaya: null
    };
  };

  const getSellerInfo = (order) => {
    // Check if seller object is nested in the order
    const seller = order.seller || order.vendor || order.shop_owner || order.seller_info;
    
    if (seller) {
      return {
        name: formatFullName(seller.first_name, seller.last_name),
        email: seller.email || 'No email',
        phone_number: seller.phone_number,
        wilaya: seller.wilaya
      };
    }
    
    // If no nested seller object, check if we have cached user details
    if (order.seller_id && userDetails[order.seller_id]) {
      const sellerUser = userDetails[order.seller_id];
      return {
        name: formatFullName(sellerUser.first_name, sellerUser.last_name),
        email: sellerUser.email || 'No email',
        phone_number: sellerUser.phone_number,
        wilaya: sellerUser.wilaya
      };
    }
    
    return {
      name: 'Loading...',
      email: 'Loading...',
      phone_number: null,
      wilaya: null
    };
  };

  // Function to fetch missing user details for orders
  const fetchMissingUserDetails = async (orders) => {
    const missingUserIds = new Set();
    
    orders.forEach(order => {
      // Check if we need buyer details
      if (order.buyer_id && !order.buyer && !userDetails[order.buyer_id]) {
        missingUserIds.add(order.buyer_id);
      }
      // Check if we need seller details
      if (order.seller_id && !order.seller && !userDetails[order.seller_id]) {
        missingUserIds.add(order.seller_id);
      }
    });

    // Fetch details for all missing users
    const fetchPromises = Array.from(missingUserIds).map(userId => 
      fetchUserDetails(userId)
    );
    
    await Promise.all(fetchPromises);
  };

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
        
        // Get current user data first
        const userResponse = await axios.get('http://localhost:8000/api/user', { headers });
        const userData = userResponse.data;
        setCurrentUser(userData);
        
        // Only fetch placed orders if user is not a supplier
        if (userData.role !== 'Supplier') {
          try {
            const buyerResponse = await axios.get('http://localhost:8000/api/buyer-orders', { headers });
            const buyerOrders = buyerResponse.data.orders || buyerResponse.data;
            console.log('Buyer orders response:', buyerOrders);
            setPlacedOrders(Array.isArray(buyerOrders) ? buyerOrders : []);
          } catch (buyerError) {
            console.log('Error fetching buyer orders:', buyerError);
            setPlacedOrders([]);
          }
        } else {
          // Suppliers cannot place orders
          setPlacedOrders([]);
        }
        
        // Fetch orders received by the user (seller orders)
        try {
          const userId = userData.id || userData.user_id;
          const sellerResponse = await axios.get(`http://localhost:8000/api/product-orders/seller/${userId}`, { headers });
          const sellerOrders = sellerResponse.data.orders || sellerResponse.data;
          console.log('Seller orders response:', sellerOrders);
          setReceivedOrders(Array.isArray(sellerOrders) ? sellerOrders : []);
        } catch (sellerError) {
          console.log('Error fetching seller orders:', sellerError);
          setReceivedOrders([]);
        }
        
        // Note: fetchMissingUserDetails will be called in a separate useEffect
        
      } catch (error) {
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

  // Add useEffect to fetch missing user details when orders change
  useEffect(() => {
    if (placedOrders.length > 0 || receivedOrders.length > 0) {
      fetchMissingUserDetails([...placedOrders, ...receivedOrders]);
    }
  }, [placedOrders, receivedOrders]);

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
    getSellerInfo
  };
};