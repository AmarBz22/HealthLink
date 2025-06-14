import React from 'react';
import { FiX, FiAlertTriangle } from 'react-icons/fi';

const CancelOrderModal = ({ orderId, orderNumber, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FiAlertTriangle className="text-orange-500 mr-2" />
            Cancel Order
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-2">
            Are you sure you want to cancel this order?
          </p>
          <div className="bg-orange-50 p-3 rounded-md">
        
            <p className="text-sm text-orange-700 mt-1">
              This action cannot be undone. The order status will be changed to "Cancelled".
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Keep Order
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            Cancel Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderModal;