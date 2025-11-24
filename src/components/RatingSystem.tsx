'use client';
import { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

interface RatingSystemProps {
  videoKey: string;
  initialRating?: number;
  initialLikes?: number;
  initialDislikes?: number;
  onRate: (rating: number) => void;
  onLike: () => void;
  onDislike: () => void;
  onReview: (review: string) => void;
}

export function RatingSystem({ 
  videoKey, 
  initialRating = 0, 
  initialLikes = 0, 
  initialDislikes = 0,
  onRate, 
  onLike, 
  onDislike, 
  onReview 
}: RatingSystemProps) {
  const [rating, setRating] = useState(initialRating);
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewText, setReviewText] = useState('');

  const handleRate = (newRating: number) => {
    setRating(newRating);
    onRate(newRating);
  };

  const handleLike = () => {
    setLikes(prev => prev + 1);
    onLike();
  };

  const handleDislike = () => {
    setDislikes(prev => prev + 1);
    onDislike();
  };

  const handleReviewSubmit = () => {
    if (reviewText.trim()) {
      onReview(reviewText);
      setReviewText('');
      setIsReviewOpen(false);
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 space-y-6">
      {/* Star Rating */}
      <div>
        <h3 className="text-white font-semibold mb-3">Rate this content</h3>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRate(star)}
              className="text-2xl transition-all hover:scale-110"
            >
              <Star
                className={star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-400'}
                size={24}
              />
            </button>
          ))}
          <span className="ml-2 text-gray-300 text-sm">
            ({rating}/5)
          </span>
        </div>
      </div>

      {/* Like/Dislike System */}
      <div>
        <h3 className="text-white font-semibold mb-3">Your reaction</h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            className="flex items-center space-x-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 px-4 py-2 rounded-lg transition-colors"
          >
            <ThumbsUp size={18} />
            <span>{likes}</span>
          </button>
          
          <button
            onClick={handleDislike}
            className="flex items-center space-x-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-lg transition-colors"
          >
            <ThumbsDown size={18} />
            <span>{dislikes}</span>
          </button>

          <button
            onClick={() => setIsReviewOpen(!isReviewOpen)}
            className="flex items-center space-x-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-2 rounded-lg transition-colors"
          >
            <MessageSquare size={18} />
            <span>Write Review</span>
          </button>
        </div>
      </div>

      {/* Review System */}
      <AnimatePresence>
        {isReviewOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-4 border-t border-gray-700"
          >
            <h4 className="text-white font-semibold mb-3">Write a Review</h4>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your thoughts about this content..."
              className="w-full bg-gray-700/50 border border-gray-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
              rows={4}
            />
            <div className="flex justify-end space-x-3 mt-3">
              <button
                onClick={() => setIsReviewOpen(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmit}
                disabled={!reviewText.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors"
              >
                Submit Review
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rating Summary */}
      <div className="pt-4 border-t border-gray-700">
        <h4 className="text-white font-semibold mb-2">Community Rating</h4>
        <div className="flex items-center space-x-4 text-sm text-gray-300">
          <div className="flex items-center space-x-1">
            <Star className="text-yellow-400 fill-current" size={16} />
            <span>4.2/5 (1.2k ratings)</span>
          </div>
          <div className="flex items-center space-x-1">
            <ThumbsUp className="text-green-400" size={16} />
            <span>89% liked this</span>
          </div>
        </div>
      </div>
    </div>
  );
}
