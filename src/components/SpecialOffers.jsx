import { FiChevronRight, FiPercent, FiClock, FiTrendingUp } from 'react-icons/fi';

const SpecialOffersSection = ({ onViewAllClick }) => {
  const offers = [
    {
      id: 1,
      icon: FiPercent,
      title: "Bulk Discounts",
      description: "Save up to 25% on bulk orders"
    },
    {
      id: 2,
      icon: FiClock,
      title: "Flash Sales",
      description: "Limited time offers every day"
    },
    {
      id: 3,
      icon: FiTrendingUp,
      title: "New Arrivals",
      description: "Latest products just in"
    }
  ];

  return (
    <div className="py-12 bg-gray-50/60 backdrop-blur-sm border border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Special Offers
          </h2>
          <button
            onClick={onViewAllClick}
            className="flex items-center text-[#00796B] hover:text-[#00695C] font-semibold"
          >
            View All <FiChevronRight className="ml-1 h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offers.map((offer) => {
            const IconComponent = offer.icon;
            return (
              <div
                key={offer.id}
                className="bg-white rounded-xl overflow-hidden shadow-xl border border-gray-200/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                <div className="h-40 bg-[#E0F2F1] flex items-center justify-center p-4">
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <IconComponent className="text-4xl text-[#00796B]" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{offer.title}</h3>
                    <p className="text-gray-600 text-sm">{offer.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SpecialOffersSection;