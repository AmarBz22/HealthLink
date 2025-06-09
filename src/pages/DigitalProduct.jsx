import { useState } from 'react';
import { 
  FiPlay, 
  FiExternalLink, 
  FiStar,
  FiShield,
  FiCpu,
  FiCloud,
  FiActivity,
  FiUsers,
  FiCheck,
  FiArrowRight,
  FiLink,
  FiCopy
} from 'react-icons/fi';

const DigitalProductPage = () => {

  const [showUrlModal, setShowUrlModal] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState('');

  // Product data
  const product = {
    name: "AI Clinic",
    company: "Insyeb | Tech Beyond Limits",
    tagline: "24/7 Virtual Assistant for Medical Appointment Scheduling",
    description: "Streamline medical appointment scheduling through natural, conversational interactions - like having a digital receptionist that never sleeps.",
    image: "/api/placeholder/600/400",
    rating: 4.8,
    reviews: 89,
    price: "Custom",
    type: "subscription",
    demoUrl: "https://www.insyeb.com/products/ai-clinic",
    productUrl: "https://www.insyeb.com/products/ai-clinic",
    docsUrl: "https://www.insyeb.com/docs",
    supportUrl: "https://www.insyeb.com/support",
    
    features: [
      "Natural conversation interface",
      "Smart appointment finder",
      "Healthcare knowledge base",
      "Symptom-to-specialist guidance",
      "24/7 availability",
      "Calendar system integration",
      "Automatic appointment reminders",
      "Multi-device accessibility"
    ],
    
    benefits: [
      {
        icon: <FiUsers />,
        title: "Reduce Phone Calls by 70%",
        description: "Free up your staff time for critical tasks while patients book appointments through natural conversations."
      },
      {
        icon: <FiCpu />,
        title: "Smart Appointment Matching",
        description: "AI intelligently suggests optimal appointment times based on doctor availability and patient preferences."
      },
      {
        icon: <FiActivity />,
        title: "24/7 Patient Access",
        description: "Patients can book appointments anytime, avoiding phone tag and waiting on hold during busy hours."
      },
      {
        icon: <FiShield />,
        title: "Easy Integration",
        description: "Compatible with existing calendar systems, minimal setup required with no new hardware needed."
      }
    ],
    
    specifications: {
      "Platform": "Web-based virtual assistant",
      "Deployment": "Cloud-hosted, browser accessible",
      "Integration": "Compatible with existing calendars",
      "Setup": "Minimal configuration required",
      "Access": "Any device with web browser",
      "Support": "Personalized demo available"
    }
  };

  const handleDemoClick = () => {
    window.open(product.demoUrl, '_blank');
  };

  const handleContactSales = () => {
    console.log('Contact sales clicked');
  };

  const handleUrlClick = (url) => {
    window.open(url, '_blank');
  };

  const copyToClipboard = (url, type) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(type);
      setTimeout(() => setCopiedUrl(''), 2000);
    });
  };

  const urls = [
    { label: "Live Demo", url: product.demoUrl, type: "demo", icon: <FiPlay /> },
    { label: "Product Page", url: product.productUrl, type: "product", icon: <FiExternalLink /> },
    { label: "Documentation", url: product.docsUrl, type: "docs", icon: <FiCheck /> },
    { label: "Support Center", url: product.supportUrl, type: "support", icon: <FiUsers /> }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#00796B] to-[#004D40] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">I</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Insyeb</h1>
                <p className="text-sm text-gray-600">Tech Beyond Limits</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowUrlModal(true)}
                className="border border-[#00796B] text-[#00796B] px-4 py-2 rounded-lg hover:bg-[#00796B] hover:text-white transition-colors flex items-center gap-2"
              >
                <FiLink />
                URLs
              </button>
              <button
                onClick={handleContactSales}
                className="bg-[#00796B] text-white px-6 py-2 rounded-lg hover:bg-[#00695C] transition-colors"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Hero */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Product Info */}
            <div>
              <div className="mb-4">
                <span className="bg-[#B2DFDB] text-[#00796B] px-3 py-1 rounded-full text-sm font-medium">
                  Virtual Medical Assistant
                </span>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              
              <p className="text-xl text-gray-600 mb-4">
                {product.tagline}
              </p>
              
              {/* Compact Description */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Rating & Price */}
              <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} className="text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-gray-700 font-medium">{product.rating}</span>
                  <span className="text-gray-500">({product.reviews} reviews)</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-[#00796B]">{product.price}</span>
                  <span className="text-gray-500">pricing</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleDemoClick}
                  className="bg-[#00796B] text-white px-8 py-3 rounded-lg hover:bg-[#00695C] transition-colors flex items-center gap-2"
                >
                  <FiPlay />
                  Schedule Demo
                </button>
                <button
                  onClick={handleContactSales}
                  className="border-2 border-[#00796B] text-[#00796B] px-8 py-3 rounded-lg hover:bg-[#00796B] hover:text-white transition-colors flex items-center gap-2"
                >
                  Get Started
                  <FiArrowRight />
                </button>
              </div>
            </div>

            {/* Product Image */}
            <div className="relative">
              <div className="bg-gradient-to-br from-[#B2DFDB] to-[#00796B] rounded-2xl p-8">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
              {/* Floating feature badges */}
              <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3">
                <div className="flex items-center gap-2">
                  <FiActivity className="text-[#00796B]" />
                  <span className="text-sm font-medium">24/7 Available</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-3">
                <div className="flex items-center gap-2">
                  <FiUsers className="text-[#00796B]" />
                  <span className="text-sm font-medium">Reduces Calls 70%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* URL Modal */}
      {showUrlModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Product URLs</h3>
              <button
                onClick={() => setShowUrlModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              {urls.map((item) => (
                <div key={item.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-[#00796B]">{item.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{item.label}</p>
                      <p className="text-xs text-gray-500 truncate max-w-48">{item.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(item.url, item.type)}
                      className="p-2 text-gray-400 hover:text-[#00796B] transition-colors"
                      title="Copy URL"
                    >
                      {copiedUrl === item.type ? (
                        <FiCheck className="text-green-500" />
                      ) : (
                        <FiCopy />
                      )}
                    </button>
                    <button
                      onClick={() => handleUrlClick(item.url)}
                      className="p-2 text-gray-400 hover:text-[#00796B] transition-colors"
                      title="Open URL"
                    >
                      <FiExternalLink />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default DigitalProductPage;