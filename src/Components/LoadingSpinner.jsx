import React from "react";

const LoadingSpinner = () => (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
            <p className="mt-6 text-gray-600 font-medium">Loading top scholarships...</p>
        </div>
    </div>
);

export default LoadingSpinner; 