import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromWatchlist, setWatchlist } from '../store/userSlice';
import { removeFromWatchlist as removeFromFirebaseWatchlist, getWatchlist } from '../services/firebaseService';
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { useSelector as useReduxSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { TrashIcon } from '@heroicons/react/24/outline';
import Card from '../components/Card';

const WatchlistPage = () => {
    const dispatch = useDispatch();
    const [currentUser, setCurrentUser] = useState(null);
    const { watchlist } = useSelector(state => state.user);
    const imageURL = useReduxSelector(state => state.movieoData.imageURL);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            
            if (user) {
                console.log('Loading watchlist for user:', user.uid);
                // Load user's watchlist from Firebase
                const result = await getWatchlist(user.uid);
                console.log('Watchlist result:', result);
                if (result.success) {
                    console.log('Watchlist data:', result.data);
                    dispatch(setWatchlist(result.data));
                } else {
                    console.error('Error loading watchlist:', result.error);
                }
            } else {
                console.log('No user, clearing watchlist');
                dispatch(setWatchlist([]));
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [dispatch]);

    const handleRemoveFromWatchlist = async (movieId, firebaseId) => {
        try {
            const result = await removeFromFirebaseWatchlist(firebaseId);
            if (result.success) {
                dispatch(removeFromWatchlist(movieId));
            } else {
                alert('Error removing from watchlist: ' + result.error);
            }
        } catch (error) {
            console.error('Error removing from watchlist:', error);
            alert('Error removing from watchlist. Please try again.');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        
        // Handle Firebase Firestore Timestamp objects
        if (dateString && typeof dateString === 'object' && dateString.toDate) {
            return dateString.toDate().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
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
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
                    <p className="text-gray-400 mb-6">Please sign in to view your watchlist.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-20">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">My Watchlist</h1>
                    <p className="text-gray-400">
                        {watchlist.length} {watchlist.length === 1 ? 'movie' : 'movies'} in your watchlist
                    </p>
                </div>

                {watchlist.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Your watchlist is empty</h3>
                        <p className="text-gray-400 mb-6">Start adding movies to your watchlist to see them here.</p>
                        <Link
                            to="/"
                            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Browse Movies
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {watchlist.map((movie) => (
                            <div key={movie.movieId} className="relative group">
                                <Card 
                                    data={{
                                        id: movie.movieId.replace('movie_', ''),
                                        title: movie.movieTitle,
                                        poster_path: movie.posterPath,
                                        release_date: movie.releaseDate,
                                        vote_average: movie.voteAverage,
                                        overview: movie.overview
                                    }}
                                    media_type="movie"
                                />
                                
                                {/* Remove button overlay */}
                                <button
                                    onClick={() => handleRemoveFromWatchlist(movie.movieId, movie.firebaseId || movie.id)}
                                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                                    title="Remove from watchlist"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                                
                                {/* Added date */}
                                <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                                    Added {formatDate(movie.addedAt)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WatchlistPage;
