import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createUserProfile } from '../store/userSlice';
import { createUserProfile as createFirebaseProfile } from '../services/firebaseService';
import { auth } from '../firebase/config';

const UserProfileSetup = ({ onComplete }) => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        bio: '',
        favoriteGenres: [],
        avatar: ''
    });
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const genres = [
        'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 
        'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller',
        'Documentary', 'Animation', 'Crime', 'Family', 'History'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleGenreToggle = (genre) => {
        setFormData(prev => ({
            ...prev,
            favoriteGenres: prev.favoriteGenres.includes(genre)
                ? prev.favoriteGenres.filter(g => g !== genre)
                : [...prev.favoriteGenres, genre]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (step < 3) {
            setStep(step + 1);
        } else {
            setLoading(true);
            
            try {
                const userProfile = {
                    ...formData,
                    id: auth.currentUser?.uid,
                    email: auth.currentUser?.email,
                    createdAt: new Date().toISOString(),
                    isComplete: true
                };
                
                // Save to Firebase
                const result = await createFirebaseProfile(auth.currentUser?.uid, userProfile);
                
                if (result.success) {
                    // Update Redux state
                    dispatch(createUserProfile(userProfile));
                    onComplete();
                } else {
                    alert('Error creating profile: ' + result.error);
                }
            } catch (error) {
                console.error('Error creating profile:', error);
                alert('Error creating profile. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const renderStep1 = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                    </label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                    </label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                </label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                />
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Tell us about yourself</h3>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                </label>
                <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Tell us about your movie preferences..."
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Favorite Genres (Select up to 5)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {genres.map(genre => (
                        <label key={genre} className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.favoriteGenres.includes(genre)}
                                onChange={() => handleGenreToggle(genre)}
                                disabled={formData.favoriteGenres.length >= 5 && !formData.favoriteGenres.includes(genre)}
                                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <span className="text-sm text-gray-700">{genre}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Profile Picture</h3>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Avatar URL (Optional)
                </label>
                <input
                    type="url"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="https://example.com/avatar.jpg"
                />
            </div>
            {formData.avatar && (
                <div className="flex justify-center">
                    <img
                        src={formData.avatar}
                        alt="Avatar preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                </div>
            )}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="font-medium text-blue-900 mb-2">Profile Summary</h4>
                <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                    <p><strong>Email:</strong> {formData.email}</p>
                    <p><strong>Favorite Genres:</strong> {formData.favoriteGenres.join(', ') || 'None selected'}</p>
                </div>
            </div>
        </div>
    );

    const steps = [
        { title: 'Basic Info', component: renderStep1 },
        { title: 'Preferences', component: renderStep2 },
        { title: 'Avatar', component: renderStep3 }
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
                        <p className="text-gray-600 mt-2">Help us personalize your experience</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center mb-8">
                        {steps.map((stepItem, index) => (
                            <div key={index} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                    index + 1 <= step 
                                        ? 'bg-red-600 text-white' 
                                        : 'bg-gray-200 text-gray-600'
                                }`}>
                                    {index + 1}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`w-16 h-1 mx-2 ${
                                        index + 1 < step ? 'bg-red-600' : 'bg-gray-200'
                                    }`} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {steps[step - 1].component()}

                        {/* Navigation */}
                        <div className="flex justify-between pt-6">
                            <button
                                type="button"
                                onClick={() => setStep(Math.max(1, step - 1))}
                                className={`px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 ${
                                    step === 1 ? 'invisible' : ''
                                }`}
                                disabled={loading}
                            >
                                Previous
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : (step === 3 ? 'Complete Setup' : 'Next')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserProfileSetup;
