import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

function VerifyUser() {
  const { verificationToken } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function verifyUser() {
      try {
        setIsLoading(true);
        const res = await axios.get(
          `/api/v1/verify-email/${verificationToken}`
        );

        toast.success(res.data.message);
        setTimeout(() => {
          navigate("/signin");
        }, 2000);
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
        <div className="text-xl">
          <p>Verifying your email...</p>
          <div className="loader mt-4 mx-auto"></div>
        </div>
      ) : error ? (
        <div className="text-red-600 text-xl">
          <p>{error}</p>
          <button 
            onClick={() => navigate("/signin")} 
            className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Go to Sign In
          </button>
        </div>
      ) : (
        <div className="text-green-600 text-xl">
          <p>Your email has been successfully verified!</p>
          <p className="mt-2">Redirecting to login page...</p>
        </div>
      )}
    </div>
  );
}

export default VerifyUser;