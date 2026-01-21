'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Car, Plus, Trash2, Edit3, Shield, 
  Info, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { Vehicle } from '@/types';

const mockVehicles: Vehicle[] = [
  {
    id: '1',
    userId: 'u1',
    make: 'Toyota',
    model: 'Land Cruiser Prado',
    color: 'Black',
    plateNumber: 'LND-922-AZ',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    userId: 'u1',
    make: 'Lexus',
    model: 'LX 570',
    color: 'Silver',
    plateNumber: 'APP-102-BY',
    createdAt: new Date().toISOString()
  }
];

export default function VehiclesPage() {
  const [vehicles] = useState<Vehicle[]>(mockVehicles);

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 uppercase tracking-tighter">My Vehicles</h1>
          <p className="text-zinc-500 font-medium text-sm">Manage the personal vehicles you want our drivers to operate.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-red-700 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-800 transition-all shadow-lg shadow-red-900/20">
          <Plus size={16} />
          Add Vehicle
        </button>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        {vehicles.map((vehicle) => (
          <motion.div
            key={vehicle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-3xl bg-white border border-zinc-200 flex flex-col justify-between group shadow-sm hover:shadow-xl transition-all"
          >
            <div className="flex justify-between items-start mb-12">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-300 group-hover:text-red-700 transition-colors">
                  <Car size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight italic">{vehicle.make} {vehicle.model}</h3>
                  <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">{vehicle.color} • {vehicle.plateNumber}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg bg-zinc-50 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors">
                  <Edit3 size={16} />
                </button>
                <button className="p-2 rounded-lg bg-zinc-50 text-zinc-400 hover:text-red-700 hover:bg-red-50 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-zinc-50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Verified for use</span>
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-200">Added {new Date(vehicle.createdAt).toLocaleDateString()}</span>
            </div>
          </motion.div>
        ))}

        {/* Empty State / Add New */}
        <button className="p-8 rounded-3xl border-2 border-dashed border-zinc-200 bg-zinc-50/30 flex flex-col items-center justify-center gap-4 text-zinc-400 hover:text-red-700 hover:border-red-700/30 hover:bg-red-50/30 transition-all group">
          <div className="w-14 h-14 rounded-full border-2 border-zinc-200 flex items-center justify-center group-hover:border-red-700 transition-colors">
            <Plus size={24} />
          </div>
          <p className="text-xs font-black uppercase tracking-widest italic">Register New Vehicle</p>
        </button>
      </div>

      {/* Info Box */}
      <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 flex gap-4">
        <Info size={20} className="text-blue-600 flex-shrink-0" />
        <div>
          <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 italic">Vehicle Verification</h4>
          <p className="text-xs text-zinc-500 leading-relaxed font-medium">All personal vehicles must be registered with valid insurance and documents before a professional driver can be assigned. Verification typically takes 2-4 hours.</p>
        </div>
      </div>
    </div>
  );
}
