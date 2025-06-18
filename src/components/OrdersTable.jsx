import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPackage,
  FiCalendar,
  FiEye,
  FiTruck,
  FiClock,
  FiShoppingBag,
  FiTrash2,
  FiCheck,
  FiSend,
  FiX,
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
  onCancelOrder,
  onShipOrder,
  onDeliverOrder,
  getBuyerInfo,
  getSellerInfo,
  currentUser,
}) => {
  const [buyerInfoCache, setBuyerInfoCache] = useState({});
  const [sellerInfoCache, setSellerInfoCache] = useState({});
  const navigate = useNavigate();

  // Fetch buyer and seller info for all orders
  useEffect(() => {
    const fetchUserInfo = async () => {
      const newBuyerInfo = {};
      const newSellerInfo = {};

      for (const order of orders) {
        // Fetch buyer info
        if (order.buyer_id && !buyerInfoCache[order.buyer_id]) {
          newBuyerInfo[order.buyer_id] = getBuyerInfo(order);
        }

        // Fetch seller info
        if (activeTab === 'received' && currentUser && !sellerInfoCache[currentUser.id]) {
          newSellerInfo[currentUser.id] = {
            name: `${currentUser.first_name} ${currentUser.last_name || ''}`,
            email: currentUser.email || 'No email',
            phone_number: currentUser.phone_number || 'N/A',
            wilaya: currentUser.wilaya || 'N/A',
          };
        } else if (order.items && Array.isArray(order.items)) {
          for (const item of order.items) {
            if (item.seller_id && !sellerInfoCache[item.seller_id]) {
              newSellerInfo[item.seller_id] = getSellerInfo(order, item);
            }
          }
        }
      }

      // Only update state if new data was added
      if (Object.keys(newBuyerInfo).length > 0) {
        setBuyerInfoCache((prev) => ({ ...prev, ...newBuyerInfo }));
      }
      if (Object.keys(newSellerInfo).length > 0) {
        setSellerInfoCache((prev) => ({ ...prev, ...newSellerInfo }));
      }
    };

    if (orders.length > 0) {
      fetchUserInfo();
    }
  }, [orders, getBuyerInfo, getSellerInfo, activeTab, currentUser]); // Removed buyerInfoCache, sellerInfoCache

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null || isNaN(parseFloat(price))) {
      return '0.00';
    }
    return parseFloat(price).toFixed(2);
  };

  const getOrderTotal = (order) => {
    if (order.total_amount && !isNaN(parseFloat(order.total_amount))) {
      return parseFloat(order.total_amount);
    }

    if (!Array.isArray(order.items) || order.items.length === 0) return 0;

    return order.items.reduce((total, item) => {
      const price = item.product?.price || item.price || 0;
      const quantity = item.quantity || 1;
      return total + price * quantity;
    }, 0);
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'canceled':
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
        return <FiX className="mr-1" />;
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
    return orders.filter((order) => {
      const buyerInfo = buyerInfoCache[order.buyer_id] || {
        name: order.buyer_name || 'Unknown',
        email: order.buyer_email || 'No email',
      };
      const sellerInfo =
        activeTab === 'received'
          ? sellerInfoCache[currentUser.id] || {
              name: currentUser?.first_name
                ? `${currentUser.first_name} ${currentUser.last_name || ''}`
                : 'Unknown',
              email: currentUser?.email || 'No email',
            }
          : order.items?.[0]
          ? sellerInfoCache[order.items[0].seller_id] || {
              name: order.seller_name || 'Unknown',
              email: order.seller_email || 'No email',
            }
          : { name: 'N/A', email: 'N/A' };

      return (
        order.product_order_id?.toString().includes(searchLower) ||
        order.order_status?.toLowerCase().includes(searchLower) ||
        (order.order_date &&
          new Date(order.order_date).toLocaleDateString().toLowerCase().includes(searchLower)) ||
        buyerInfo.name?.toLowerCase().includes(searchLower) ||
        buyerInfo.email?.toLowerCase().includes(searchLower) ||
        sellerInfo.name?.toLowerCase().includes(searchLower) ||
        sellerInfo.email?.toLowerCase().includes(searchLower) ||
        order.items?.some((item) =>
          item.product?.product_name?.toLowerCase().includes(searchLower)
        )
      );
    });
  };

  const shouldShowCancelButton = (order) => {
    if (activeTab !== 'placed') return false;
    const status = order.order_status?.toLowerCase();
    return ['pending', 'processing'].includes(status);
  };

  const shouldShowSellerCancelButton = (order) => {
    if (activeTab !== 'received') return false;
    const status = order.order_status?.toLowerCase();
    return ['pending', 'processing', 'shipped'].includes(status);
  };

  const shouldShowDeleteButton = (order) => {
    if (activeTab !== 'received') return false;
    const status = order.order_status?.toLowerCase();
    return ['pending', 'delivered', 'canceled'].includes(status);
  };

  const filteredOrders = filterOrders(orders || []);

  if (!filteredOrders || filteredOrders.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg p-8 text-center">
        <FiShoppingBag className="mx-auto text-gray-400 text-5xl mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">No Orders Yet</h2>
        <p className="text-gray-600 mb-6">
          {activeTab === 'placed'
            ? "You haven't placed any orders yet."
            : "No orders have been received."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                {activeTab === 'placed' ? 'Seller' : 'Customer'}
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredOrders.map((order) => {
              const buyerInfo = buyerInfoCache[order.buyer_id] || getBuyerInfo(order);
              const sellerInfo =
                activeTab === 'received'
                  ? sellerInfoCache[currentUser.id] || {
                      name: currentUser?.first_name
                        ? `${currentUser.first_name} ${currentUser.last_name || ''}`
                        : 'Unknown',
                      email: currentUser?.email || 'No email',
                      phone_number: currentUser?.phone_number || 'N/A',
                      wilaya: currentUser?.wilaya || 'N/A',
                    }
                  : order.items && order.items.length > 0
                  ? sellerInfoCache[order.items[0].seller_id] || getSellerInfo(order, order.items[0])
                  : getSellerInfo(order);

              return (
                <React.Fragment key={order.product_order_id}>
                  <tr
                    className={`hover:bg-gray-50 cursor-pointer ${
                      expandedOrderId === order.product_order_id ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => onToggleExpand(order.product_order_id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiCalendar className="text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">{formatDate(order.order_date)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">
                          {activeTab === 'placed' ? sellerInfo.name : buyerInfo.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {activeTab === 'placed' ? sellerInfo.email : buyerInfo.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-md ${getStatusBadgeColor(
                          order.order_status
                        )}`}
                      >
                        {getStatusIcon(order.order_status)}
                        {order.order_status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span>DZD {formatPrice(getOrderTotal(order))}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('OrdersTable: Triggering navigation for ID:', order.product_order_id);
                            onNavigateToDetails(order.product_order_id);
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
                      <td colSpan="6" className="px-6 py-3 bg-gray-100 border-t border-gray-100">
                        <div className="py-3">
                          {/* Order items section */}
                          <div className="mb-4">
                            <h3 className="text-sm font-semibold text-gray-600 mb-3">Order Items</h3>
                            <div className="space-y-2">
                              {Array.isArray(order.items) && order.items.length > 0 ? (
                                order.items.map((item, index) => {
                                  const productName = item?.product?.product_name || item?.product_name || 'N/A';
                                  const productPrice = item?.product?.price || item?.price || 0;
                                  const storeName =
                                    item?.product?.store?.store_name || item?.store_name || 'N/A';
                                  const imagePath =
                                    item?.product?.images?.[0]?.image_path || item?.image_path || null;
                                  const itemSellerInfo = sellerInfoCache[item.seller_id] || getSellerInfo(order, item);

                                  return (
                                    <div
                                      key={item.item_id || `item-${index}`}
                                      className="flex justify-between items-center p-3 bg-gray-100 rounded-md border border-gray-200"
                                    >
                                      <div className="flex items-center">
                                        {imagePath ? (
                                          <img
                                            src={imagePath}
                                            alt={productName}
                                            className="h-16 w-16 object-cover rounded mr-3"
                                          />
                                        ) : (
                                          <div className="h-12 w-12 rounded bg-gray-100 flex items-center justify-center mr-3">
                                            <FiShoppingBag className="text-gray-500" />
                                          </div>
                                        )}
                                        <div>
                                          <h4 className="font-semibold text-gray-800">{productName}</h4>
                                          <p className="text-xs text-gray-400">Qty: {item.quantity || 'N/A'}</p>
                                          <p className="text-xs text-gray-400">Store: {storeName}</p>
                                          <p className="text-xs text-gray-400">Seller: {itemSellerInfo.name}</p>
                                          {item.product?.category && (
                                            <p className="text-xs text-gray-400">
                                              Category: {item.product.category}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-medium text-gray-800">DZD {formatPrice(productPrice)}</p>
                                        <p className="text-xs text-gray-400">
                                          Total: DZD {formatPrice(productPrice * (item.quantity || 1))}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="p-3 bg-gray-200 rounded-md text-center">
                                  <p className="text-gray-500 text-sm">No items found for this order</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Delivery info section */}
                          <div className="mb-4 pt-4 border-t border-gray-100">
                            <div className="flex flex-col md:flex-row justify-between">
                              <div className="text-sm mb-1 md:mb-0">
                                <span className="text-gray-600 font-semibold">Delivery Address: </span>
                                <span>{order?.delivery_address || 'N/A'}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-600 font-semibold">Estimated Delivery: </span>
                                <span>{formatDate(order?.estimated_delivery) || 'N/A'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Buyer and seller info section */}
                          <div className="mb-4 pt-4 border-t border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-semibold text-gray-600 mb-2">
                                  {activeTab === 'placed' ? 'Your Information' : 'Customer Information'}
                                </h4>
                                <div className="text-sm text-gray-700">
                                  <div className="font-semibold">{buyerInfo.name || 'N/A'}</div>
                                  <div>{buyerInfo.email || 'N/A'}</div>
                                  {buyerInfo.phone_number && buyerInfo.phone_number !== 'N/A' && (
                                    <div>
                                      Phone:{' '}
                                      <a
                                        href={`tel:${buyerInfo.phone_number}`}
                                        className="text-blue-600 hover:underline"
                                      >
                                        {buyerInfo.phone_number}
                                      </a>
                                    </div>
                                  )}
                                  {buyerInfo.wilaya && buyerInfo.wilaya !== 'N/A' && (
                                    <div>Region: {buyerInfo.wilaya}</div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-gray-600 mb-2">
                                  {activeTab === 'placed' ? 'Seller Information' : 'Your Information'}
                                </h4>
                                <div className="text-sm text-gray-700">
                                  <div className="font-semibold">{sellerInfo.name || 'N/A'}</div>
                                  <div>{sellerInfo.email || 'N/A'}</div>
                                  {sellerInfo.phone_number && sellerInfo.phone_number !== 'N/A' && (
                                    <div>
                                      Phone:{' '}
                                      <a
                                        href={`tel:${sellerInfo.phone_number}`}
                                        className="text-blue-600 hover:underline"
                                      >
                                        {sellerInfo.phone_number}
                                      </a>
                                    </div>
                                  )}
                                  {sellerInfo.wilaya && sellerInfo.wilaya !== 'N/A' && (
                                    <div>Region: {sellerInfo.wilaya}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Manage order section */}
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-2">
                              <h3 className="text-sm font-semibold text-gray-600 hidden md:block">
                                Manage Order
                              </h3>
                              <div className="flex flex-wrap gap-2 justify-end">
                                {activeTab === 'received' && (
                                  <>
                                    {order.order_status?.toLowerCase() === 'pending' && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onApproveOrder(order);
                                        }}
                                        className="px-3 py-2 bg-green-50 text-green-600 rounded-md text-sm hover:bg-green-100 transition-colors flex items-center"
                                      >
                                        <FiCheck className="mr-1" /> Approve Order
                                      </button>
                                    )}
                                    {order.order_status?.toLowerCase() === 'processing' && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onShipOrder(order);
                                        }}
                                        className="px-3 py-2 bg-blue-50 text-blue-600 rounded-md text-sm hover:bg-blue-100 transition-colors flex items-center"
                                      >
                                        <FiTruck className="mr-1" /> Ship Order
                                      </button>
                                    )}
                                    {shouldShowSellerCancelButton(order) && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onCancelOrder(order);
                                        }}
                                        className="px-3 py-2 bg-orange-50 text-orange-600 rounded-md text-sm hover:bg-orange-100 transition-colors flex items-center"
                                      >
                                        <FiX className="mr-1" /> Cancel Order
                                      </button>
                                    )}
                                    {shouldShowDeleteButton(order) && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onDeleteOrder(order);
                                        }}
                                        className="px-3 py-2 bg-red-50 text-red-600 rounded-md text-sm hover:bg-red-100 transition-colors flex items-center"
                                      >
                                        <FiTrash2 className="mr-1" /> Delete Order
                                      </button>
                                    )}
                                  </>
                                )}
                                {activeTab === 'placed' && (
                                  <>
                                    {order.order_status?.toLowerCase() === 'shipped' && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onDeliverOrder(order);
                                        }}
                                        className="px-3 py-2 bg-green-50 text-green-600 rounded-md text-sm hover:bg-green-100 transition-colors flex items-center"
                                      >
                                        <FiPackage className="mr-1" /> Mark as Delivered
                                      </button>
                                    )}
                                    {shouldShowCancelButton(order) && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onCancelOrder(order);
                                        }}
                                        className="px-3 py-2 bg-orange-50 text-orange-600 rounded-md text-sm hover:bg-orange-100 transition-colors flex items-center"
                                      >
                                        <FiX className="mr-1" /> Cancel Order
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersTable;