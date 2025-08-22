import React from 'react';
import { Crown, Lock, Sparkles } from 'lucide-react';
import { useLoyalty } from '../context/LoyaltyContext';
import { drinksDatabase } from '../data/drinksDatabase';
import SimpleDrinkCard from './SimpleDrinkCard';

const VIPDrops = () => {
  const { loyaltyData } = useLoyalty();
  const isGold = loyaltyData?.tier?.id === 'gold';
  const vipPicks = drinksDatabase.filter(d => d.price >= 150000).slice(0, 6);

  return (
    <div>
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 font-semibold mb-3">
          <Crown size={16} /> VIP Exclusive
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Limited Drops for Gold Members</h2>
        <p className="text-gray-600 mt-2">Priority access to rare and premium bottles</p>
      </div>

      {!isGold ? (
        <div className="bg-gray-50 border rounded-2xl p-8 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-700 font-medium">
            <Lock size={18} /> Available for Gold members only
          </div>
          <p className="text-gray-500 mt-2">Earn points and upgrade to unlock VIP perks and early access.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vipPicks.map((drink) => (
            <SimpleDrinkCard key={drink.id} drink={drink} onAddToCart={() => {}} />
          ))}
          {vipPicks.length === 0 && (
            <div className="col-span-full text-center text-gray-600">No VIP bottles available yet. Check back soon.</div>
          )}
        </div>
      )}

      <div className="mt-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-800 font-medium">
          <Sparkles size={16} /> New drops monthly
        </div>
      </div>
    </div>
  );
};

export default VIPDrops;
