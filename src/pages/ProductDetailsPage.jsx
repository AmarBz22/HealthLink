import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useBasket } from '../context/BasketContext';
import { 
  FiShoppingCart, 
  FiArrowLeft, 
  FiMinus, 
  FiPlus, 
  FiChevronLeft, 
  FiChevronRight,
  FiTag,
  FiPackage,
  FiInfo
} from 'react-icons/fi';

const ProductDetailsPage = () => {
  const { storeId, productId } = useParams();
  const navigate = useNavigate();
  const { addToBasket, clearBasket } = useBasket();
  
  // State
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  // Fetch product data
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
          toast.error('Please login to view this product');
          navigate('/login');
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        };

        // Fetch product details
        const productResponse = await axios.get(
          `http://localhost:8000/api/product/${productId}`, 
          { headers }
        );
        
        if (!productResponse.data) {
          throw new Error('Product not found');
        }
        
        setProduct(productResponse.data);
        
        // Fetch related products from the same category
        const category = productResponse.data.category;
        const relatedResponse = await axios.get(
          `http://localhost:8000/api/products/${storeId}?category=${encodeURIComponent(category)}`, 
          { headers }
        );
        
        // Filter out the current product from related products
        const filteredRelated = relatedResponse.data.filter(
          p => p.product_id !== parseInt(productId, 10)
        ).slice(0, 4); // Limit to 4 related products
        
        setRelatedProducts(filteredRelated);
        
      } catch (error) {
        console.error('Error loading product:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          navigate('/login');
        }
        toast.error(error.response?.data?.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId, storeId, navigate]);

  // Handle quantity changes
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (quantity < (product?.stock || 10)) {
      setQuantity(quantity + 1);
    } else {
      toast.warning(`Only ${product?.stock} items available`);
    }
  };

  // Add to cart functionality
  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        toast.error('Please login to add items to cart');
        navigate('/login');
        return;
      }
      
      // Add to basket context
      addToBasket({
        product_id: product.product_id,
        product_name: product.product_name,
        price: parseFloat(product.price),
        quantity: quantity
      });
      
      toast.success('Product added to cart successfully');
      
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add product to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  // Immediate purchase - Buy Now functionality
  const handleBuyNow = () => {
    if (!product) return;
    
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        toast.error('Please login to purchase this item');
        navigate('/login');
        return;
      }
      
      // Clear existing basket items first
      clearBasket();
      
      // Add only this product to basket
      addToBasket({
        product_id: product.product_id,
        product_name: product.product_name,
        price: parseFloat(product.price),
        quantity: quantity
      });
      
      // Navigate to checkout page
      navigate('/checkout');
      
    } catch (error) {
      console.error('Buy now error:', error);
      toast.error('Failed to process buy now request');
    }
  };

  // Image navigation
  const goToPrevImage = () => {
    if (!product?.images?.length) return;
    setCurrentImageIndex(prev => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const goToNextImage = () => {
    if (!product?.images?.length) return;
    setCurrentImageIndex(prev => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };
  
  const selectThumbnail = (index) => {
    setCurrentImageIndex(index);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00796B]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate(`/store/${storeId}`)}
            className="px-6 py-2 bg-[#00796B] text-white rounded-lg hover:bg-[#00695C] transition-colors"
          >
            <FiArrowLeft className="inline mr-2" /> Back to Store
          </button>
        </div>
      </div>
    );
  }

  // Get image to display
  const getDisplayImage = () => {
    // Use images relationship if available
    if (product.images?.length > 0) {
      return product.images[currentImageIndex].image_path;
    }
    
    // Legacy support
    if (product.image) {
      return product.image.startsWith('http') 
        ? product.image 
        : `http://localhost:8000/storage/${product.image}`;
    }
    
    // No image available
    return '/placeholder-product.png';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center mb-6 text-sm">
        <button 
          onClick={() => navigate(`/store/${storeId}`)}
          className="text-[#00796B] hover:underline flex items-center"
        >
          <FiArrowLeft className="mr-1" /> Back to Store
        </button>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-600 line-clamp-1">{product.product_name}</span>
      </div>
      
      {/* Product Details Section */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* Enhanced Image Gallery */}
          <div className="flex flex-col space-y-4">
            {/* Main Image */}
            <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-square">
              <img 
                src={getDisplayImage()}
                alt={product.product_name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-product.png';
                }}
              />
              
              {/* Image Navigation Controls - Enhanced with better visibility */}
              {product.images?.length > 1 && (
                <>
                  <button 
                    onClick={goToPrevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md text-gray-800 transition-all"
                    aria-label="Previous image"
                  >
                    <FiChevronLeft size={28} />
                  </button>
                  <button 
                    onClick={goToNextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md text-gray-800 transition-all"
                    aria-label="Next image"
                  >
                    <FiChevronRight size={28} />
                  </button>
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {product.images.length}
                  </div>
                </>
              )}
            </div>
            
            {/* Enhanced Thumbnails Gallery */}
            {product.images?.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.images.map((image, index) => (
                  <button 
                    key={index}
                    onClick={() => selectThumbnail(index)}
                    className={`aspect-square rounded-md overflow-hidden flex-shrink-0 border-2 hover:opacity-90 transition-all ${
                      currentImageIndex === index ? 'border-[#00796B] ring-2 ring-[#00796B] ring-opacity-50' : 'border-transparent'
                    }`}
                  >
                    <img 
                      src={image.image_path} 
                      alt={`${product.product_name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-product.png';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.product_name}</h1>
            
            {/* Price Section */}
            <div className="mb-6">
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-bold text-[#00796B]">
                  ${parseFloat(product.price).toFixed(2)}
                </span>
                
                {product.type === 'inventory' && product.inventory_price && (
                  <span className="text-lg text-gray-400 line-through">
                    ${parseFloat(product.inventory_price).toFixed(2)}
                  </span>
                )}
              </div>
              
              {/* Stock Status */}
              <p className="text-sm mt-2">
                {product.stock > 10 ? (
                  <span className="text-green-600">In Stock</span>
                ) : product.stock > 0 ? (
                  <span className="text-orange-500">Only {product.stock} left in stock</span>
                ) : (
                  <span className="text-red-600">Out of Stock</span>
                )}
              </p>
            </div>
            
            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
            </div>
            
            {/* Product Attributes */}
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <FiTag className="text-[#00796B] mr-2" />
                  <span className="text-gray-700">Category: </span>
                  <span className="ml-1 font-medium">{product.category}</span>
                </div>
                
                <div className="flex items-center">
                  <FiPackage className="text-[#00796B] mr-2" />
                  <span className="text-gray-700">Type: </span>
                  <span className="ml-1 font-medium capitalize">{product.type || 'New'}</span>
                </div>
              </div>
            </div>
            
            
            {/* Action Buttons - Wishlist removed */}
            <div className="flex flex-col space-y-3 mt-auto">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock <= 0}
                className={`w-full py-3 px-4 flex justify-center items-center rounded-lg ${
                  product.stock <= 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-[#00796B] hover:bg-[#00695C] text-white'
                } transition-colors shadow-sm`}
              >
                <FiShoppingCart className="mr-2" />
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              
              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className={`w-full py-3 px-4 rounded-lg ${
                  product.stock <= 0
                    ? 'bg-gray-200 border border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-[#00796B] text-[#00796B] hover:bg-[#E0F2F1]'
                } transition-colors`}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
        
        {/* Store Info Section (Optional) */}
        {product.store && (
          <div className="border-t border-gray-200 p-6">
            <div className="flex items-center">
              <FiInfo className="text-[#00796B] mr-2" />
              <p className="text-gray-600">
                Sold by <span className="font-medium">{product.store.store_name}</span>
              </p>
              
              <button 
                onClick={() => navigate(`/store/${storeId}`)}
                className="ml-auto text-[#00796B] hover:underline text-sm"
              >
                Visit Store
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Related Products</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(relatedProduct => (
              <RelatedProductCard 
                key={relatedProduct.product_id}
                product={relatedProduct}
                storeId={storeId}
                navigate={navigate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Related Product Card Component
const RelatedProductCard = ({ product, storeId, navigate }) => {
  // Find primary image or use the first image
  const primaryImage = product.images?.find(img => img.is_primary === 1 || img.is_primary === true);
  const displayImage = primaryImage?.image_path || 
                       (product.images?.length > 0 ? product.images[0].image_path : null) ||
                       (product.image || '/placeholder-product.png');
                       
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/store/${storeId}/product/${product.product_id}`)}
    >
      {/* Product Image */}
      <div className="h-40 bg-gray-100">
        <img 
          src={displayImage}
          alt={product.product_name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/placeholder-product.png';
          }}
        />
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-gray-900 font-medium mb-1 line-clamp-1">{product.product_name}</h3>
        <p className="text-[#00796B] font-bold">${parseFloat(product.price).toFixed(2)}</p>
      </div>
    </div>
  );
};

export default ProductDetailsPage;