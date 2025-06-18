import { FiChevronRight, FiUsers, FiShoppingCart, FiShield } from 'react-icons/fi';

const SpecialOffersSection = ({ onViewAllClick }) => {
  const offers = [
    {
      id: 1,
      icon: FiUsers,
      title: "Free for Healthcare Professionals",
      description: "Doctors and dentists get full access forever"
    },
    {
      id: 2,
      icon: FiShoppingCart,
      title: "3 Months Free Trial",
      description: "Suppliers start with free trial period"
    },
    {
      id: 3,
      icon: FiShield,
      title: "Digital Product Partnerships",
      description: "20% commission on software collaborations"
    }
  ];

  return (
    <div className="py-12 bg-gray-50/60 backdrop-blur-sm border border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Platform Benefits
          </h2>
          
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