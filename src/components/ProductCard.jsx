import { useState } from 'react';
import { FiShoppingCart, FiEdit, FiTrash2, FiBox, FiChevronLeft, FiChevronRight, FiEye } from 'react-icons/fi';

const ProductCard = ({
  product,
  isOwner = false,
  storageUrl = '',
  deletingProductId = null,
  processingInventory = null,
  onDeleteProduct = () => {},
  onEditProduct = () => {},
  onPromoteProduct = () => {},
  onAddToCart = () => {},
  onViewDetails = () => {}, // Added view details handler
  className = '',
  imageHeight = 'h-48',
  showInventoryPrice = false, // Prop to control inventory price display
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Find primary image or use the first image
  const primaryImage = product.images?.find(img => img.is_primary === 1 || img.is_primary === true);
  const images = product.images || [];
  
  const getDisplayImage = () => {
    // If product has images
    if (images.length > 0) {
      // When hovering and browsing through images
      if (isHovered && images.length > 1) {
        return images[currentImageIndex].image_path;
      }
      // Default to primary image or first image
      return primaryImage?.image_path || images[0].image_path;
    }
    
    // Legacy support for products with direct image property
    if (product.image) {
      return product.image.startsWith('http') ? product.image : `${storageUrl}/${product.image}`;
    }
    
    // No image available
    return null;
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentImageIndex(0); // Reset to first/primary image when leaving
      }}
    >
      {/* Product Image */}
      <div className={`relative bg-gray-100 ${imageHeight}`}>
        {getDisplayImage() ? (
          <>
            <img 
              src={getDisplayImage()}
              alt={product.product_name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-product.png';
              }}
            />
            
            {/* Watermark/Brand Mark */}
            <div className="absolute top-0 left-0 bg-black bg-opacity-70 text-white px-2 py-1 text-xs font-medium">
              YourBrand
            </div>
            
            {/* Image carousel navigation - only show when hovering and multiple images exist */}
            {isHovered && images.length > 1 && (
              <>
                <button 
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full p-1 text-gray-800 transition-all"
                  aria-label="Previous image"
                >
                  <FiChevronLeft size={20} />
                </button>
                
                <button 
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full p-1 text-gray-800 transition-all"
                  aria-label="Next image"
                >
                  <FiChevronRight size={20} />
                </button>
                
                {/* Image counter indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                  {currentImageIndex + 1}/{images.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <FiShoppingCart size={48} />
          </div>
        )}
        
        {/* Stock indicator for inventory page */}
        {showInventoryPrice && product.stock !== undefined && (
          <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
            product.stock > 10 
              ? 'bg-green-100 text-green-800' 
              : product.stock > 0 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-red-100 text-red-800'
          }`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{product.product_name}</h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        
        {/* Show category if it's the inventory page */}
        {showInventoryPrice && product.category && (
          <p className="text-sm text-gray-500 mb-2">Category: {product.category}</p>
        )}
        
        <div className="flex justify-between items-center">
          {/* Price section - Inversed order of inventory_price and price */}
          <div>
            {/* Inventory price is now shown first when available */}
            {showInventoryPrice && product.inventory_price && (
              <div className="font-bold text-[#00796B]">
                Cost: ${parseFloat(product.inventory_price).toFixed(2)}
              </div>
            )}
            
            {/* Display price is now secondary */}
            <div className={showInventoryPrice ? "text-sm text-gray-500" : "font-bold text-[#00796B]"}>
              ${parseFloat(product.price).toFixed(2)}
              {showInventoryPrice && " (Sale Price)"}
            </div>
          </div>
          
          {isOwner ? (
            <div className="flex space-x-2">
              <button
                onClick={() => onEditProduct(product)}
                className="p-2 text-[#00796B] hover:bg-[#E0F2F1] rounded-full transition-colors"
                title="Edit product"
              >
                <FiEdit size={18} />
              </button>
              
              {/* Only show promote button if we're not on inventory page */}
              {!showInventoryPrice && onPromoteProduct && (
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
              )}
              
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
        
        {/* View Details button - added in all cases */}
        <div className="mt-3">
          <button
            onClick={() => onViewDetails(product)}
            className="w-full py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded flex items-center justify-center gap-1 transition-colors"
          >
            <FiEye size={16} /> View Details
          </button>
        </div>
        
        {/* Added date for inventory products */}
        {showInventoryPrice && (
          <div className="mt-3 text-sm text-gray-500">
            Added: {new Date(product.created_at || product.added_date).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;