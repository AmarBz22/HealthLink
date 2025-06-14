const LoadingSpinner = ({ size = "h-12 w-12", className = "" }) => {
    return (
      <div className={`flex justify-center items-center h-screen ${className}`}>
        <div className={`animate-spin rounded-full ${size} border-t-2 border-b-2 border-[#00796B]`}></div>
      </div>
    );
  };
  
  export default LoadingSpinner;