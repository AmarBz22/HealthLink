import React from 'react';
import { 
  FiPackage, 
  FiCalendar, 
  FiEye, 
  FiTruck, 
  FiClock,
  FiShoppingBag,
  FiDollarSign,
  FiTrash2,
  FiCheck,
  FiSend
} from 'react-icons/fi';

const OrdersTable = ({ 
  orders, 
  activeTab, 
  searchQuery, 
  expandedOrderId, 
  onToggleExpand, 
  onNavigateToDetails,
  onApproveOrder,
  onDeleteOrder,
  onShipOrder,        // New prop
  onDeliverOrder,     // New prop
  getBuyerInfo,
  getSellerInfo,
  currentUser         // New prop
}) => {

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

  const handleToggleExpand = (orderId) => {
    if (onToggleExpand) {
      onToggleExpand(orderId);
    }
  };

  const handleNavigateToDetails = (orderId) => {
    if (onNavigateToDetails) {
      onNavigateToDetails(orderId);
    }
  };

  const handleApproveOrder = (order) => {
    if (onApproveOrder) {
      onApproveOrder(order);
    }
  };

  const handleDeleteOrder = (order) => {
    if (onDeleteOrder) {
      onDeleteOrder(order);
    }
  };

  const handleShipOrder = (order) => {
    if (onShipOrder) {
      onShipOrder(order);
    }
  };

  const handleDeliverOrder = (order) => {
    if (onDeliverOrder) {
      onDeliverOrder(order);
    }
  };

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
                  {activeTab === 'placed' ? 'Seller' : 'Customer'}
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
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No orders match your search
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  // Get buyer/seller info using helper functions
                  const buyerInfo = getBuyerInfo(order);
                  const sellerInfo = getSellerInfo(order);
                  
                  return (
                    <React.Fragment key={order.product_order_id}>
                      <tr 
                        className={`hover:bg-gray-50 cursor-pointer ${expandedOrderId === order.product_order_id ? 'bg-gray-50' : ''}`}
                        onClick={() => handleToggleExpand(order.product_order_id)}
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
                          <div className="text-sm text-gray-900">
                            {activeTab === 'placed' ? sellerInfo.name : buyerInfo.name}
                            <div className="text-xs text-gray-500">
                              {activeTab === 'placed' ? sellerInfo.email : buyerInfo.email}
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
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNavigateToDetails(order.product_order_id);
                              }}
                              className="text-[#00796B] hover:text-[#00695C] transition-colors"
                            >
                              <FiEye className="inline mr-1" /> View Details
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedOrderId === order.product_order_id && (
                        <tr>
                          <td colSpan="5" className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                            <div className="py-3">
                              <h3 className="text-sm font-medium text-gray-600 mb-3">Order Items</h3>
                              <div className="space-y-2">
                                {Array.isArray(order.items) && order.items.length > 0 ? (
                                  order.items.map((item, index) => {
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

                              {/* Customer Information */}
                              <div className="mt-4 pt-3 border-t border-gray-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-600 mb-2">
                                      {activeTab === 'placed' ? 'Your Information' : 'Customer Information'}
                                    </h4>
                                    <div className="text-sm text-gray-700">
                                      <div className="font-medium">{activeTab === 'placed' ? buyerInfo.name : buyerInfo.name}</div>
                                      <div>{activeTab === 'placed' ? buyerInfo.email : buyerInfo.email}</div>
                                      {(activeTab === 'placed' ? buyerInfo.phone_number : buyerInfo.phone_number) && <div>{activeTab === 'placed' ? buyerInfo.phone_number : buyerInfo.phone_number}</div>}
                                      {(activeTab === 'placed' ? buyerInfo.wilaya : buyerInfo.wilaya) && <div>{activeTab === 'placed' ? buyerInfo.wilaya : buyerInfo.wilaya}</div>}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-600 mb-2">
                                      {activeTab === 'placed' ? 'Seller Information' : 'Your Information'}
                                    </h4>
                                    <div className="text-sm text-gray-700">
                                      <div className="font-medium">{activeTab === 'placed' ? sellerInfo.name : sellerInfo.name}</div>
                                      <div>{activeTab === 'placed' ? sellerInfo.email : sellerInfo.email}</div>
                                      {(activeTab === 'placed' ? sellerInfo.phone_number : sellerInfo.phone_number) && <div>{activeTab === 'placed' ? sellerInfo.phone_number : sellerInfo.phone_number}</div>}
                                      {(activeTab === 'placed' ? sellerInfo.wilaya : sellerInfo.wilaya) && <div>{activeTab === 'placed' ? sellerInfo.wilaya : sellerInfo.wilaya}</div>}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Enhanced Manage Order Section */}
                              <div className="mt-4 pt-3 border-t border-gray-100">
                                <div className="flex justify-between items-center">
                                  <h3 className="text-sm font-medium text-gray-600">Manage Order</h3>
                                  <div className="flex flex-wrap gap-2">
                                    {/* Received Orders Actions (Seller's perspective) */}
                                    {activeTab === 'received' && (
                                      <>
                                        {/* Approve Order - Only show for pending orders */}
                                        {order.order_status?.toLowerCase() === 'pending' && (
                                          <button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleApproveOrder(order);
                                            }}
                                            className="px-3 py-1 bg-green-50 text-green-700 rounded-md text-sm hover:bg-green-100 transition-colors flex items-center"
                                          >
                                            <FiCheck className="mr-1" /> Approve Order
                                          </button>
                                        )}
                                        
                                        {/* Ship Order - Only show for processing orders */}
                                        {order.order_status?.toLowerCase() === 'processing' && (
                                          <button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleShipOrder(order);
                                            }}
                                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-sm hover:bg-blue-100 transition-colors flex items-center"
                                          >
                                            <FiTruck className="mr-1" /> Ship Order
                                          </button>
                                        )}
                                      </>
                                    )}
                                    
                                    {/* Placed Orders Actions (Buyer's perspective) */}
                                    {activeTab === 'placed' && (
                                      <>
                                        {/* Mark as Delivered - Only show for shipped orders */}
                                        {order.order_status?.toLowerCase() === 'shipped' && (
                                          <button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeliverOrder(order);
                                            }}
                                            className="px-3 py-1 bg-green-50 text-green-700 rounded-md text-sm hover:bg-green-100 transition-colors flex items-center"
                                          >
                                            <FiPackage className="mr-1" /> Mark as Delivered
                                          </button>
                                        )}
                                      </>
                                    )}
                                    
                                    {/* Delete Order - Available for both tabs with conditions */}
                                    {(
                                      (activeTab === 'placed' && order.order_status?.toLowerCase() === 'pending') ||
                                      (activeTab === 'received' && ['pending', 'delivered', 'cancelled'].includes(order.order_status?.toLowerCase()))
                                    ) && (
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteOrder(order);
                                        }}
                                        className="px-3 py-1 bg-red-50 text-red-700 rounded-md text-sm hover:bg-red-100 transition-colors flex items-center"
                                      >
                                        <FiTrash2 className="mr-1" /> Delete Order
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })
              )}
            </tbody>
          </table>
      </div>
    </div>
  );
};

export default OrdersTable;