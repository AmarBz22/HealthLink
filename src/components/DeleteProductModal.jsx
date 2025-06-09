import { FiX, FiTrash2, FiAlertTriangle } from 'react-icons/fi';

const DeleteProductModal = ({ 
  productId, 
  productName, 
  productSku,
  onClose, 
  onConfirm,
  isDeleting = false
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blur backdrop */}
      <div className="absolute inset-0 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal content */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-10">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          disabled={isDeleting}
        >
          <FiX size={20} />
        </button>
        
        <div className="flex items-start mb-4">
          <div className="flex-shrink-0 mt-0.5">
            <FiAlertTriangle className="text-red-500 text-xl" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-bold text-gray-900">Delete Product</h3>
            <p className="text-gray-600 mt-1">
              Are you sure you want to permanently delete <span className="font-semibold">{productName}</span>
              {productSku && <span className="text-gray-500"> (SKU: {productSku})</span>}?
            </p>
          </div>
        </div>

        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                This will permanently remove the product from your inventory, including all associated data such as stock levels, pricing history, and sales records. 
                This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(productId)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </>
            ) : (
              <>
                <FiTrash2 className="mr-1" /> 
                Delete Product
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProductModal;