# 🎬 Filmora - Movie Streaming & Recommendation Platform

A modern, feature-rich movie streaming and recommendation web application built with React, Firebase, and Redux. Discover, rate, and manage your favorite movies and TV shows with a beautiful, responsive interface.

![Filmora Banner](https://img.shields.io/badge/Filmora-Movie%20Streaming%20Platform-red?style=for-the-badge&logo=react)

## ✨ Features

### 🎯 Core Features
- **Movie & TV Show Discovery** - Browse thousands of movies and TV shows
- **Advanced Search** - Search by title, genre, and other criteria
- **Genre-based Filtering** - Filter content by multiple genres
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Dark Theme UI** - Modern, eye-friendly dark interface

### 👤 User Features
- **User Authentication** - Secure sign-up/sign-in with Firebase Auth
- **Personal Watchlist** - Save and manage your favorite movies
- **Movie Ratings & Reviews** - Rate movies and write detailed reviews
- **Comments System** - Share thoughts and engage with other users
- **User Profiles** - Complete profile setup with preferences
- **Blog System** - Create and share movie-related blog posts

### 🎬 Content Features
- **Movie Details** - Comprehensive movie information, cast, and crew
- **Trailer Integration** - Watch movie trailers directly in the app
- **Recommendations** - AI-powered movie recommendations
- **Trending Content** - Discover what's popular right now
- **Advanced Filtering** - Filter by rating, language, and more

### 🔧 Admin Features
- **Admin Panel** - Manage user ratings and reviews
- **Content Moderation** - Approve/reject user-submitted content
- **User Management** - Monitor user activity and content

### 💳 Premium Features
- **Subscription Plans** - Basic and Premium subscription options
- **Payment Integration** - QR code-based payment system
- **Premium Content** - Exclusive access to premium features

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Redux Toolkit** - State management with RTK
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Beautiful SVG icons

### Backend & Services
- **Firebase Authentication** - User authentication and management
- **Firestore Database** - NoSQL cloud database
- **Firebase Hosting** - Static web hosting
- **TMDB API** - Movie and TV show data

### Development Tools
- **Vite** - Fast build tool and dev server
- **ESLint** - Code linting and formatting
- **Git** - Version control

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- TMDB API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/filmora.git
   cd filmora
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_TMDB_API_KEY=your_tmdb_api_key_here
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

4. **Firebase Setup**
   - Create a new Firebase project
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Set up security rules
   - Add your Firebase config to the environment variables

5. **TMDB API Setup**
   - Sign up at [The Movie Database](https://www.themoviedb.org/)
   - Get your API key from the settings
   - Add the API key to your environment variables

6. **Start the development server**
   ```bash
   npm start
   ```

7. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
filmora/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Header.js       # Navigation header
│   │   ├── Footer.js       # Site footer
│   │   ├── Card.js         # Movie/TV show cards
│   │   ├── FirebaseAuth.js # Authentication component
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── Home.js         # Homepage
│   │   ├── DetailsPage.js  # Movie/TV show details
│   │   ├── SearchPage.js   # Search results
│   │   ├── WatchlistPage.js # User watchlist
│   │   └── ...
│   ├── store/              # Redux store
│   │   ├── store.js        # Store configuration
│   │   ├── movieoSlice.js  # Movie data slice
│   │   └── userSlice.js    # User data slice
│   ├── services/           # API services
│   │   └── firebaseService.js # Firebase operations
│   ├── hooks/              # Custom React hooks
│   │   ├── useFetch.js     # Data fetching hook
│   │   └── useFetchDetails.js # Detailed data fetching
│   ├── firebase/           # Firebase configuration
│   │   └── config.js       # Firebase setup
│   ├── routes/             # Routing configuration
│   │   └── index.js        # Route definitions
│   └── assets/             # Static assets
│       ├── logo.png
│       └── ...
├── package.json
├── tailwind.config.js
└── README.md
```

## 🎨 Key Features Explained

### Authentication System
- **Firebase Auth Integration** - Secure user authentication
- **Profile Management** - Complete user profile setup
- **Admin Roles** - Special privileges for admin users

### Movie Discovery
- **TMDB API Integration** - Real-time movie and TV show data
- **Advanced Search** - Search by title, genre, and more
- **Genre Filtering** - Filter content by multiple genres
- **Recommendations** - Personalized content suggestions

### User Engagement
- **Rating System** - Rate movies with 5-star system
- **Review System** - Write detailed movie reviews
- **Comments** - Engage with other users
- **Watchlist** - Save movies for later viewing
- **Blog System** - Share movie-related content

### Admin Features
- **Content Moderation** - Approve/reject user content
- **User Management** - Monitor user activity
- **Analytics Dashboard** - Track platform usage

## 🔧 Configuration

### Firebase Security Rules
```javascript
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
  }
}
```

### Environment Variables
Make sure to set up all required environment variables in your `.env` file:

```env
# TMDB API Configuration
REACT_APP_TMDB_API_KEY=your_tmdb_api_key_here

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## 🚀 Deployment

### Firebase Hosting
1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase**
   ```bash
   firebase init hosting
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

### Other Deployment Options
- **Vercel** - Easy deployment with Git integration
- **Netlify** - Drag and drop deployment
- **AWS S3** - Static website hosting
- **GitHub Pages** - Free hosting for public repositories

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style
- Add comments for complex logic
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation if needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **The Movie Database (TMDB)** - For providing the movie and TV show data API
- **Firebase** - For authentication and database services
- **React Team** - For the amazing React framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Heroicons** - For the beautiful SVG icons

## 📞 Support

If you have any questions or need help:

- **Email**: support@filmora.com
- **Issues**: [GitHub Issues](https://github.com/yourusername/filmora/issues)
- **Documentation**: [Wiki](https://github.com/yourusername/filmora/wiki)

## 🎯 Roadmap

### Upcoming Features
- [ ] **Video Streaming** - Direct video playback
- [ ] **Social Features** - User following and activity feed
- [ ] **Mobile App** - React Native mobile application
- [ ] **Offline Support** - PWA with offline capabilities
- [ ] **Multi-language Support** - Internationalization
- [ ] **Advanced Analytics** - User behavior tracking
- [ ] **AI Recommendations** - Machine learning-based suggestions
- [ ] **Live Chat** - Real-time user support

### Performance Improvements
- [ ] **Image Optimization** - Lazy loading and compression
- [ ] **Caching Strategy** - Improved data caching
- [ ] **Bundle Optimization** - Reduced bundle size
- [ ] **CDN Integration** - Global content delivery

---

**Made with ❤️ by the Filmora Team**

*Transform your movie watching experience with Filmora - Where every story matters.*
