import React, { useEffect, useState } from 'react';

const AgeGate = ({ children }) => {
  const [verified, setVerified] = useState(() => localStorage.getItem('age_verified') === 'true');
  const [dob, setDob] = useState('');

  useEffect(() => {
    if (verified) localStorage.setItem('age_verified', 'true');
  }, [verified]);

  const handleVerify = (e) => {
    e.preventDefault();
    if (!dob) return;
    const age = calcAge(dob);
    if (age >= 18) setVerified(true);
    else alert('You must be 18+ to continue.');
  };

  const calcAge = (dateString) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  if (verified) return children;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full border border-white/20">
        <h1 className="text-2xl font-bold mb-2">Age Verification</h1>
        <p className="text-white/80 mb-6 text-sm">Please confirm your age to access wines & spirits.</p>
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm text-white/80 mb-2">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg py-3"
          >
            Verify & Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default AgeGate;


