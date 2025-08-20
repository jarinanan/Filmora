import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentUser: null,
    userProfile: null,
    ratings: [],
    comments: [],
    watchlist: [],
    blogPosts: [],
    pendingRatings: [],
    approvedRatings: [],
    rejectedRatings: [],
    isAdmin: false,
    loading: false,
    error: null
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setCurrentUser: (state, action) => {
            state.currentUser = action.payload;
            // Admin status will be set when user profile is loaded
        },
        setUserProfile: (state, action) => {
            state.userProfile = action.payload;
            // Set admin status based on user profile
            state.isAdmin = action.payload?.isAdmin || false;
        },
        createUserProfile: (state, action) => {
            state.userProfile = action.payload;
            // Set admin status based on user profile
            state.isAdmin = action.payload?.isAdmin || false;
        },
        addRating: (state, action) => {
            const newRating = {
                ...action.payload,
                id: Date.now(),
                status: 'pending',
                submittedAt: new Date().toISOString()
            };
            state.pendingRatings.push(newRating);
        },
        approveRating: (state, action) => {
            const ratingId = action.payload;
            const rating = state.pendingRatings.find(r => r.id === ratingId);
            if (rating) {
                rating.status = 'approved';
                rating.approvedAt = new Date().toISOString();
                state.approvedRatings.push(rating);
                state.pendingRatings = state.pendingRatings.filter(r => r.id !== ratingId);
            }
        },
        rejectRating: (state, action) => {
            const ratingId = action.payload;
            const rating = state.pendingRatings.find(r => r.id === ratingId);
            if (rating) {
                rating.status = 'rejected';
                rating.rejectedAt = new Date().toISOString();
                state.rejectedRatings.push(rating);
                state.pendingRatings = state.pendingRatings.filter(r => r.id !== ratingId);
            }
        },
        addComment: (state, action) => {
            const newComment = {
                ...action.payload,
                id: Date.now(),
                status: 'approved', // Comments are auto-approved
                submittedAt: new Date().toISOString()
            };
            state.comments.push(newComment);
        },
        addToWatchlist: (state, action) => {
            const movie = action.payload;
            const exists = state.watchlist.find(item => item.movieId === movie.movieId);
            if (!exists) {
                state.watchlist.push({
                    ...movie,
                    addedAt: new Date().toISOString()
                });
            }
        },
        removeFromWatchlist: (state, action) => {
            const movieId = action.payload;
            state.watchlist = state.watchlist.filter(item => item.movieId !== movieId);
        },
        addBlogPost: (state, action) => {
            const newPost = {
                ...action.payload,
                id: Date.now(),
                status: 'published',
                publishedAt: new Date().toISOString()
            };
            state.blogPosts.push(newPost);
        },
        updateBlogPost: (state, action) => {
            const { id, updates } = action.payload;
            const index = state.blogPosts.findIndex(post => post.id === id);
            if (index !== -1) {
                state.blogPosts[index] = { ...state.blogPosts[index], ...updates };
            }
        },
        deleteBlogPost: (state, action) => {
            const postId = action.payload;
            state.blogPosts = state.blogPosts.filter(post => post.id !== postId);
        },
        setRatings: (state, action) => {
            state.pendingRatings = action.payload.pending || [];
            state.approvedRatings = action.payload.approved || [];
            state.rejectedRatings = action.payload.rejected || [];
        },
        setComments: (state, action) => {
            state.comments = action.payload;
        },
        setWatchlist: (state, action) => {
            state.watchlist = action.payload;
        },
        setBlogPosts: (state, action) => {
            state.blogPosts = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        clearUserData: (state) => {
            state.currentUser = null;
            state.userProfile = null;
            state.isAdmin = false;
            state.ratings = [];
            state.comments = [];
            state.watchlist = [];
            state.blogPosts = [];
            state.pendingRatings = [];
            state.approvedRatings = [];
            state.rejectedRatings = [];
        }
    }
});

export const { 
    setCurrentUser,
    setUserProfile,
    createUserProfile,
    addRating,
    approveRating,
    rejectRating,
    addComment,
    addToWatchlist,
    removeFromWatchlist,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    setRatings,
    setComments,
    setWatchlist,
    setBlogPosts,
    setLoading,
    setError,
    clearUserData
} = userSlice.actions;

export default userSlice.reducer;
