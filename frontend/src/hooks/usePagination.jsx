import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useLoader from "./useLoader";

// Configure axios defaults
axios.defaults.withCredentials = true;

function usePagination(path, queryParams = {}, limit = 5, page = 1) {
  const [hasMore, setHasMore] = useState(true);
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();
  const [isLoading, startLoading, stopLoading] = useLoader();
  
  useEffect(() => {
    async function fetchSeachBlogs() {
      try {
        startLoading();
        
        // Determine API URL based on environment
        const baseUrl = import.meta.env.DEV 
          ? "" // Empty for local development (will use proxy)
          : import.meta.env.VITE_BACKEND_URL || "";
          
        console.log(`Attempting to fetch from ${baseUrl}/api/${path}`);
        
        // Make the API request with simple configuration
        const response = await fetch(`${baseUrl}/api/${path}?page=${page}&limit=${limit}${
          Object.keys(queryParams).length > 0 
            ? '&' + new URLSearchParams(queryParams).toString() 
            : ''
        }`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        // Parse the JSON response
        const data = await response.json();
        console.log('API response data:', data);
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch blogs');
        }
        
        // Check if blogs is an array before setting state
        if (Array.isArray(data.blogs)) {
          setBlogs(prev => [...prev, ...data.blogs]);
          setHasMore(data.hasMore === true);
        } else {
          console.error('Received non-array blogs data:', data);
          toast.error('Received invalid data from server');
          setHasMore(false);
        }
      } catch (error) {
        console.error("Pagination error:", error);
        toast.error(error.message || "Failed to load content");
        setHasMore(false);
      } finally {
        stopLoading();
      }
    }
    
    fetchSeachBlogs();
  }, [page]);

  return { blogs, hasMore, isLoading };
}

export default usePagination;
