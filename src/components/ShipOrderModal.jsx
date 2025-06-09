import React from 'react';
import { FiTruck, FiX } from 'react-icons/fi';

const ShipOrderModal = ({ orderId, orderNumber, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 backdrop-blur-sm  flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FiTruck className="text-blue-600 text-2xl mr-3" />
            <h2 className="text-xl font-bold text-gray-800">Ship Order</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="text-xl" />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Are you sure you want to mark order <span className="font-semibold">#{orderNumber}</span> as shipped?
          </p>
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> Once marked as shipped, the order status will change to "Shipped" 
              and the buyer will be notified. Make sure the order has been dispatched before confirming.
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FiTruck className="mr-2" />
            Mark as Shipped
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShipOrderModal;