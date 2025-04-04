import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useLoader from "./useLoader";

function usePagination(path, queryParams = {}, limit = 5, page = 1) {
  const [hasMore, setHasMore] = useState(true);
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();
  const [isLoading, startLoading, stopLoading] = useLoader();
  
  useEffect(() => {
    async function fetchSeachBlogs() {
      try {
        startLoading();
        console.log(`Fetching from ${import.meta.env.VITE_BACKEND_URL}/${path} with params:`, { ...queryParams, limit, page });
        
        let res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/${path}`,
          {
            params: { ...queryParams, limit, page },
            withCredentials: true
          }
        );
        
        console.log('API response:', res.data);
        
        if (Array.isArray(res.data.blogs)) {
          setBlogs((prev) => [...prev, ...res.data.blogs]);
          setHasMore(res?.data?.hasMore);
        } else {
          console.error("Received non-array blogs data:", res.data);
          setBlogs([]);
          setHasMore(false);
          toast.error("Error loading blogs. Please try again.");
        }
      } catch (error) {
        console.error("Pagination error:", error);
        console.error("Error details:", error.response || error.message);
        if (error.response?.status === 404) {
          toast.error("API endpoint not found. Check your backend URL.");
        } else {
          navigate(-1);
          setBlogs([]);
          toast.error(error?.response?.data?.message || "Failed to load content");
        }
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
