import React, { useState } from 'react';
import { FiStar, FiX, FiPackage, FiCheck } from 'react-icons/fi';

const ProductRatingModal = ({ 
  order, 
  isOpen, 
  onClose, 
  onSubmitRatings 
}) => {
  const [ratings, setRatings] = useState({});
  const [reviews, setReviews] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const handleRatingChange = (productId, rating) => {
    setRatings(prev => ({
      ...prev,
      [productId]: rating
    }));
  };

  const handleReviewChange = (productId, review) => {
    setReviews(prev => ({
      ...prev,
      [productId]: review
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Prepare ratings data - submit each product rating individually
    const ratingsData = order.items.map(item => {
      const productId = item.product?.product_id || item.product_id;
      return {
        product_id: productId,
        rating: ratings[productId] || 5, // Default to 5 stars if not rated
        review: reviews[productId] || '',
      };
    }).filter(rating => rating.product_id); // Filter out items without product_id

    try {
      await onSubmitRatings(ratingsData);
      onClose();
    } catch (error) {
      console.error('Error submitting ratings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ rating, onRatingChange, productId }) => {
    const [hoverRating, setHoverRating] = useState(0);

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`text-2xl transition-colors ${
              star <= (hoverRating || rating)
                ? 'text-yellow-400'
                : 'text-gray-300'
            } hover:text-yellow-400`}
            onClick={() => onRatingChange(productId, star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
          >
            <FiStar fill={star <= (hoverRating || rating) ? 'currentColor' : 'none'} />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating || hoverRating ? `${rating || hoverRating} star${(rating || hoverRating) !== 1 ? 's' : ''}` : 'Rate this product'}
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      <div className="bg-white backdrop-blur-sm rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <FiPackage className="text-green-600 text-xl mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Order Delivered Successfully!
              </h2>
              <p className="text-sm text-gray-600">
                Please rate the products from Order #{order.product_order_id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-6">
            {order.items && order.items.map((item, index) => {
              const productId = item.product?.product_id || item.product_id || `item-${index}`;
              const productName = item.product_name || item.product?.product_name || 'Unnamed Product';
              const productPrice = item.price || item.product?.price || 0;

              return (
                <div key={productId} className="border border-gray-200 rounded-lg p-4">
                  {/* Product Info */}
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      <FiPackage className="text-gray-500" />
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="font-medium text-gray-800">{productName}</h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <span>Qty: {item.quantity || 1}</span>
                        <span className="mx-2">•</span>
                        <span>${(productPrice * (item.quantity || 1)).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rate this product:
                    </label>
                    <StarRating
                      rating={ratings[productId] || 0}
                      onRatingChange={handleRatingChange}
                      productId={productId}
                    />
                  </div>

                  {/* Review */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Write a review (optional):
                    </label>
                    <textarea
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Share your experience with this product..."
                      value={reviews[productId] || ''}
                      onChange={(e) => handleReviewChange(productId, e.target.value)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            <FiCheck className="inline mr-1 text-green-600" />
            Your order has been marked as delivered
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Skip Rating
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <FiCheck className="mr-2" />
                  Submit Ratings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductRatingModal;