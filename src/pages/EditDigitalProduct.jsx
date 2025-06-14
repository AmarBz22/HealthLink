import { useState, useEffect } from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const EditDigitalProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    logo: null,
    product_image: null,
    description: '',
    url: ''
  });
  const [logoPreview, setLogoPreview] = useState('');
  const [productImagePreview, setProductImagePreview] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Base URL for images (adjust if your storage URL differs)
  const BASE_URL = 'http://localhost:8000';

  useEffect(() => {
    const fetchProduct = async () => {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('access_token');
      if (!token) {
        setError('You must be logged in to edit products. Please log in and try again.');
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`http://localhost:8000/api/digital-products/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch product data');
        }

        const data = await response.json();
        // Normalize image URLs
        const logoUrl = data.logo 
          ? data.logo.startsWith('http') 
            ? data.logo 
            : `${BASE_URL}/storage/${data.logo.replace(/^public\//, '')}`
          : '';
        const productImageUrl = data.product_image 
          ? data.product_image.startsWith('http') 
            ? data.product_image 
            : `${BASE_URL}/storage/${data.product_image.replace(/^public\//, '')}`
          : '';

        setFormData({
          title: data.title || '',
          logo: null, // File inputs start empty
          product_image: null,
          description: data.description || '',
          url: data.url || ''
        });
        setLogoPreview(logoUrl);
        setProductImagePreview(productImageUrl);
      } catch (err) {
        setError('Failed to load product data. Please try again.');
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError(`Please select a valid image file (JPEG, PNG, GIF, or WebP) for ${name === 'logo' ? 'logo' : 'product image'}.`);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(`File size must be less than 5MB for ${name === 'logo' ? 'logo' : 'product image'}.`);
        return;
      }

      setFormData((prev) => ({ ...prev, [name]: file }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (name === 'logo') {
          setLogoPreview(e.target.result);
        } else {
          setProductImagePreview(e.target.result);
        }
      };
      reader.readAsDataURL(file);

      setError(''); // Clear any previous errors
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    const token = localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('access_token');
    if (!token) {
      setError('You must be logged in to update products. Please log in and try again.');
      setIsSubmitting(false);
      navigate('/login');
      return;
    }

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('url', formData.url);
      submitData.append('_method', 'PUT'); // Laravel expects this for PUT requests via FormData

      if (formData.logo) {
        submitData.append('logo', formData.logo);
      }

      if (formData.product_image) {
        submitData.append('product_image', formData.product_image);
      }

      const response = await fetch(`http://localhost:8000/api/digital-products/${id}`, {
        method: 'POST', // Use POST with _method=PUT for Laravel
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Product updated successfully!');
        navigate('/digital-products');
      } else {
        // Handle specific error cases
        if (response.status === 401) {
          setError('Unauthorized. Please make sure you are logged in as an admin.');
        } else if (response.status === 403) {
          setError('Access denied. Admin privileges required.');
        } else if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(', ');
          setError(errorMessages);
        } else if (data.message) {
          setError(data.message);
        } else {
          setError('Failed to update product. Please try again.');
        }
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      logo: null,
      product_image: null,
      description: '',
      url: ''
    });
    setLogoPreview('');
    setProductImagePreview('');
    setError('');
    setSuccessMessage('');
    navigate('/digital-products');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#00796B] border-t-transparent absolute top-0 left-0"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Edit Digital Product</h1>
            </div>
            <Shield className="w-8 h-8 text-[#00796B]" />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Product Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                maxLength="255"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00796B] focus:border-transparent outline-none transition-all"
                placeholder="Enter product title"
              />
            </div>

            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-2">
                Company Logo
              </label>
              <input
                type="file"
                id="logo"
                name="logo"
                onChange={handleFileChange}
                accept="image/*"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00796B] focus:border-transparent outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#00796B] file:text-white file:cursor-pointer hover:file:bg-[#00695C]"
              />
              {logoPreview && (
                <div className="mt-3">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.target.src = ''; // Clear image on error
                      setLogoPreview('');
                    }}
                  />
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">Max size: 5MB. Formats: JPEG, PNG, GIF, WebP</p>
            </div>

            <div>
              <label htmlFor="product_image" className="block text-sm font-medium text-gray-700 mb-2">
                Product Image
              </label>
              <input
                type="file"
                id="product_image"
                name="product_image"
                onChange={handleFileChange}
                accept="image/*"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00796B] focus:border-transparent outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#00796B] file:text-white file:cursor-pointer hover:file:bg-[#00695C]"
              />
              {productImagePreview && (
                <div className="mt-3">
                  <img
                    src={productImagePreview}
                    alt="Product preview"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.target.src = ''; // Clear image on error
                      setProductImagePreview('');
                    }}
                  />
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">Max size: 5MB. Formats: JPEG, PNG, GIF, WebP</p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="4"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00796B] focus:border-transparent outline-none transition-all resize-vertical"
                placeholder="Enter product description"
              />
            </div>

            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                Product URL *
              </label>
              <input
                type="url"
                id="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00796B] focus:border-transparent outline-none transition-all"
                placeholder="https://example.com/product"
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 bg-[#00796B] text-white font-semibold rounded-xl hover:bg-[#00695C] transition-all duration-200 flex items-center gap-2 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : (
                  'Update Product'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditDigitalProduct;