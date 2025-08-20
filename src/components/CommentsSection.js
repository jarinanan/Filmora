import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setComments, setRatings } from '../store/userSlice';
import { getComments, getRatings } from '../services/firebaseService';
import RatingAndCommentForm from './RatingAndCommentForm';

const CommentsSection = ({ movieId, movieTitle }) => {
    const dispatch = useDispatch();
    const { approvedRatings, comments } = useSelector(state => state.user);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // Load comments and ratings for this movie
    useEffect(() => {
        const loadData = async () => {
            try {
                const [commentsResult, ratingsResult] = await Promise.all([
                    getComments(movieId),
                    getRatings('approved')
                ]);
                
                if (commentsResult.success) {
                    dispatch(setComments(commentsResult.data));
                }
                
                if (ratingsResult.success) {
                    // Update the approved ratings in the store
                    dispatch(setRatings({
                        pending: [],
                        approved: ratingsResult.data,
                        rejected: []
                    }));
                }
            } catch (error) {
                console.error('Error loading comments and ratings:', error);
            } finally {
                setLoading(false);
            }
        };
        
        loadData();
    }, [movieId, dispatch]);
    
    // Filter ratings and comments for this specific movie
    const movieRatings = approvedRatings.filter(rating => rating.movieId === movieId);
    const movieComments = comments.filter(comment => comment.movieId === movieId);
    
    // Combine and sort by date (newest first)
    const allContent = [...movieRatings, ...movieComments].sort((a, b) => 
        new Date(b.createdAt || b.submittedAt) - new Date(a.createdAt || a.submittedAt)
    );
    
    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        
        // Handle Firebase Firestore Timestamp objects
        if (dateString && typeof dateString === 'object' && dateString.toDate) {
            return dateString.toDate().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        // Handle regular date strings
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Unknown';
        }
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const averageRating = movieRatings.length > 0 
        ? (movieRatings.reduce((sum, rating) => sum + rating.rating, 0) / movieRatings.length).toFixed(1)
        : 0;

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">Reviews & Comments</h3>
                    <div className="flex items-center mt-2">
                        <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                    key={star}
                                    className={`w-5 h-5 ${
                                        star <= averageRating ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <span className="ml-2 text-lg font-semibold text-gray-900">
                            {averageRating}/5
                        </span>
                        <span className="ml-2 text-gray-600">
                            ({movieRatings.length} reviews, {movieComments.length} comments)
                        </span>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                    Add Review/Comment
                </button>
            </div>

            {allContent.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No reviews or comments yet. Be the first to share your thoughts!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {allContent.map((item) => (
                        <div key={item.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        {/* Rating stars (only for ratings) */}
                                        {item.rating && (
                                            <div className="flex items-center space-x-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <svg
                                                        key={star}
                                                        className={`w-4 h-4 ${
                                                            star <= item.rating ? 'text-yellow-400' : 'text-gray-300'
                                                        }`}
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                                <span className="text-sm text-gray-600">({item.rating}/5)</span>
                                            </div>
                                        )}
                                        
                                        {/* Content type badge */}
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            item.rating 
                                                ? 'bg-red-100 text-red-800' 
                                                : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {item.rating ? 'Review' : 'Comment'}
                                        </span>
                                        
                                        <span className="text-sm text-gray-500">•</span>
                                        <span className="text-sm text-gray-500">{formatDate(item.createdAt || item.submittedAt)}</span>
                                    </div>
                                    
                                    <h4 className="font-semibold text-gray-900 mb-1">{item.userName}</h4>
                                    <p className="text-gray-700">{item.comment}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <RatingAndCommentForm
                    movieId={movieId}
                    movieTitle={movieTitle}
                    onClose={() => setShowForm(false)}
                />
            )}
        </div>
    );
};

export default CommentsSection;
