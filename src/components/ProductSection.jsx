import { FiPlus, FiTrash2, FiEdit, FiShoppingCart, FiBox } from 'react-icons/fi';

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
          <div 
            key={product.product_id} 
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Product Image */}
            <div className="relative h-48 bg-gray-100">
              {product.image ? (
                <img 
                  src={product.image.startsWith('http') ? product.image : `${storageUrl}/${product.image}`}
                  alt={product.product_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-product.png';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <FiShoppingCart size={48} />
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{product.product_name}</h3>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
              
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#00796B]">${parseFloat(product.price).toFixed(2)}</span>
                
                {isOwner ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEditProduct(product)}
                      className="p-2 text-[#00796B] hover:bg-[#E0F2F1] rounded-full transition-colors"
                      title="Edit product"
                    >
                      <FiEdit size={18} />
                    </button>
                    
                    <button
                      onClick={() => onPromoteProduct(product)}
                      className={`p-2 text-[#00796B] hover:bg-[#E0F2F1] rounded-full transition-colors ${
                        processingInventory === product.product_id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={processingInventory === product.product_id}
                      title="Move to inventory"
                    >
                      <FiBox size={18} />
                    </button>
                    
                    <button
                      onClick={() => onDeleteProduct(product)}
                      className={`p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors ${
                        deletingProductId === product.product_id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={deletingProductId === product.product_id}
                      title="Delete product"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onAddToCart(product)}
                    className="inline-flex items-center p-2 bg-[#00796B] text-white rounded-full hover:bg-[#00695C] transition-colors"
                    title="Add to cart"
                  >
                    <FiShoppingCart size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsSection;