import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const InventoryConfirmationModal = ({ isOpen, onClose, onConfirm, productName, currentPrice }) => {
  const [inventoryPrice, setInventoryPrice] = useState('');

  // Reset and set default price when modal opens with a new product
  useEffect(() => {
    if (isOpen && currentPrice) {
      // Default to 75% of the original price
      setInventoryPrice((currentPrice * 0.75).toFixed(2));
    }
  }, [isOpen, currentPrice]);

  if (!isOpen) return null;

  // Modified confirm handler to pass inventory price
  const handleConfirm = () => {
    onConfirm(inventoryPrice);
  };

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
        
        <h3 className="text-lg font-bold text-gray-900 mb-2">Move to Inventory</h3>
        <p className="text-gray-600 mb-4">
          You are about to move <span className="font-semibold">"{productName}"</span> to inventory. 
          This will mark the product as a clearance item.
        </p>
        
        <div className="mb-4">
          <label htmlFor="inventoryPrice" className="block text-sm font-medium text-gray-700 mb-1">
            Inventory Price
          </label>
          <input
            type="number"
            id="inventoryPrice"
            value={inventoryPrice}
            onChange={(e) => setInventoryPrice(e.target.value)}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-[#00796B]"
            placeholder="Enter inventory price"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Set a reduced price for this clearance item.
          </p>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-[#00796B] text-white rounded-md hover:bg-[#00695C] transition-colors"
            disabled={!inventoryPrice || inventoryPrice <= 0}
          >
            Move to Inventory
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryConfirmationModal;