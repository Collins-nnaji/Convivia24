import React, { createContext, useContext, useEffect, useState } from 'react';

const RewardsContext = createContext(null);

export const RewardsProvider = ({ children }) => {
  const [points, setPoints] = useState(() => {
    const saved = localStorage.getItem('rewards_points');
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem('rewards_points', String(points));
  }, [points]);

  const addPoints = (value) => setPoints((p) => p + value);
  const resetPoints = () => setPoints(0);

  return (
    <RewardsContext.Provider value={{ points, addPoints, resetPoints }}>
      {children}
    </RewardsContext.Provider>
  );
};

export const useRewards = () => {
  const ctx = useContext(RewardsContext);
  if (!ctx) throw new Error('useRewards must be used within RewardsProvider');
  return ctx;
};


