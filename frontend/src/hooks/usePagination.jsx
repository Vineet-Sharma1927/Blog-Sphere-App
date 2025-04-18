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
        let res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/${path}`,
          {
            params: { ...queryParams, limit, page },
          }
        );
        setBlogs((prev) => [...prev, ...res.data.blogs]);
        setHasMore(res?.data?.hasMore);
      } catch (error) {
        console.error("Pagination error:", error);
        navigate(-1);
        setBlogs([]);
        toast.error(error?.response?.data?.message || "Failed to load content");
        setHasMore(false);
      } finally {
        stopLoading();
      }
    }
    fetchSeachBlogs();
  }, [page]);

  return { blogs, hasMore , isLoading};
}

export default usePagination;
