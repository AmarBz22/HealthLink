import { FiShield, FiShoppingCart, FiClock, FiAward } from 'react-icons/fi';

const HeroSection = () => {
  return (
    <div className="bg-gradient-to-r from-[#00796B] to-[#004D40] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20 mb-6">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-white font-medium text-sm">Trusted Healthcare Platform</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Your One-Stop Medical Supplies Marketplace
          </h1>
          <p className="text-xl text-gray-200">
            Connect with trusted suppliers for all your healthcare needs
          </p>
        </div>
        
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="flex justify-center mb-2">
              <FiShield className="text-2xl text-white" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-white">Verified Suppliers</h3>
            <p className="text-gray-200 text-sm">Quality assurance</p>
          </div>
          <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="flex justify-center mb-2">
              <FiShoppingCart className="text-2xl text-white" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-white">1000+ Products</h3>
            <p className="text-gray-200 text-sm">All medical needs</p>
          </div>
          <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="flex justify-center mb-2">
              <FiClock className="text-2xl text-white" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-white">Fast Delivery</h3>
            <p className="text-gray-200 text-sm">Get supplies quickly</p>
          </div>
          <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="flex justify-center mb-2">
              <FiAward className="text-2xl text-white" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-white">Certified Products</h3>
            <p className="text-gray-200 text-sm">Medical grade quality</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;