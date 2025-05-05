import { FiX, FiShoppingBag, FiPlusCircle } from 'react-icons/fi';
import PropTypes from 'prop-types';

const AddToCartModal = ({ 
  isOpen, 
  onClose, 
  product, 
  onAddToBasket,
  onOrderNow
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 backdrop-blur-sm bg-opacity-50 transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-10 animate-fade-in">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close modal"
        >
          <FiX size={20} />
        </button>
        
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          How would you like to proceed with "{product.product_name}"?
        </h3>
        
        <div className="space-y-3">
          <button
            onClick={() => {
              onOrderNow(product);
              onClose();
            }}
            className="w-full flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <FiShoppingBag className="mt-0.5 mr-3 text-[#00796B] flex-shrink-0" />
            <div>
              <div className="font-medium">Order Now</div>
              <div className="text-sm text-gray-500 mt-1">Proceed directly to checkout</div>
            </div>
          </button>
          
          <button
            onClick={() => {
              onAddToBasket(product);
              onClose();
            }}
            className="w-full flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <FiPlusCircle className="mt-0.5 mr-3 text-[#00796B] flex-shrink-0" />
            <div>
              <div className="font-medium">Add to Basket</div>
              <div className="text-sm text-gray-500 mt-1">Save for later purchase</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

AddToCartModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  product: PropTypes.object,
  onAddToBasket: PropTypes.func.isRequired,
  onOrderNow: PropTypes.func.isRequired
};

export default AddToCartModal;