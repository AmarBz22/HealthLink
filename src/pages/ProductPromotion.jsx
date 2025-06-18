import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPercent, FiTag, FiPackage } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProductPromotionPage = () => {
  const { storeId, productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    discount_percentage: 10,
    stock_quantity: 1
  });

  // Fetch product details
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        };

        const productResponse = await axios.get(
          `http://192.168.43.101:8000/api/products/${productId}`, 
          { headers }
        );

        setProduct(productResponse.data);
        // Initialize with max available stock
        setFormData(prev => ({
          ...prev,
          stock_quantity: productResponse.data.stock
        }));
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error(error.response?.data?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await axios.post(
        `http://192.168.43.101:8000/api/products/${productId}/apply-discount`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      toast.success(response.data.message || 'Discount applied successfully!');
      navigate(`/store/${storeId}`);
    } catch (error) {
      console.error('Discount error:', error);
      toast.error(error.response?.data?.message || 'Failed to apply discount');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading && !product) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00796B]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-semibold text-gray-800">Product not found</h2>
        <button 
          onClick={() => navigate(`/store/${storeId}`)}
          className="mt-4 px-4 py-2 bg-[#00796B] text-white rounded-lg hover:bg-[#00695C] transition-colors"
        >
          Back to Store
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-[#00796B] p-4 text-white flex items-center justify-between">
          <button 
            onClick={() => navigate(`/store/${storeId}`)}
            className="flex items-center hover:underline"
          >
            <FiArrowLeft className="mr-2" /> Back to Store
          </button>
          <h2 className="text-xl font-bold flex items-center">
            <FiTag className="mr-2" /> Create Discount
          </h2>
          <div className="w-6"></div>
        </div>

        {/* Product Info */}
        <div className="p-6 border-b">
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {product.image_path ? (
                <img 
                  src={`http://192.168.43.101:8000/storage/${product.image_path}`} 
                  alt={product.product_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FiPackage className="text-gray-400 text-2xl" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{product.product_name}</h3>
              <p className="text-gray-600">Current Price: ${product.price}</p>
              <p className="text-gray-600">Available Stock: {product.stock}</p>
            </div>
          </div>
        </div>

        {/* Discount Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Discount Percentage */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <FiPercent className="mr-2 text-[#00796B]" />
              Discount Percentage
            </label>
            
            <div className="flex items-center gap-4">
              <input
                type="range"
                name="discount_percentage"
                min="5"
                max="70"
                step="5"
                value={formData.discount_percentage}
                onChange={handleChange}
                className="flex-1"
              />
              <span className="w-16 text-center font-medium bg-gray-100 py-1 rounded">
                {formData.discount_percentage}%
              </span>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm font-medium">
                Discounted Price: <span className="text-[#00796B]">
                  ${(product.price * (1 - formData.discount_percentage/100))}
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Original Price: ${product.price}
              </p>
            </div>
          </div>

          {/* Stock Quantity */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Quantity to Move to Discount Store
            </label>
            <input
              type="number"
              name="stock_quantity"
              min="1"
              max={product.stock}
              value={formData.stock_quantity}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            />
            <p className="text-xs text-gray-500">
              Available: {product.stock} units (Max: {product.stock})
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 bg-[#00796B] text-white rounded-md hover:bg-[#00695C] transition-colors ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Applying...' : 'Apply Discount & Move Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductPromotionPage;