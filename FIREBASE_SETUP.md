# Firebase Integration Setup

## Overview
This movie app has been fully integrated with Firebase for authentication and data storage, replacing the previous Clerk authentication and localStorage system.

## Firebase Configuration

### Authentication
- **Provider**: Firebase Authentication
- **Method**: Email/Password authentication
- **Features**: Sign up, Sign in, Sign out, Real-time auth state

### Database
- **Provider**: Firestore Database
- **Collections**: users, ratings, comments, watchlist, blogPosts

## Collections Structure

### Users Collection
```
users/{userId}
├── firstName: string
├── lastName: string
├── email: string
├── bio: string
├── favoriteGenres: array
├── avatar: string
├── createdAt: timestamp
└── updatedAt: timestamp
```

### Ratings Collection
```
ratings/{ratingId}
├── userId: string
├── userName: string
├── movieId: string
├── movieTitle: string
├── rating: number (1-5)
├── comment: string
├── status: string (pending/approved/rejected)
├── createdAt: timestamp
├── approvedAt: timestamp (optional)
└── rejectedAt: timestamp (optional)
```

### Comments Collection
```
comments/{commentId}
├── userId: string
├── userName: string
├── movieId: string
├── movieTitle: string
├── comment: string
├── status: string (approved)
└── createdAt: timestamp
```

### Watchlist Collection
```
watchlist/{watchlistId}
├── userId: string
├── movieId: string
├── movieTitle: string
├── posterPath: string
├── releaseDate: string
├── voteAverage: number
├── overview: string
└── addedAt: timestamp
```

### Blog Posts Collection
```
blogPosts/{postId}
├── authorId: string
├── author: string
├── title: string
├── content: string
├── tags: array
├── status: string (published)
├── publishedAt: timestamp
└── updatedAt: timestamp (optional)
```

## Features

### User Authentication
- ✅ Email/Password sign up and sign in
- ✅ Real-time authentication state
- ✅ Automatic profile setup for new users
- ✅ Persistent sessions

### Rating System
- ✅ Submit movie ratings (requires admin approval)
- ✅ Admin approval/rejection workflow
- ✅ Rating history tracking
- ✅ Average rating calculations

### Comment System
- ✅ Submit comments (auto-approved)
- ✅ Real-time comment display
- ✅ User attribution

### Watchlist Management
- ✅ Add/remove movies from watchlist
- ✅ Persistent watchlist storage
- ✅ Cross-device synchronization

### Blog System
- ✅ Create, edit, delete blog posts
- ✅ Tag-based categorization
- ✅ Author attribution
- ✅ Rich text content

### Admin Panel
- ✅ Review pending ratings
- ✅ Approve/reject ratings
- ✅ View rating history
- ✅ User management (anyone logged in is admin)

## Security Rules (Recommended)

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Anyone can read approved ratings and comments
    match /ratings/{ratingId} {
      allow read: if resource.data.status == 'approved';
      allow write: if request.auth != null;
    }
    
    match /comments/{commentId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Users can manage their own watchlist
    match /watchlist/{watchlistId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Users can manage their own blog posts
    match /blogPosts/{postId} {
      allow read: if true;
      allow write: if request.auth != null && resource.data.authorId == request.auth.uid;
    }
  }
}
```

## Usage

### For Users
1. Sign up with email/password
2. Complete profile setup
3. Browse movies and add to watchlist
4. Submit ratings and comments
5. Create blog posts

### For Admins
1. Sign in to access admin panel
2. Review pending ratings
3. Approve or reject ratings
4. Monitor user activity

## Dependencies
- `firebase`: ^10.x.x (latest version)
- `react-redux`: For state management
- `react-router-dom`: For navigation

## Environment Variables
The Firebase configuration is hardcoded in `src/firebase/config.js`. For production, consider using environment variables:

```javascript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};
```

## Troubleshooting

### Common Issues
1. **Authentication errors**: Check Firebase Auth configuration
2. **Database errors**: Verify Firestore rules and collection structure
3. **Import errors**: Ensure all Firebase dependencies are installed
4. **Permission errors**: Check Firestore security rules

### Development Tips
- Use Firebase Console to monitor data
- Enable Firestore logging for debugging
- Test authentication flows thoroughly
- Verify data consistency across collections
