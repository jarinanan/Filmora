import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addRating, addComment } from '../store/userSlice';
import { addRating as addFirebaseRating, addComment as addFirebaseComment } from '../services/firebaseService';
import { auth } from '../firebase/config';

const RatingAndCommentForm = ({ movieId, movieTitle, onClose }) => {
    const dispatch = useDispatch();
    const { userProfile } = useSelector(state => state.user);
    const currentUser = auth.currentUser;
    
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hoveredRating, setHoveredRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formType, setFormType] = useState('rating'); // 'rating' or 'comment'

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!currentUser) {
            alert('Please sign in to submit content');
            return;
        }

        if (formType === 'rating' && rating === 0) {
            alert('Please select a rating');
            return;
        }

        if (!comment.trim()) {
            alert('Please add a comment');
            return;
        }

        setIsSubmitting(true);

        try {
            if (formType === 'rating') {
                // Submit rating (requires admin approval)
                const ratingData = {
                    userId: currentUser.uid,
                    userName: userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName}` : currentUser.email || 'Anonymous',
                    movieId: movieId,
                    movieTitle: movieTitle,
                    rating: rating,
                    comment: comment.trim()
                };
                
                const result = await addFirebaseRating(ratingData);
                if (result.success) {
                    dispatch(addRating({ ...ratingData, id: result.id }));
                    alert('Your rating has been submitted and is pending admin approval!');
                } else {
                    alert('Error submitting rating: ' + result.error);
                }
            } else {
                // Submit comment (auto-approved)
                const commentData = {
                    userId: currentUser.uid,
                    userName: userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName}` : currentUser.email || 'Anonymous',
                    movieId: movieId,
                    movieTitle: movieTitle,
                    comment: comment.trim()
                };
                
                const result = await addFirebaseComment(commentData);
                if (result.success) {
                    dispatch(addComment({ ...commentData, id: result.id }));
                    alert('Your comment has been posted!');
                } else {
                    alert('Error submitting comment: ' + result.error);
                }
            }
            
            setIsSubmitting(false);
            onClose();
        } catch (error) {
            setIsSubmitting(false);
            alert('Error submitting content. Please try again.');
        }
    };

    const handleStarClick = (starRating) => {
        setRating(starRating);
    };

    const handleStarHover = (starRating) => {
        setHoveredRating(starRating);
    };

    const handleStarLeave = () => {
        setHoveredRating(0);
    };

    if (!currentUser) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-md w-full p-6">
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Sign In Required</h2>
                        <p className="text-gray-600 mb-6">You need to sign in to submit ratings and comments.</p>
                        <button
                            onClick={onClose}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                        {formType === 'rating' ? 'Rate This Movie' : 'Add Comment'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{movieTitle}</h3>
                    <p className="text-sm text-gray-600">
                        Posting as: {userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName}` : currentUser.email}
                    </p>
                </div>

                {/* Form Type Toggle */}
                <div className="mb-4">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            type="button"
                            onClick={() => setFormType('rating')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                formType === 'rating'
                                    ? 'bg-red-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Rate & Review
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormType('comment')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                formType === 'comment'
                                    ? 'bg-red-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Comment Only
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Rating Stars (only for rating form) */}
                    {formType === 'rating' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Rating
                            </label>
                            <div className="flex items-center space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => handleStarClick(star)}
                                        onMouseEnter={() => handleStarHover(star)}
                                        onMouseLeave={handleStarLeave}
                                        className="focus:outline-none"
                                    >
                                        <svg
                                            className={`w-8 h-8 ${
                                                star <= (hoveredRating || rating) ? 'text-yellow-400' : 'text-gray-300'
                                            }`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </button>
                                ))}
                                <span className="ml-2 text-sm text-gray-600">
                                    {rating > 0 ? `${rating}/5` : 'Select rating'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Comment */}
                    <div>
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                            {formType === 'rating' ? 'Your Review' : 'Your Comment'}
                        </label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-gray-900 bg-white placeholder-gray-500"
                            placeholder={formType === 'rating' ? 'Share your thoughts about this movie...' : 'Add your comment...'}
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting || (formType === 'rating' && rating === 0) || !comment.trim()}
                        >
                            {isSubmitting ? 'Submitting...' : (formType === 'rating' ? 'Submit Rating' : 'Post Comment')}
                        </button>
                    </div>
                </form>

                {/* Info Message */}
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">
                        {formType === 'rating' ? (
                            <>
                                <strong>Note:</strong> Ratings require admin approval before being published.
                            </>
                        ) : (
                            <>
                                <strong>Note:</strong> Comments are posted immediately and visible to all users.
                            </>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RatingAndCommentForm;
