import { useState } from 'react';
import { FiPlus, FiShoppingCart } from 'react-icons/fi';
import ProductCard from './ProductCard'; // Import our reusable component

const ProductsSection = ({ 
  products, 
  isOwner, 
  storeId, 
  deletingProductId,
  processingInventory,
  storageUrl, 
  onAddProduct, 
  onDeleteProduct, 
  onEditProduct,
  onPromoteProduct,
  onAddToCart
}) => {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-[#E0F2F1] rounded-full p-4">
            <FiShoppingCart size={32} className="text-[#00796B]" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
        <p className="text-gray-600 mb-6">There are no products to display at this time.</p>
        
        {isOwner && (
          <button
            onClick={onAddProduct}
            className="inline-flex items-center px-4 py-2 bg-[#00796B] text-white rounded-lg hover:bg-[#00695C] transition-colors"
          >
            <FiPlus className="mr-2" /> Add Product
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-500">
          {products.length} {products.length === 1 ? 'product' : 'products'} available
        </div>
        
        {isOwner && (
          <button
            onClick={onAddProduct}
            className="inline-flex items-center px-4 py-2 bg-[#00796B] text-white rounded-lg hover:bg-[#00695C] transition-colors shadow-sm"
          >
            <FiPlus className="mr-2" /> Add Product
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.product_id}
            product={product}
            isOwner={isOwner}
            storageUrl={storageUrl}
            deletingProductId={deletingProductId}
            processingInventory={processingInventory}
            onDeleteProduct={onDeleteProduct}
            onEditProduct={onEditProduct}
            onPromoteProduct={onPromoteProduct}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductsSection;