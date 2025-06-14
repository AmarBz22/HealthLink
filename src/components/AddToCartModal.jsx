import { useState } from 'react';
import { FiMinus, FiPlus, FiShoppingCart, FiX } from 'react-icons/fi';
import { useBasket } from '../context/BasketContext';

const AddToCartModal = ({ isOpen, onClose, product }) => {
  const [quantity, setQuantity] = useState(1);
  const { addToBasket, toggleBasket } = useBasket();

  if (!isOpen || !product) return null;

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrement = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    const productWithQuantity = {
      ...product,
      quantity
    };
    addToBasket(productWithQuantity);
    onClose();
    toggleBasket(); // Open the basket sidebar
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blur backdrop */}
      <div className="absolute inset-0 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal content */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 z-10">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <FiX size={20} />
        </button>
        
        <h3 className="text-xl font-bold text-gray-900 mb-4">Add to Basket</h3>
        
        <div className="flex items-center mb-6">
          {/* Product image */}
          <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden mr-4 flex-shrink-0">
            {product.image_path ? (
              <img 
                src={`http://localhost:8000/storage/${product.image_path}`}
                alt={product.product_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-product.png';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FiShoppingCart className="text-gray-400" size={24} />
              </div>
            )}
          </div>
          
          {/* Product info */}
          <div>
            <h4 className="font-medium text-gray-900">{product.product_name}</h4>
            <p className="text-lg font-bold text-[#00796B]">DZD {product.price}</p>
          </div>
        </div>
        
        {/* Quantity selector */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Quantity
          </label>
          <div className="flex items-center">
            <button
              onClick={handleDecrement}
              disabled={quantity <= 1}
              className="p-2 border border-gray-300 rounded-l-md text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              <FiMinus size={16} />
            </button>
            <div className="px-4 py-2 border-t border-b border-gray-300 text-center w-16">
              {quantity}
            </div>
            <button
              onClick={handleIncrement}
              className="p-2 border border-gray-300 rounded-r-md text-gray-600 hover:bg-gray-50"
            >
              <FiPlus size={16} />
            </button>
          </div>
        </div>
        
        {/* Total */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <span className="text-gray-600">Total:</span>
          <span className="text-xl font-bold text-gray-900"> DZD {(product.price * quantity)}</span>
        </div>
        
        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          
          <button
            onClick={handleAddToCart}
            className="flex-1 py-2 bg-[#00796B] text-white rounded-lg hover:bg-[#00695C] transition-colors font-medium flex items-center justify-center"
          >
            <FiShoppingCart className="mr-2" />
            Add to Basket
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToCartModal;