import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useFetch from '../hooks/useFetch'
import useFetchDetails from '../hooks/useFetchDetails'
import { useSelector, useDispatch } from 'react-redux'
import moment from 'moment'
import Divider from '../components/Divider'
import HorizontalScollCard from '../components/HorizontalScollCard'
import VideoPlay from '../components/VideoPlay'
import CommentsSection from '../components/CommentsSection'
import WatchlistButton from '../components/WatchlistButton'
import UserProfileSetup from '../components/UserProfileSetup'
import { setCurrentUser, setUserProfile } from '../store/userSlice'
import { auth } from '../firebase/config'
import { onAuthStateChanged } from 'firebase/auth'
import { getUserProfile } from '../services/firebaseService'

const DetailsPage = () => {
  const params = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const imageURL = useSelector(state => state.movieoData.imageURL)
  const { userProfile } = useSelector(state => state.user)
  const { data } = useFetchDetails(`/${params?.explore}/${params?.id}`)
  const { data :castData} = useFetchDetails(`/${params?.explore}/${params?.id}/credits`)
  const { data : similarData } = useFetch(`/${params?.explore}/${params?.id}/similar`)
  const { data : recommendationData } = useFetch(`/${params?.explore}/${params?.id}/recommendations`)
  const [playVideo,setPlayVideo] = useState(false)
  const [playVideoId,setPlayVideoId] = useState("")
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  // Load user data and check for profile setup
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        dispatch(setCurrentUser(user));
        
        // Check if user has a profile
        const profileResult = await getUserProfile(user.uid);
        if (profileResult.success) {
          dispatch(setUserProfile(profileResult.data));
        } else {
          // User doesn't have a profile, show setup
          setShowProfileSetup(true);
        }
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  const handleButtonClick = () => {
    if (currentUser) {
      navigate("/pricing"); // Redirect to payment page if signed in
    } else {
      handlePlayVideo(data); // Play trailer if not signed in
    }
  };

  const handlePlayVideo = (data)=>{
    setPlayVideoId(data)
    setPlayVideo(true)
  }

  const duration = (data?.runtime/60)?.toFixed(1)?.split(".")
  const writer = castData?.crew?.filter(el => el?.job === "Writer")?.map(el => el?.name)?.join(", ")

  // Generate movie ID for rating system
  const movieId = data?.id ? `movie_${data.id}` : null;
  const movieTitle = data?.title || data?.name;

  const handleProfileComplete = () => {
    setShowProfileSetup(false);
  };

  return (
    <div className='py-20'> 
          <div className='w-full h-[380px]  lg:block'>
              <div className='w-full h-full'>
                <img
                    src={imageURL+data?.backdrop_path}
                    className='h-full w-full object-cover'
                /> 
              </div> 
          </div>

          <div className='container mx-auto px-3 py-16 lg:py-0 flex flex-col lg:flex-row gap-5 lg:gap-10 '>
              <div className='relative mx-auto lg:-mt-28 lg:mx-0 w-fit min-w-60'>
                  <img
                      src={imageURL+data?.poster_path}
                      className='h-80 w-60 object-cover rounded'
                  /> 
                  <div className="mt-3 space-y-2">
                    <button onClick={handleButtonClick} className='w-full py-2 px-4 text-center bg-white text-black rounded font-bold text-lg hover:bg-gradient-to-l from-red-500 to-orange-500 hover:scale-105 transition-all'>
                      {currentUser ? "💎 Watch Now" : "Watch Trailer"}
                    </button>
                    
                    {/* Watchlist Button */}
                    {currentUser && data && (
                      <WatchlistButton movie={data} />
                    )}
                  </div>
              </div>

              <div>
                <h2 className='text-2xl lg:text-4xl font-bold text-white '>{data?.title || data?.name}</h2>
                <p className='text-neutral-400'>{data?.tagline}</p> 

                <Divider/>

                <div className='flex items-center gap-3'>
                    <p>
                      Rating :  {Number(data?.vote_average).toFixed(1)}+
                    </p>
                    <span>|</span>
                    <p>
                      View : { Number(data?.vote_count)}
                    </p>
                    <span>|</span>
                    <p>Duration : {duration[0]}h {duration[1]}m</p>
                </div> 

                <Divider/>

                <div>
                    <h3 className='text-xl font-bold text-white mb-1'>Overview</h3>
                    <p>{data?.overview}</p>

                    <Divider/>
                    <div className='flex items-center gap-3 my-3 text-center'>
                        <p>
                          Staus : {data?.status}
                        </p>
                        <span>|</span>
                        <p>
                          Release Date : {moment(data?.release_date).format("MMMM Do YYYY")}
                        </p>
                        <span>|</span>
                        <p>
                          Revenue : {Number(data?.revenue)}
                        </p>
                    </div>

                    <Divider/>
                </div>

                <div>
                    <p><span className='text-white'>Director</span> : {castData?.crew[0]?.name}</p>

                    <Divider/>

                    <p>
                      <span className='text-white'>Writer : {writer}</span>
                    </p>
                </div>

                <Divider/>

                <h2 className='font-bold text-lg'>Cast :</h2>
                <div className='grid grid-cols-[repeat(auto-fit,96px)] gap-5 my-4'>
                    {
                      castData?.cast?.filter(el => el?.profile_path).map((starCast,index)=>{
                        return(
                          <div key={starCast.id}>
                            <div>
                              <img
                                src={imageURL+starCast?.profile_path} 
                                className='w-24 h-24 object-cover rounded-full'
                              />
                            </div>
                            <p className='font-bold text-center text-sm text-neutral-400'>{starCast?.name}</p>
                          </div>
                        )
                      })
                    }
                </div>
              </div>
          </div>

          {/* User Ratings & Comments Section */}
          {movieId && movieTitle && (
            <div className="container mx-auto px-3 my-10">
              <CommentsSection movieId={movieId} movieTitle={movieTitle} />
            </div>
          )}

          <div>
              <HorizontalScollCard data={recommendationData} heading={"Recommendation "+params?.explore} media_type={params?.explore}/>
          </div>

          {
            playVideo && (
              <VideoPlay data={playVideoId} close={()=>setPlayVideo(false)} media_type={params?.explore}/>
            )
          }

          {/* User Profile Setup Modal */}
          {showProfileSetup && (
            <UserProfileSetup onComplete={handleProfileComplete} />
          )}
          
    </div>
  )
}

export default DetailsPage


