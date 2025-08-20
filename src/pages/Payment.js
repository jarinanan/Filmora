import React from "react";
import QR from "../assets/qr.jpg";
import { Link } from "react-router-dom";

function Payment() {
  return (
    <div className="pt-32 p-20 flex flex-col items-center justify-center min-h-screen">
      <div className="text-center max-w-2xl">
        <img className="w-44 mx-auto" src={QR} alt="payment" />
        <h1 className="text-4xl pt-4 font-bold text-gray-900">Scan to Pay</h1>
        <p className="mt-2 text-lg text-gray-600">
        🎬 Scan, Pay & Start Streaming Now! 🍿
        </p>
        <p className="mt-4 text-center px-14 text-gray-700 leading-relaxed">
          Enjoy uninterrupted access to your favorite movies and TV shows by
          making a quick and secure payment. Simply scan the QR code to subscribe
          to your chosen plan and start streaming instantly. Our payment process
          is fast, safe, and hassle-free, ensuring a seamless experience. Once the
          payment is completed, your subscription will be activated, granting you
          unlimited entertainment. If you face any issues, our support team is
          always here to help.
        </p>
        
        <div className="mt-8">
          <Link 
            to="/pricing" 
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            ← Back to Pricing
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Payment;
