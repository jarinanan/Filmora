import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addBlogPost, deleteBlogPost, setBlogPosts } from '../store/userSlice';
import { addBlogPost as addFirebaseBlogPost, deleteBlogPost as deleteFirebaseBlogPost, getBlogPosts } from '../services/firebaseService';
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const BlogPage = () => {
    const dispatch = useDispatch();
    const [currentUser, setCurrentUser] = useState(null);
    const { blogPosts, userProfile } = useSelector(state => state.user);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        tags: ''
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            
            if (user) {
                // Load user's blog posts from Firebase
                const result = await getBlogPosts(user.uid);
                if (result.success) {
                    dispatch(setBlogPosts(result.data));
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title.trim() || !formData.content.trim()) {
            alert('Please fill in all required fields');
            return;
        }

        const blogData = {
            title: formData.title.trim(),
            content: formData.content.trim(),
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            author: userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName}` : currentUser.email,
            authorId: currentUser.uid
        };

        try {
            const result = await addFirebaseBlogPost(blogData);
            if (result.success) {
                dispatch(addBlogPost({ ...blogData, id: result.id }));
                setFormData({ title: '', content: '', tags: '' });
                setShowCreateForm(false);
            } else {
                alert('Error creating blog post: ' + result.error);
            }
        } catch (error) {
            console.error('Error creating blog post:', error);
            alert('Error creating blog post. Please try again.');
        }
    };

    const handleDelete = async (postId) => {
        if (window.confirm('Are you sure you want to delete this blog post?')) {
            try {
                const result = await deleteFirebaseBlogPost(postId);
                if (result.success) {
                    dispatch(deleteBlogPost(postId));
                } else {
                    alert('Error deleting blog post: ' + result.error);
                }
            } catch (error) {
                console.error('Error deleting blog post:', error);
                alert('Error deleting blog post. Please try again.');
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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
                    <p className="text-gray-400 mb-6">Please sign in to access the blog.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-20">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Movie Blog</h1>
                        <p className="text-gray-400">Share your thoughts about movies and cinema</p>
                    </div>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>New Post</span>
                    </button>
                </div>

                {blogPosts.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No blog posts yet</h3>
                        <p className="text-gray-400 mb-6">Be the first to share your thoughts about movies!</p>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Create First Post
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {blogPosts.map((post) => (
                            <article key={post.id} className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{post.title}</h2>
                                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                            <span>By {post.author}</span>
                                            <span>•</span>
                                            <span>{formatDate(post.publishedAt)}</span>
                                        </div>
                                        {post.tags && post.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {post.tags.map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDelete(post.id)}
                                        className="text-red-600 hover:text-red-800 p-2"
                                        title="Delete post"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="prose max-w-none">
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {post.content}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {/* Create Blog Post Modal */}
                {showCreateForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">Create New Blog Post</h2>
                                    <button
                                        onClick={() => setShowCreateForm(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-2">
                                            Title *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                            placeholder="Enter your blog post title..."
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-black mb-2">
                                            Content *
                                        </label>
                                        <textarea
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            rows={8}
                                            className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                            placeholder="Write your blog post content..."
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-black mb-2">
                                            Tags (comma-separated)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.tags}
                                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                            placeholder="movies, cinema, review, etc."
                                        />
                                    </div>

                                    <div className="flex space-x-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateForm(false)}
                                            className="flex-1 bg-gray-300 text-black py-2 px-4 rounded-md text-black hover:bg-gray-400 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                                        >
                                            Publish Post
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogPage;
