import React from 'react'
import Logo from '../assets/logo.png'

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-4">
        
          <img className='w-40' src={Logo} alt='logo' />

          
          <p className="text-center max-w-md text-gray-600 dark:text-gray-300">
            Filmora is a movie streaming and recommendation web app.  
            This project is part of my internship at OrangeToolz as a Full Stack Developer.
          </p>

      
          <p className="text-xs text-gray-500 dark:text-gray-400">
            &copy; 2025. All rights reserved to Jarin Anan Jasia.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
