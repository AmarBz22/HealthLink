import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BasketContext = createContext();

export const BasketProvider = ({ children }) => {
  const [basket, setBasket] = useState([]);
  const [isBasketOpen, setIsBasketOpen] = useState(false);
  const navigate = useNavigate();

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
      return [...prev, { ...product, quantity: 1 }];
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
  const subtotal = basket.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
        proceedToCheckout
      }}
    >
      {children}
    </BasketContext.Provider>
  );
};

export const useBasket = () => useContext(BasketContext);