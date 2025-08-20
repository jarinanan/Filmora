import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    bannerData: [],
    imageURL: "https://image.tmdb.org/t/p/original",
    trending: [],
    popular: [],
    topRated: [],
    upcoming: [],
    tvShows: [],
    name: 'filmora',
    config: null
};

export const movieoSlice = createSlice({
    name: 'filmora',
    initialState,
    reducers: {
        setBannerData: (state, action) => {
            state.bannerData = action.payload;
        },
        setImageURL: (state, action) => {
            state.imageURL = action.payload;
        },
        setTrending: (state, action) => {
            state.trending = action.payload;
        },
        setPopular: (state, action) => {
            state.popular = action.payload;
        },
        setTopRated: (state, action) => {
            state.topRated = action.payload;
        },
        setUpcoming: (state, action) => {
            state.upcoming = action.payload;
        },
        setTvShows: (state, action) => {
            state.tvShows = action.payload;
        },
        setConfig: (state, action) => {
            state.config = action.payload;
        }
    }
});

export const { 
    setBannerData, 
    setImageURL, 
    setTrending, 
    setPopular, 
    setTopRated, 
    setUpcoming, 
    setTvShows, 
    setConfig 
} = movieoSlice.actions;

export default movieoSlice.reducer;
