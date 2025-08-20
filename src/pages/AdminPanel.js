import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    approveRating,
    rejectRating,
    setRatings,
    setLoading,
    setError 
} from '../store/userSlice';
import { getRatings, updateRatingStatus, addRating } from '../services/firebaseService';
import { CheckIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserProfile } from '../services/firebaseService';

const AdminPanel = () => {
    const dispatch = useDispatch();
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const { 
        pendingRatings, 
        approvedRatings, 
        rejectedRatings, 
        loading, 
        error
    } = useSelector(state => state.user);
    
    const [activeTab, setActiveTab] = useState('pending');
    const [selectedRating, setSelectedRating] = useState(null);

    // Load data from Firebase on component mount
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            
            if (user) {
                // Get user profile to check admin status
                const profileResult = await getUserProfile(user.uid);
                if (profileResult.success) {
                    setUserProfile(profileResult.data);
                    console.log('User profile loaded:', profileResult.data);
                }
                
                dispatch(setLoading(true));
                
                try {
                    // Load all ratings from Firebase
                    const [pendingResult, approvedResult, rejectedResult] = await Promise.all([
                        getRatings('pending'),
                        getRatings('approved'),
                        getRatings('rejected')
                    ]);
                    
                    console.log('Pending ratings result:', pendingResult);
                    console.log('Approved ratings result:', approvedResult);
                    console.log('Rejected ratings result:', rejectedResult);
                    
                    dispatch(setRatings({
                        pending: pendingResult.success ? pendingResult.data : [],
                        approved: approvedResult.success ? approvedResult.data : [],
                        rejected: rejectedResult.success ? rejectedResult.data : []
                    }));
                } catch (error) {
                    console.error('Error loading ratings:', error);
                    dispatch(setError('Failed to load ratings'));
                } finally {
                    dispatch(setLoading(false));
                }
            }
        });

        return () => unsubscribe();
    }, [dispatch]);

    const handleApprove = async (ratingId) => {
        try {
            const result = await updateRatingStatus(ratingId, 'approved');
            if (result.success) {
                dispatch(approveRating(ratingId));
            } else {
                alert('Error approving rating: ' + result.error);
            }
        } catch (error) {
            console.error('Error approving rating:', error);
            alert('Error approving rating. Please try again.');
        }
    };

    const handleReject = async (ratingId) => {
        try {
            const result = await updateRatingStatus(ratingId, 'rejected');
            if (result.success) {
                dispatch(rejectRating(ratingId));
            } else {
                alert('Error rejecting rating: ' + result.error);
            }
        } catch (error) {
            console.error('Error rejecting rating:', error);
            alert('Error rejecting rating. Please try again.');
        }
    };

    const handleViewDetails = (rating) => {
        setSelectedRating(rating);
    };

    const closeModal = () => {
        setSelectedRating(null);
    };

    const getRatingsByStatus = () => {
        switch (activeTab) {
            case 'pending':
                return pendingRatings;
            case 'approved':
                return approvedRatings;
            case 'rejected':
                return rejectedRatings;
            default:
                return pendingRatings;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Show sign-in required if not logged in
    if (!currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-16 bg-neutral-900">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
                    <p className="text-gray-400 mb-6">Please sign in to access the admin panel.</p>
                </div>
            </div>
        );
    }

    // Check if user is admin
    if (!userProfile?.isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-16 bg-neutral-900">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Admin Access Required</h2>
                    <p className="text-gray-400 mb-6">You need admin privileges to access this panel.</p>
                    <p className="text-gray-500 text-sm">Current user: {userProfile?.firstName} {userProfile?.lastName}</p>
                    <p className="text-gray-500 text-sm">Admin status: {userProfile?.isAdmin ? 'Yes' : 'No'}</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-16 bg-neutral-900">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-16 bg-neutral-900">
                <div className="text-red-600 text-xl">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-900 py-8 pt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
                                <p className="mt-2 text-gray-400">Manage user ratings and reviews</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="text-sm text-gray-400">
                                    Welcome, {userProfile?.firstName} {userProfile?.lastName}!
                                </div>
                                <button
                                    onClick={async () => {
                                        // Test function to create a test rating
                                        try {
                                            const testRating = {
                                                userId: currentUser.uid,
                                                userName: 'Test User',
                                                movieId: 'test-movie-123',
                                                movieTitle: 'Test Movie',
                                                rating: 4,
                                                comment: 'This is a test rating for debugging purposes.'
                                            };
                                            const result = await addRating(testRating);
                                            if (result.success) {
                                                alert('Test rating created successfully!');
                                                // Reload the page to see the new rating
                                                window.location.reload();
                                            } else {
                                                alert('Error creating test rating: ' + result.error);
                                            }
                                        } catch (error) {
                                            alert('Error: ' + error.message);
                                        }
                                    }}
                                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                                >
                                    Create Test Rating
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-700">
                        <nav className="-mb-px flex space-x-8 px-6">
                            {[
                                { id: 'pending', name: 'Pending', count: pendingRatings.length },
                                { id: 'approved', name: 'Approved', count: approvedRatings.length },
                                { id: 'rejected', name: 'Rejected', count: rejectedRatings.length }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === tab.id
                                            ? 'border-red-600 text-red-600'
                                            : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                                    }`}
                                >
                                    {tab.name}
                                    <span className="ml-2 bg-gray-700 text-white py-0.5 px-2.5 rounded-full text-xs font-medium">
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Ratings List */}
                    <div className="px-6 py-4">
                        {getRatingsByStatus().length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-400 text-lg">No {activeTab} ratings found.</p>
                                {activeTab === 'pending' && (
                                    <p className="text-gray-500 text-sm mt-2">
                                        When users submit ratings, they will appear here for your review.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {getRatingsByStatus().map((rating) => (
                                    <div key={rating.id} className="border border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-800">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3">
                                                    <h3 className="text-lg font-semibold text-white">
                                                        {rating.movieTitle}
                                                    </h3>
                                                    <div className="flex items-center space-x-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <svg
                                                                key={i}
                                                                className={`w-4 h-4 ${
                                                                    i < rating.rating ? 'text-yellow-400' : 'text-gray-500'
                                                                }`}
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                        ))}
                                                        <span className="text-sm text-gray-400">({rating.rating}/5)</span>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    by {rating.userName} • {formatDate(rating.createdAt)}
                                                </p>
                                                <p className="text-gray-300 mt-2 line-clamp-2">{rating.comment}</p>
                                            </div>
                                            
                                            <div className="flex items-center space-x-2 ml-4">
                                                <button
                                                    onClick={() => handleViewDetails(rating)}
                                                    className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
                                                    title="View Details"
                                                >
                                                    <EyeIcon className="w-5 h-5" />
                                                </button>
                                                
                                                {activeTab === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(rating.id)}
                                                            className="p-2 text-green-500 hover:text-green-400 hover:bg-green-900 rounded-lg transition-colors"
                                                            title="Approve"
                                                        >
                                                            <CheckIcon className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(rating.id)}
                                                            className="p-2 text-red-500 hover:text-red-400 hover:bg-red-900 rounded-lg transition-colors"
                                                            title="Reject"
                                                        >
                                                            <XMarkIcon className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Rating Details Modal */}
            {selectedRating && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-white">Rating Details</h2>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-300"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{selectedRating.movieTitle}</h3>
                                    <p className="text-sm text-gray-400">Movie ID: {selectedRating.movieId}</p>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-gray-400">User: {selectedRating.userName}</p>
                                    <p className="text-sm text-gray-400">User ID: {selectedRating.userId}</p>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-400">Rating:</span>
                                    <div className="flex items-center space-x-1">
                                        {[...Array(5)].map((_, i) => (
                                            <svg
                                                key={i}
                                                className={`w-5 h-5 ${
                                                    i < selectedRating.rating ? 'text-yellow-400' : 'text-gray-500'
                                                }`}
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                        <span className="text-lg font-semibold text-white">({selectedRating.rating}/5)</span>
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className="font-semibold text-white mb-2">Comment:</h4>
                                    <p className="text-gray-300 bg-gray-700 p-3 rounded-lg">{selectedRating.comment}</p>
                                </div>
                                
                                <div className="text-sm text-gray-400">
                                    <p>Submitted: {formatDate(selectedRating.createdAt)}</p>
                                    {selectedRating.approvedAt && (
                                        <p>Approved: {formatDate(selectedRating.approvedAt)}</p>
                                    )}
                                    {selectedRating.rejectedAt && (
                                        <p>Rejected: {formatDate(selectedRating.rejectedAt)}</p>
                                    )}
                                </div>
                                
                                {activeTab === 'pending' && (
                                    <div className="flex space-x-3 pt-4">
                                        <button
                                            onClick={() => {
                                                handleApprove(selectedRating.id);
                                                closeModal();
                                            }}
                                            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            Approve Rating
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleReject(selectedRating.id);
                                                closeModal();
                                            }}
                                            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            Reject Rating
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
