import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy,
    serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

// User Profile Services
export const createUserProfile = async (userId, profileData) => {
    try {
        await setDoc(doc(db, 'users', userId), {
            ...profileData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error creating user profile:', error);
        return { success: false, error: error.message };
    }
};

export const getUserProfile = async (userId) => {
    try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return { success: true, data: docSnap.data() };
        } else {
            return { success: false, error: 'Profile not found' };
        }
    } catch (error) {
        console.error('Error getting user profile:', error);
        return { success: false, error: error.message };
    }
};

// Rating Services
export const addRating = async (ratingData) => {
    try {
        const docRef = await addDoc(collection(db, 'ratings'), {
            ...ratingData,
            status: 'pending',
            createdAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error adding rating:', error);
        return { success: false, error: error.message };
    }
};

export const updateRatingStatus = async (ratingId, status) => {
    try {
        const ratingRef = doc(db, 'ratings', ratingId);
        await updateDoc(ratingRef, {
            status: status,
            updatedAt: serverTimestamp(),
            ...(status === 'approved' && { approvedAt: serverTimestamp() }),
            ...(status === 'rejected' && { rejectedAt: serverTimestamp() })
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating rating status:', error);
        return { success: false, error: error.message };
    }
};

export const getRatings = async (status = null) => {
    try {
        let q = collection(db, 'ratings');
        
        if (status) {
            q = query(q, where('status', '==', status));
        }
        
        q = query(q, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const ratings = [];
        querySnapshot.forEach((doc) => {
            ratings.push({ id: doc.id, ...doc.data() });
        });
        
        return { success: true, data: ratings };
    } catch (error) {
        console.error('Error getting ratings:', error);
        return { success: false, error: error.message };
    }
};

// Comment Services
export const addComment = async (commentData) => {
    try {
        const docRef = await addDoc(collection(db, 'comments'), {
            ...commentData,
            status: 'approved',
            createdAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error adding comment:', error);
        return { success: false, error: error.message };
    }
};

export const getComments = async (movieId = null) => {
    try {
        let q = collection(db, 'comments');
        
        if (movieId) {
            q = query(q, where('movieId', '==', movieId));
        }
        
        q = query(q, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const comments = [];
        querySnapshot.forEach((doc) => {
            comments.push({ id: doc.id, ...doc.data() });
        });
        
        return { success: true, data: comments };
    } catch (error) {
        console.error('Error getting comments:', error);
        return { success: false, error: error.message };
    }
};

// Watchlist Services
export const addToWatchlist = async (userId, movieData) => {
    try {
        const docRef = await addDoc(collection(db, 'watchlist'), {
            userId: userId,
            ...movieData,
            addedAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        return { success: false, error: error.message };
    }
};

export const removeFromWatchlist = async (watchlistId) => {
    try {
        await deleteDoc(doc(db, 'watchlist', watchlistId));
        return { success: true };
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        return { success: false, error: error.message };
    }
};

export const getWatchlist = async (userId) => {
    try {
        const q = query(
            collection(db, 'watchlist'),
            where('userId', '==', userId),
            orderBy('addedAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        
        const watchlist = [];
        querySnapshot.forEach((doc) => {
            watchlist.push({ id: doc.id, ...doc.data() });
        });
        
        return { success: true, data: watchlist };
    } catch (error) {
        console.error('Error getting watchlist:', error);
        return { success: false, error: error.message };
    }
};

export const checkWatchlistItem = async (userId, movieId) => {
    try {
        const q = query(
            collection(db, 'watchlist'),
            where('userId', '==', userId),
            where('movieId', '==', movieId)
        );
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { success: true, exists: true, id: doc.id };
        } else {
            return { success: true, exists: false };
        }
    } catch (error) {
        console.error('Error checking watchlist item:', error);
        return { success: false, error: error.message };
    }
};

// Blog Services
export const addBlogPost = async (postData) => {
    try {
        const docRef = await addDoc(collection(db, 'blogPosts'), {
            ...postData,
            status: 'published',
            publishedAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error adding blog post:', error);
        return { success: false, error: error.message };
    }
};

export const updateBlogPost = async (postId, updates) => {
    try {
        const postRef = doc(db, 'blogPosts', postId);
        await updateDoc(postRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating blog post:', error);
        return { success: false, error: error.message };
    }
};

export const deleteBlogPost = async (postId) => {
    try {
        await deleteDoc(doc(db, 'blogPosts', postId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting blog post:', error);
        return { success: false, error: error.message };
    }
};

export const getBlogPosts = async (authorId = null) => {
    try {
        let q = collection(db, 'blogPosts');
        
        if (authorId) {
            q = query(q, where('authorId', '==', authorId));
        }
        
        q = query(q, orderBy('publishedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const posts = [];
        querySnapshot.forEach((doc) => {
            posts.push({ id: doc.id, ...doc.data() });
        });
        
        return { success: true, data: posts };
    } catch (error) {
        console.error('Error getting blog posts:', error);
        return { success: false, error: error.message };
    }
};
