import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams, Link } from "react-router-dom";

function VerifyUser() {
  const { verificationToken } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function verifyUser() {
      try {
        setIsLoading(true);
        console.log("Starting verification process with token:", verificationToken);
        
        const res = await axios.get(
          `/api/v1/verify-email/${verificationToken}`
        );

        console.log("Verification response:", res.data);
        setSuccess(true);
        toast.success(res.data.message);
        
        // After successful verification, manually trigger a refresh of the user data
        // This helps ensure the UI reflects the updated verification status
        setTimeout(() => {
          navigate("/signin");
        }, 3000);
      } catch (error) {
        console.error("Verification error:", error);
        setError(error.response?.data?.message || "Verification failed");
        toast.error(error.response?.data?.message || "Verification failed");
      } finally {
        setIsLoading(false);
      }
    }
    verifyUser();
  }, [verificationToken, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-5">
      <h1 className="text-3xl font-bold mb-6">Email Verification</h1>
      
      {isLoading ? (
        <div className="text-xl text-center">
          <p className="mb-4">Verifying your email...</p>
          <div className="loader mt-4 mx-auto"></div>
        </div>
      ) : error ? (
        <div className="text-red-600 text-xl text-center">
          <p className="mb-4">{error}</p>
          <p className="mb-4">Please try again or request a new verification link.</p>
          <div className="flex justify-center gap-4 mt-6">
            <button 
              onClick={() => navigate("/signin")} 
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Go to Sign In
            </button>
            <button 
              onClick={() => navigate("/signup")} 
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
            >
              Sign Up
            </button>
          </div>
        </div>
      ) : (
        <div className="text-green-600 text-xl text-center">
          <p className="mb-4">Your email has been successfully verified!</p>
          <p className="mb-4">You can now login with your credentials.</p>
          <p className="mb-4">Redirecting to login page...</p>
          <Link 
            to="/signin" 
            className="inline-block mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Sign In Now
          </Link>
        </div>
      )}
    </div>
  );
}

export default VerifyUser;