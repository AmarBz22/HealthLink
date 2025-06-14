const GettingStartedSection = ({ onCreateAccountClick }) => {
    const steps = [
      {
        id: 1,
        number: "1",
        title: "Create an Account",
        description: "Sign up for free and complete your profile to get started"
      },
      {
        id: 2,
        number: "2",
        title: "Find Products",
        description: "Browse categories or search for specific medical supplies"
      },
      {
        id: 3,
        number: "3",
        title: "Order & Receive",
        description: "Place orders and get your medical supplies delivered"
      }
    ];
  
    return (
      <div className="py-12 bg-[#E0F2F1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              How to Get Started
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join our medical marketplace in just a few simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.id} className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="w-16 h-16 bg-[#B2DFDB] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-[#00796B]">{step.number}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <button
              onClick={onCreateAccountClick}
              className="px-6 py-3 bg-[#00796B] text-white rounded-lg hover:bg-[#00695C] transition-colors shadow-md text-lg font-medium"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default GettingStartedSection;