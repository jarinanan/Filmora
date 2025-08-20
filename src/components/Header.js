import React, { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import userIcon from "../assets/user.png";
import { IoSearchOutline } from "react-icons/io5";
import { navigation } from "../contants/navigation";
import FirebaseAuth from "./FirebaseAuth";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";

const Header = () => {
  const location = useLocation();
  const removeSpace = location?.search?.slice(3)?.split("%20")?.join(" ");
  const [searchInput, setSearchInput] = useState(removeSpace);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const genres = [
    "Action",
    "Adventure",
    "Comedy",
    "Drama",
    "Fantasy",
    "Horror",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Thriller",
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (searchInput) {
      navigate(`/search?q=${searchInput}`);
    }
  }, [searchInput]);

  useEffect(() => {
    if (selectedGenres.length > 0) {
      const genreQuery = selectedGenres.join(",");
      navigate(`/genre/?q=${genreQuery}`);
    }
  }, [selectedGenres]);

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <header className="fixed top-0 w-full h-16 bg-black bg-opacity-50 z-40">
      <div className="container mx-auto px-3 flex items-center h-full">
        <Link to={"/"}>
          <img src={logo} alt="logo" width={220} className=" mt-1" />
        </Link>

        <nav className="hidden lg:flex items-center gap-1 ml-5">
          {navigation.map((nav, index) => {
            return (
              <div key={nav.label + "header" + index}>
                <NavLink
                  to={nav.href}
                  className={({ isActive }) =>
                    `px-2 hover:text-neutral-100 ${
                      isActive && "text-neutral-100"
                    }`
                  }
                >
                  {nav.label}
                </NavLink>
              </div>
            );
          })}
          <a className="ml-2 hover:text-neutral-100" href="/recommendations">
            Recommend Movies
          </a>
          
          {/* Pricing and Payment Links */}
          <Link 
            to="/pricing" 
            className="ml-2 hover:text-neutral-100 px-2 py-1"
          >
            Pricing
          </Link>
          
          {/* User-specific navigation */}
          {currentUser && (
            <>
              <Link 
                to="/watchlist" 
                className="ml-2 hover:text-neutral-100 px-2 py-1"
              >
                Watchlist
              </Link>
              <Link 
                to="/blog" 
                className="ml-2 hover:text-neutral-100 px-2 py-1"
              >
                Blog
              </Link>
              <Link 
                to="/admin" 
                className="ml-2 hover:text-neutral-100 px-2 py-1 bg-red-600 rounded text-sm font-medium"
              >
                Admin Panel
              </Link>
            </>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-5">
          <form className="flex items-center gap-2" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Search here..."
              className="bg-transparent px-4 py-1 outline-none border-none hidden lg:block"
              onChange={(e) => setSearchInput(e.target.value)}
              value={searchInput}
            />
            <button className="text-2xl text-white">
              <IoSearchOutline />
            </button>
          </form>
          
          {/* Firebase Authentication */}
          <FirebaseAuth />
        </div>
      </div>
    </header>
  );
};

export default Header;
