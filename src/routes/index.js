import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import ExplorePage from "../pages/ExplorePage";
import DetailsPage from "../pages/DetailsPage";
import SearchPage from "../pages/SearchPage";
import GenrePage from "../pages/GenrePage";
import RecommendPage from "../pages/Recommendations";
import Example from "../pages/pricing";
import Payment from "../pages/Payment";
import AdminPanel from "../pages/AdminPanel";
import WatchlistPage from "../pages/WatchlistPage";
import BlogPage from "../pages/BlogPage";

const router = createBrowserRouter([
    {
        path : "/",
        element : <App/>,
        children : [
            {
                path : "",
                element : <Home/>
            },
            {
                path : ":explore",
                element : <ExplorePage/>
            },
            {
                path : ":explore/:id",
                element : <DetailsPage/>
            },
            {
                path : "search",
                element : <SearchPage/>
            },
            {
                path : "genre",
                element : <GenrePage/>
            },
            {
                path : "recommendations",
                element : <RecommendPage/>   
            },
            {
                path : "pricing",
                element : <Example />
            },
            {
                path : "payment",
                element : <Payment />
            },
            {
                path : "admin",
                element : <AdminPanel />
            },
            {
                path : "watchlist",
                element : <WatchlistPage />
            },
            {
                path : "blog",
                element : <BlogPage />
            }
        ]
    }
])

export default router