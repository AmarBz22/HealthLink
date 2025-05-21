import { FiShoppingCart, FiX, FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useBasket } from '../context/BasketContext';

const Basket = () => {
  const {
    basket,
    isBasketOpen,
    toggleBasket,
    removeFromBasket,
    updateQuantity,
    subtotal,
    totalItems,
    clearBasket,
    proceedToCheckout
  } = useBasket();

  if (!isBasketOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
      {/* Slide-in panel without overlay */}
      <div 
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out pointer-events-auto"
        style={{ boxShadow: '-4px 0 15px rgba(0, 0, 0, 0.1)' }}
      >
        <div className="flex flex-col h-full">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">
              Your Basket ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </h2>
            <button 
              onClick={toggleBasket} 
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close basket"
            >
              <FiX size={20} />
            </button>
          </div>
          
          {/* Basket Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {basket.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <FiShoppingCart className="mx-auto text-gray-300 text-5xl mb-4" />
                <p className="text-gray-500 text-lg">Your basket is empty</p>
                <button 
                  onClick={toggleBasket}
                  className="mt-4 px-6 py-2 bg-[#00796B] text-white rounded-lg hover:bg-[#00695C] transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {basket.map(item => (
                  <li key={item.product_id} className="py-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 mr-4">
                        <h3 className="font-medium text-gray-900">{item.product_name}</h3>
                        <p className="text-gray-600 text-sm">${item.price} each</p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center border border-gray-200 rounded-md">
                          <button 
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            className="p-2 text-gray-500 hover:text-[#00796B] hover:bg-gray-50 disabled:opacity-30"
                            disabled={item.quantity <= 1}
                          >
                            <FiMinus size={14} />
                          </button>
                          
                          <span className="w-8 text-center text-gray-700">{item.quantity}</span>
                          
                          <button 
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            className="p-2 text-gray-500 hover:text-[#00796B] hover:bg-gray-50"
                          >
                            <FiPlus size={14} />
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => removeFromBasket(item.product_id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-50 rounded-full transition-colors"
                          aria-label="Remove item"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Footer with checkout actions */}
          {basket.length > 0 && (
            <div className="border-t border-gray-100 p-4 bg-white">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-bold text-lg text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={clearBasket}
                  className="flex-1 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Clear All
                </button>
                
                <button 
                  onClick={proceedToCheckout}
                  className="flex-1 py-3 bg-[#00796B] text-white rounded-lg hover:bg-[#00695C] transition-colors font-medium flex items-center justify-center"
                >
                  Checkout
                  <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Basket;