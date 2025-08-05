
import React from 'react';
import { motion } from 'framer-motion';

const PerformanceCoinCard = ({ coin, rank, category }) => {
  return (
    <motion.div
      className="bg-gray-900 rounded-2xl p-4 border border-gray-800 hover:border-gigavibe-500/30 transition-all duration-300"
      whileHover={{ y: -2, boxShadow: "0 8px 32px rgba(212, 70, 239, 0.1)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
            rank <= 3 
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
              : 'bg-gray-700 text-gray-300'
          }`}>
            #{rank}
          </div>
          <div>
            <div className="font-semibold text-white">{coin.name}</div>
            <div className="text-xs text-gray-400">{coin.symbol}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gigavibe-400">{coin.marketData.price.toFixed(4)} ETH</div>
          <div className="text-xs text-gray-400">Price</div>
        </div>
      </div>
    </motion.div>
  );
};

export default PerformanceCoinCard;
