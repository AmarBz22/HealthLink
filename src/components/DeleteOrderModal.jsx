import { FiX, FiTrash2 } from 'react-icons/fi';

const DeleteOrderModal = ({ orderId, orderNumber, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blur backdrop */}
      <div className="absolute inset-0 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal content */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-10">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <FiX size={20} />
        </button>
        
        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Order</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete order <span className="font-semibold">#{orderNumber}</span>? This action cannot be undone.
        </p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
          >
            <FiTrash2 className="mr-1" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteOrderModal;