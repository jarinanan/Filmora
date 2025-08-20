import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToWatchlist, removeFromWatchlist } from '../store/userSlice';
import { addToWatchlist as addToFirebaseWatchlist, removeFromWatchlist as removeFromFirebaseWatchlist, checkWatchlistItem } from '../services/firebaseService';
import { auth } from '../firebase/config';
import { BookmarkIcon, BookmarkSlashIcon } from '@heroicons/react/24/outline';

const WatchlistButton = ({ movie }) => {
    const dispatch = useDispatch();
    const { currentUser, watchlist } = useSelector(state => state.user);
    
    const isInWatchlist = watchlist.some(item => item.movieId === `movie_${movie.id}`);

    const handleToggleWatchlist = async () => {
        if (!currentUser) {
            alert('Please sign in to manage your watchlist');
            return;
        }

        try {
            if (isInWatchlist) {
                // Find the watchlist item to get its Firebase ID
                const watchlistItem = watchlist.find(item => item.movieId === `movie_${movie.id}`);
                console.log('Removing from watchlist:', watchlistItem);
                if (watchlistItem?.firebaseId) {
                    const result = await removeFromFirebaseWatchlist(watchlistItem.firebaseId);
                    console.log('Remove result:', result);
                    if (result.success) {
                        dispatch(removeFromWatchlist(`movie_${movie.id}`));
                    } else {
                        alert('Error removing from watchlist: ' + result.error);
                    }
                }
            } else {
                const movieData = {
                    movieId: `movie_${movie.id}`,
                    movieTitle: movie.title || movie.name,
                    posterPath: movie.poster_path,
                    releaseDate: movie.release_date,
                    voteAverage: movie.vote_average,
                    overview: movie.overview
                };
                
                console.log('Adding to watchlist:', movieData);
                const result = await addToFirebaseWatchlist(currentUser.uid, movieData);
                console.log('Add result:', result);
                if (result.success) {
                    dispatch(addToWatchlist({ ...movieData, firebaseId: result.id, addedAt: new Date().toISOString() }));
                } else {
                    alert('Error adding to watchlist: ' + result.error);
                }
            }
        } catch (error) {
            console.error('Error toggling watchlist:', error);
            alert('Error managing watchlist. Please try again.');
        }
    };

    return (
        <button
            onClick={handleToggleWatchlist}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isInWatchlist
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
        >
            {isInWatchlist ? (
                <BookmarkSlashIcon className="w-5 h-5" />
            ) : (
                <BookmarkIcon className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">
                {isInWatchlist ? 'Remove' : 'Watchlist'}
            </span>
        </button>
    );
};

export default WatchlistButton;
