import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, Calendar, MapPin, ThumbsUp, 
  ThumbsDown, MessageSquare, UserX, CalendarCheck,
  AlertCircle
} from 'lucide-react';

const ConnectionsList = ({ 
  type = 'connections', // 'connections', 'requests', or 'pending'
  items = [] 
}) => {
  if (items.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200"
      >
        <div className="flex flex-col items-center justify-center">
          <motion.div 
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, type === 'connections' ? -10 : type === 'requests' ? 10 : 0, 0]
            }}
            transition={{ repeat: Infinity, repeatDelay: 3, duration: 1 }}
            className="mb-4 w-16 h-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full flex items-center justify-center shadow-sm"
          >
            {type === 'connections' && <UserX size={24} className="text-blue-500" />}
            {type === 'requests' && <AlertCircle size={24} className="text-blue-500" />}
            {type === 'pending' && <Clock size={24} className="text-blue-500" />}
          </motion.div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {type === 'connections' ? 'No connections yet' : 
             type === 'requests' ? 'No connection requests' : 
             'No pending requests'}
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            {type === 'connections' ? 'Connect with people to see them here' : 
             type === 'requests' ? 'When someone wants to connect, they\'ll appear here' : 
             'You haven\'t sent any connection requests yet'}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {items.map((item, index) => {
        if (type === 'connections') {
          return (
            <motion.div 
              key={item.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ConnectionItem connection={item} />
            </motion.div>
          );
        } else if (type === 'requests') {
          return (
            <motion.div 
              key={item.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <RequestItem request={item} />
            </motion.div>
          );
        } else {
          return (
            <motion.div 
              key={item.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PendingItem pending={item} />
            </motion.div>
          );
        }
      })}
    </motion.div>
  );
};

const ConnectionItem = ({ connection }) => {
  return (
    <motion.div 
      whileHover={{ y: -3 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-300"
    >
      <div className="p-4 flex items-center">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold"
        >
          {connection.name.charAt(0)}
        </motion.div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-medium text-gray-900">{connection.name}</h3>
          <p className="text-sm text-gray-500">Connected since {connection.date}</p>
        </div>
        <div className="flex space-x-2">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
          >
            <MessageSquare size={18} className="text-blue-500" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
          >
            <CalendarCheck size={18} className="text-blue-500" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 bg-gray-100 hover:bg-red-100 text-gray-700 rounded-full transition-colors"
          >
            <UserX size={18} className="text-red-500" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const RequestItem = ({ request }) => {
  return (
    <motion.div 
      whileHover={{ y: -3 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-300"
    >
      <div className="p-4">
        <div className="flex items-center mb-3">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold"
          >
            {request.name.charAt(0)}
          </motion.div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-medium text-gray-900">{request.name}</h3>
            <p className="text-sm text-gray-500 flex items-center">
              <Clock size={14} className="inline mr-1 text-blue-500" />
              Received {request.timeAgo}
            </p>
          </div>
        </div>
        
        <p className="text-sm text-gray-700 mb-4 px-3 py-2 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200">
          {request.message}
        </p>
        
        {request.meetup && (
          <div className="mb-4 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 text-sm">
            <p className="text-gray-700 mb-1 font-medium">Suggested meetup:</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center text-gray-600">
                <MapPin size={14} className="mr-1 flex-shrink-0 text-blue-500" />
                <span>{request.meetup.location}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar size={14} className="mr-1 flex-shrink-0 text-blue-500" />
                <span>{request.meetup.date}</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end gap-2">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center border border-gray-200"
          >
            <ThumbsDown size={16} className="mr-2 text-red-500" />
            Decline
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-colors flex items-center shadow-sm"
          >
            <ThumbsUp size={16} className="mr-2" />
            Accept
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const PendingItem = ({ pending }) => {
  return (
    <motion.div 
      whileHover={{ y: -3 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-300"
    >
      <div className="p-4">
        <div className="flex items-center mb-3">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold"
          >
            {pending.name.charAt(0)}
          </motion.div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-medium text-gray-900">{pending.name}</h3>
            <p className="text-sm text-gray-500 flex items-center">
              <Clock size={14} className="inline mr-1 text-blue-500" />
              Sent {pending.timeAgo}
            </p>
          </div>
          <motion.div 
            animate={{ y: [0, -2, 0] }} 
            transition={{ repeat: Infinity, repeatDelay: 2, duration: 0.5 }}
            className="px-2 py-1 bg-amber-100 text-amber-600 rounded-md text-xs font-medium border border-amber-200"
          >
            Pending
          </motion.div>
        </div>
        
        <p className="text-sm text-gray-700 mb-4 px-3 py-2 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200">
          {pending.message}
        </p>
        
        {pending.meetup && (
          <div className="mb-4 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 text-sm">
            <p className="text-gray-700 mb-1 font-medium">You suggested a meetup:</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center text-gray-600">
                <MapPin size={14} className="mr-1 flex-shrink-0 text-blue-500" />
                <span>{pending.meetup.location}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar size={14} className="mr-1 flex-shrink-0 text-blue-500" />
                <span>{pending.meetup.date}</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors border border-gray-200"
          >
            Cancel Request
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ConnectionsList; 