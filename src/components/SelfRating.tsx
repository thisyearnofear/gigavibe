'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface SelfRatingProps {
  onRatingSubmit: (rating: number, confidence: string) => void;
  challengeTitle: string;
}

export default function SelfRating({ onRatingSubmit, challengeTitle }: SelfRatingProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [confidence, setConfidence] = useState('');

  const confidenceOptions = [
    { id: 'modest', label: 'Pretty good, I think', emoji: '😊' },
    { id: 'confident', label: 'Nailed it completely', emoji: '😎' },
    { id: 'unsure', label: 'Honestly not sure', emoji: '🤷‍♀️' },
    { id: 'showoff', label: 'I should go pro', emoji: '🎤' }
  ];

  const getRatingText = (stars: number) => {
    switch (stars) {
      case 1: return "Needs work";
      case 2: return "Getting there";
      case 3: return "Not bad";
      case 4: return "Pretty good";
      case 5: return "Absolutely nailed it";
      default: return "How did you do?";
    }
  };

  const handleSubmit = () => {
    if (rating > 0 && confidence) {
      onRatingSubmit(rating, confidence);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center p-6">
      <motion.div
        className="w-full max-w-md text-center text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="mb-8"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold mb-4">
            How did you do?
          </h1>
          <p className="text-lg text-gray-300 mb-2">
            Rate your {challengeTitle} performance
          </p>
          <p className="text-sm text-gray-400">
            (Be honest... or don't, we'll find out soon enough)
          </p>
        </motion.div>

        {/* Star Rating */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-2"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Star
                  className={`w-8 h-8 transition-colors duration-200 ${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-600'
                  }`}
                />
              </motion.button>
            ))}
          </div>
          
          <motion.p
            className="text-xl font-semibold"
            key={hoveredRating || rating}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {getRatingText(hoveredRating || rating)}
          </motion.p>
        </motion.div>

        {/* Confidence Level */}
        {rating > 0 && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h3 className="text-lg font-semibold mb-4">How confident are you?</h3>
            <div className="space-y-3">
              {confidenceOptions.map((option) => (
                <motion.button
                  key={option.id}
                  onClick={() => setConfidence(option.id)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 ${
                    confidence === option.id
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl">{option.emoji}</span>
                    <span className="font-medium">{option.label}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        {rating > 0 && confidence && (
          <motion.button
            onClick={handleSubmit}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-semibold text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Submit My Rating
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}