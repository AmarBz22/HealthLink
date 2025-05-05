import { FiX, FiBox } from 'react-icons/fi';

const InventoryConfirmationModal = ({ isOpen, onClose, onConfirm, productName }) => {
  if (!isOpen) return null;

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
        
        <div className="flex items-center mb-4">
          <div className="bg-[#E0F2F1] p-3 rounded-full mr-3">
            <FiBox size={24} className="text-[#00796B]" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Move to Inventory</h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          Are you sure you want to move <span className="font-semibold">"{productName}"</span> to inventory? 
          This will clear the product from your store's active listings.
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
            className="px-4 py-2 bg-[#00796B] text-white rounded-md hover:bg-[#00695C] transition-colors"
          >
            Move to Inventory
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryConfirmationModal;