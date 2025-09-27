'use client';

import { useState } from 'react';

interface ReviewFormProps {
  productId: number;
  productName: string;
}

export default function ReviewForm({ productId, productName }: ReviewFormProps) {
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewLoading(true);
    setReviewMessage(null);
    setReviewError(null);

    try {
      const res = await fetch('/.netlify/functions/api/submit-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          productName,
          reviewerName,
          reviewerEmail,
          rating,
          comment,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit review');
      }

      setReviewMessage('Thank you for your review! It will be processed shortly.');
      // Clear form
      setReviewerName('');
      setReviewerEmail('');
      setRating(5);
      setComment('');
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <section className="mt-12 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Submit a Review</h2>
      <form onSubmit={handleSubmitReview} className="space-y-4">
        {reviewMessage && <p className="text-green-600">{reviewMessage}</p>}
        {reviewError && <p className="text-red-600">{reviewError}</p>}

        <div>
          <label htmlFor="reviewerName" className="block text-sm font-medium text-gray-700">Your Name</label>
          <input
            type="text"
            id="reviewerName"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="reviewerEmail" className="block text-sm font-medium text-gray-700">Your Email</label>
          <input
            type="email"
            id="reviewerEmail"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
            value={reviewerEmail}
            onChange={(e) => setReviewerEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700">Rating</label>
          <select
            id="rating"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
            value={rating}
            onChange={(e) => setRating(parseInt(e.target.value))}
            required
          >
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Your Review</label>
          <textarea
            id="comment"
            rows={4}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          ></textarea>
        </div>

        <button
          type="submit"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={reviewLoading}
        >
          {reviewLoading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </section>
  );
}
