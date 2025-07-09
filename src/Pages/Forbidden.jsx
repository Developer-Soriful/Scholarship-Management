import React from 'react';
import { Link } from 'react-router';

const Forbidden = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-teal-50 to-purple-100 px-4 py-10 w-full">
      <div className="bg-white shadow-2xl rounded-3xl p-10 max-w-lg w-full flex flex-col items-center border border-blue-100 hover:shadow-[0_8px_40px_0_rgba(80,80,200,0.10)] transition-all duration-300">
        <div className="flex flex-col items-center mb-6">
          <span className="inline-block px-4 py-1 rounded-full bg-blue-100 text-red-700 text-lg font-bold mb-2 border border-blue-200 shadow-sm">403 Forbidden</span>
          <svg className="w-20 h-20 text-red-400 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9zm-9 3.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>
          <h1 className="text-3xl font-extrabold text-red-700 mb-2 text-center">Access Forbidden</h1>
          <p className="text-gray-600 text-center mb-4 max-w-xs">You do not have permission to view this page or perform this action. If you believe this is a mistake, please contact support or try logging in with a different account.</p>
        </div>
        <Link to="/" className="mt-4 inline-block px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-teal-500 text-white font-bold shadow-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-200 text-lg tracking-wide">Go to Home</Link>
      </div>
    </div>
  );
};

export default Forbidden; 