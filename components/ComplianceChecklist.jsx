'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Camera, Upload, X } from 'lucide-react';

export default function ComplianceChecklist({ 
  items = [], 
  photos = [], 
  onUpdate, 
  readOnly = false,
  serviceType = null
}) {
  const [localItems, setLocalItems] = useState(items);
  const [localPhotos, setLocalPhotos] = useState(photos || []);

  // Default checklist items based on service type
  const defaultChecklists = {
    routine: [
      'All floors swept and mopped',
      'Restrooms cleaned and sanitized',
      'Trash bins emptied',
      'High-touch surfaces disinfected',
      'Windows and glass surfaces cleaned',
      'Furniture dusted and arranged'
    ],
    rapid: [
      'Spill area contained',
      'Surface cleaned and sanitized',
      'Waste properly disposed',
      'Area ventilated',
      'Safety hazards addressed',
      'Area restored to original condition'
    ],
    deep: [
      'Steam cleaning completed',
      'High-touch areas sanitized',
      'Floor scrubbing completed',
      'Washroom deep sanitization done',
      'All equipment cleaned',
      'Area completely sanitized'
    ],
    compliance: [
      'Hygiene checklist verified',
      'All surfaces disinfected',
      'Photo documentation completed',
      'Supervisor sign-off obtained',
      'Non-compliance items addressed',
      'Audit-ready status confirmed'
    ],
    night: [
      'Silent protocols followed',
      'All areas cleaned',
      'Restocking completed',
      'Security protocols maintained',
      'Final inspection completed',
      'Area locked and secured'
    ],
  };

  const checklistItems = localItems.length > 0 
    ? localItems 
    : (defaultChecklists[serviceType] || defaultChecklists.routine).map(item => ({
        id: Date.now() + Math.random(),
        text: item,
        completed: false,
      }));

  const handleToggleItem = (itemId) => {
    if (readOnly) return;

    const updated = checklistItems.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setLocalItems(updated);
    if (onUpdate) {
      onUpdate({ items: updated, photos: localPhotos });
    }
  };

  const handlePhotoUpload = (event) => {
    if (readOnly || !event.target.files) return;

    const files = Array.from(event.target.files);
    const newPhotos = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    const updatedPhotos = [...localPhotos, ...newPhotos];
    setLocalPhotos(updatedPhotos);
    if (onUpdate) {
      onUpdate({ items: checklistItems, photos: updatedPhotos });
    }
  };

  const handleRemovePhoto = (photoId) => {
    if (readOnly) return;

    const updated = localPhotos.filter(p => p.id !== photoId);
    setLocalPhotos(updated);
    if (onUpdate) {
      onUpdate({ items: checklistItems, photos: updated });
    }
  };

  return (
    <div className="space-y-6">
      {/* Checklist Items */}
      <div className="space-y-3">
        <h3 className="text-lg font-black uppercase tracking-tight text-black mb-4">
          Compliance Checklist
        </h3>
        {checklistItems.map((item, index) => (
          <motion.div
            key={item.id || index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleToggleItem(item.id)}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
              item.completed
                ? 'bg-green-100 border-green-300 text-green-700'
                : 'bg-white border-gray-200 text-black hover:bg-gray-50 hover:border-orange-300'
            } ${readOnly ? 'cursor-default' : ''}`}
          >
            {item.completed ? (
              <CheckCircle size={24} className="text-green-600 flex-shrink-0" />
            ) : (
              <Circle size={24} className="text-gray-400 flex-shrink-0" />
            )}
            <span className={`flex-1 font-medium ${item.completed ? 'line-through opacity-75' : ''}`}>
              {item.text || item}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Photo Upload Section */}
      {!readOnly && (
        <div className="space-y-4">
          <label className="block">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-200 hover:bg-orange-50 hover:border-orange-300 transition-all cursor-pointer">
              <Camera size={20} className="text-orange-600" />
              <span className="text-sm font-bold uppercase tracking-wider text-black">
                Upload Photos for Verification
              </span>
            </div>
          </label>

          {/* Photo Preview Grid */}
          {localPhotos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {localPhotos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.url || photo}
                    alt={photo.name || 'Compliance photo'}
                    className="w-full h-32 object-cover rounded-xl border border-gray-200"
                  />
                  <button
                    onClick={() => handleRemovePhoto(photo.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Read-only photo display */}
      {readOnly && localPhotos.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-black uppercase tracking-tight text-black">
            Verification Photos
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {localPhotos.map((photo, index) => (
              <img
                key={index}
                src={photo.url || photo}
                alt={`Compliance photo ${index + 1}`}
                className="w-full h-32 object-cover rounded-xl border border-gray-200"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
