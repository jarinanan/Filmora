import React, { useState } from 'react';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { createUserProfile as createFirebaseProfile } from '../services/firebaseService';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentUser, createUserProfile, clearUserData } from '../store/userSlice';

const FirebaseAuth = () => {
    const dispatch = useDispatch();
    const { currentUser, userProfile } = useSelector(state => state.user);
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState('signin'); // 'signin' or 'signup'
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        isAdmin: false
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [firebaseUser, setFirebaseUser] = useState(null);

    // Listen for auth state changes
    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setFirebaseUser(user);
            if (user) {
                console.log('User signed in:', user.email);
                try {
                    const action = setCurrentUser(user);
                    console.log('Dispatching action:', action);
                    if (action && action.type) {
                        dispatch(action);
                    } else {
                        console.error('Invalid action:', action);
                    }
                } catch (error) {
                    console.error('Error dispatching setCurrentUser:', error);
                }
            } else {
                console.log('User signed out');
                try {
                    const action = clearUserData();
                    console.log('Dispatching action:', action);
                    if (action && action.type) {
                        dispatch(action);
                    } else {
                        console.error('Invalid action:', action);
                    }
                } catch (error) {
                    console.error('Error dispatching clearUserData:', error);
                }
            }
        });

        return () => unsubscribe();
    }, [dispatch]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSignIn = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { email, password } = formData;
            await signInWithEmailAndPassword(auth, email, password);
            setShowModal(false);
            setFormData({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '', isAdmin: false });
        } catch (error) {
            setError(getErrorMessage(error.code));
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { email, password, confirmPassword, firstName, lastName, isAdmin } = formData;

            // Validation
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                setLoading(false);
                return;
            }

            if (password.length < 6) {
                setError('Password must be at least 6 characters long');
                setLoading(false);
                return;
            }

            // Create user account
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Create user profile
            const profileData = {
                firstName,
                lastName,
                email,
                isAdmin,
                createdAt: new Date().toISOString(),
                isComplete: true
            };

            await createFirebaseProfile(user.uid, profileData);
            try {
                const action = createUserProfile(profileData);
                console.log('Dispatching createUserProfile action:', action);
                if (action && action.type) {
                    dispatch(action);
                } else {
                    console.error('Invalid createUserProfile action:', action);
                }
            } catch (error) {
                console.error('Error dispatching createUserProfile:', error);
            }

            setShowModal(false);
            setFormData({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '', isAdmin: false });
        } catch (error) {
            setError(getErrorMessage(error.code));
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            try {
                const action = clearUserData();
                console.log('Dispatching clearUserData action:', action);
                if (action && action.type) {
                    dispatch(action);
                } else {
                    console.error('Invalid clearUserData action:', action);
                }
            } catch (error) {
                console.error('Error dispatching clearUserData:', error);
            }
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const getErrorMessage = (errorCode) => {
        switch (errorCode) {
            case 'auth/user-not-found':
                return 'No account found with this email address';
            case 'auth/wrong-password':
                return 'Incorrect password';
            case 'auth/email-already-in-use':
                return 'An account with this email already exists';
            case 'auth/weak-password':
                return 'Password is too weak';
            case 'auth/invalid-email':
                return 'Invalid email address';
            default:
                return 'An error occurred. Please try again.';
        }
    };

    const openModal = (tab = 'signin') => {
        setActiveTab(tab);
        setShowModal(true);
        setError('');
    };

    if (currentUser) {
        const displayName = userProfile?.firstName || currentUser.email?.split('@')[0] || currentUser.email;
        
        return (
            <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                            {displayName?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <span className="text-white text-sm hidden md:block">
                        {displayName}
                    </span>
                </div>
                <button
                    onClick={handleSignOut}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                >
                    Sign Out
                </button>
            </div>
        );
    }

    return (
        <>
            <button
                onClick={() => openModal('signin')}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
                Sign In
            </button>

            {/* Authentication Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {activeTab === 'signin' ? 'Sign In' : 'Sign Up'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex mb-6">
                            <button
                                onClick={() => setActiveTab('signin')}
                                className={`flex-1 py-2 px-4 text-center font-medium border-b-2 transition-colors ${
                                    activeTab === 'signin'
                                        ? 'border-red-600 text-red-600'
                                        : 'border-gray-200 text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => setActiveTab('signup')}
                                className={`flex-1 py-2 px-4 text-center font-medium border-b-2 transition-colors ${
                                    activeTab === 'signup'
                                        ? 'border-red-600 text-red-600'
                                        : 'border-gray-200 text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Sign Up
                            </button>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Sign In Form */}
                        {activeTab === 'signin' && (
                            <form onSubmit={handleSignIn} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-gray-50 placeholder-gray-500"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-gray-50 placeholder-gray-500"
                                        placeholder="Enter your password"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Signing In...' : 'Sign In'}
                                </button>
                            </form>
                        )}

                        {/* Sign Up Form */}
                        {activeTab === 'signup' && (
                            <form onSubmit={handleSignUp} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-gray-50 placeholder-gray-500"
                                            placeholder="First name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-gray-50 placeholder-gray-500"
                                            placeholder="Last name"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-gray-50 placeholder-gray-500"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-gray-50 placeholder-gray-500"
                                        placeholder="Enter your password"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-gray-50 placeholder-gray-500"
                                        placeholder="Confirm your password"
                                        required
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="isAdmin"
                                        checked={formData.isAdmin}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                    />
                                    <label className="ml-2 block text-sm text-gray-700">
                                        Register as Admin Account
                                    </label>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Creating Account...' : 'Sign Up'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default FirebaseAuth;
