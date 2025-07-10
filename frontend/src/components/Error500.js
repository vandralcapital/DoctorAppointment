import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Error500 = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="text-9xl font-bold text-red-600 mb-4">500</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Server Error</h1>
          <p className="text-gray-600 mb-8">
            Something went wrong on our end. We're working to fix this issue. Please try again in a few moments.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition duration-200"
          >
            Try Again
          </button>
          
          <Link
            to="/"
            className="block w-full bg-white text-red-600 py-3 px-6 rounded-lg font-semibold border-2 border-red-600 hover:bg-red-50 transition duration-200"
          >
            Go to Homepage
          </Link>
          
          <div className="pt-4">
            <p className="text-sm text-gray-500">
              Still having issues? <Link to="/contact" className="text-red-600 hover:underline">Contact Support</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error500; 