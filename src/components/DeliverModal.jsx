import React from 'react';
import { FiPackage, FiX } from 'react-icons/fi';

const DeliverOrderModal = ({ orderId, orderNumber, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 backdrop-blur-sm  flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FiPackage className="text-green-600 text-2xl mr-3" />
            <h2 className="text-xl font-bold text-gray-800">Confirm Delivery</h2>
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
            Are you sure you want to mark order as delivered?
          </p>
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <p className="text-green-800 text-sm">
              <strong>Note:</strong> Please confirm delivery only after you’ve received your order. Doing so will complete the order and finalize the transaction.
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
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <FiPackage className="mr-2" />
            Confirm Delivery
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliverOrderModal;