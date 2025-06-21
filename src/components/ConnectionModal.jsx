import { FiX, FiLogIn, FiStar } from 'react-icons/fi';

const ConnectionModal = ({ 
  showModal, 
  modalType, 
  selectedItem, 
  onClose, 
  onLogin, 
  onRegister 
}) => {
  if (!showModal) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50" aria-modal="true" role="dialog">
      <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200/50 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {modalType === 'product' ? 'View Product Details' : 'View Store Details'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close modal"
          >
            <FiX className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        
        {selectedItem && (
          <div className="mb-6">
            {modalType === 'product' ? (
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-gray-100 rounded-xl overflow-hidden">
                  <img 
                    src={selectedItem.images && selectedItem.images.length > 0 
                      ? selectedItem.images[0].image_path 
                      : '/api/placeholder/300/200'} 
                    alt={selectedItem.product_name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{selectedItem.product_name}</h4>
                  <p className="text-[#00796B] font-semibold text-lg">${parseFloat(selectedItem.price).toFixed(2)}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-gray-100 rounded-full overflow-hidden">
                  <img 
                    src={selectedItem.logo_path 
                      ? `http://192.168.43.102:8000/storage/${selectedItem.logo_path}` 
                      : '/api/placeholder/80/80'} 
                    alt={`${selectedItem.name} logo`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{selectedItem.name}</h4>
                  {selectedItem.rating && (
                    <div className="flex items-center">
                      <FiStar className="text-yellow-400 mr-1 h-5 w-5" aria-hidden="true" />
                      <span className="text-sm text-gray-600">{selectedItem.rating} ({selectedItem.reviews} reviews)</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <FiLogIn className="text-4xl text-[#00796B]" aria-hidden="true" />
          </div>
          <p className="text-gray-600 text-sm">
            Please connect to your account to {modalType === 'product' ? 'view product details and make purchases' : 'view store details and their products'}
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={onLogin}
            className="w-full py-3 px-4 bg-[#00796B] text-white rounded-xl hover:bg-[#00695C] focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:ring-offset-2 transition-all duration-200 font-semibold"
          >
            Sign In
          </button>
          <button
            onClick={onRegister}
            className="w-full py-3 px-4 border border-[#00796B] text-[#00796B] rounded-xl hover:bg-[#E0F2F1] focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:ring-offset-2 transition-all duration-200 font-semibold"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionModal;