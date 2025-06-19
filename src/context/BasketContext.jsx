import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BasketContext = createContext();

export const BasketProvider = ({ children }) => {
  const [basket, setBasket] = useState([]);
  const [isBasketOpen, setIsBasketOpen] = useState(false);
  const navigate = useNavigate();

  // Helper function to get the effective price for a product
  const getEffectivePrice = (product) => {
    // If inventory_price exists and is not null/0, use it; otherwise use regular price
    return product.inventory_price && product.inventory_price > 0 
      ? product.inventory_price 
      : product.price;
  };

  const addToBasket = (product) => {
    setBasket(prev => {
      const existingItem = prev.find(item => item.product_id === product.product_id);
      if (existingItem) {
        return prev.map(item =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      // Add the effective price to the product when adding to basket
      const productWithEffectivePrice = {
        ...product,
        effective_price: getEffectivePrice(product),
        quantity: 1
      };
      
      return [...prev, productWithEffectivePrice];
    });
  };

  const removeFromBasket = (productId) => {
    setBasket(prev => prev.filter(item => item.product_id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setBasket(prev =>
      prev.map(item =>
        item.product_id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearBasket = () => {
    setBasket([]);
  };

  const toggleBasket = () => {
    setIsBasketOpen(prev => !prev);
  };

  const proceedToCheckout = () => {
    if (basket.length === 0) {
      return;
    }
    setIsBasketOpen(false); // Close the basket sidebar
    navigate('/checkout'); // Navigate to checkout page
  };

  const totalItems = basket.reduce((sum, item) => sum + item.quantity, 0);
  
  // Use effective_price for subtotal calculation
  const subtotal = basket.reduce((sum, item) => {
    const price = item.effective_price || getEffectivePrice(item);
    return sum + (price * item.quantity);
  }, 0);

  return (
    <BasketContext.Provider
      value={{
        basket,
        addToBasket,
        removeFromBasket,
        updateQuantity,
        clearBasket,
        isBasketOpen,
        toggleBasket,
        totalItems,
        subtotal,
        proceedToCheckout,
        getEffectivePrice // Export this helper function for use in components
      }}
    >
      {children}
    </BasketContext.Provider>
  );
};

export const useBasket = () => useContext(BasketContext);