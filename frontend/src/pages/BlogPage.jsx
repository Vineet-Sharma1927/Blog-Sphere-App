import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import {
  addSlectedBlog,
  changeLikes,
  removeSelectedBlog,
} from "../utils/selectedBlogSlice";
import Comment from "../components/Comment";
import { setIsOpen } from "../utils/commentSlice";
import { formatDate } from "../utils/formatDate";
import { updateData } from "../utils/userSilce";
import api from "../utils/api";
// import jwt from "jsonwebtoken"

export async function handleSaveBlogs(id, token) {
  try {
    if (!token) {
      return toast.error("Please signin to save this blog");
    }
    
    let res = await api.patch(
      `/api/v1/blogs/save/${id}`,
      {}
    );
    toast.success(res.data.message);
    return true;
  } catch (error) {
    console.error("Save blog error:", error);
    toast.error(error.response?.data?.message || "Failed to save blog");
    return false;
  }
}

export async function handleFollowCreator(id, token, dispatch) {
  try {
    if (!token) {
      return toast.error("Please signin to follow this creator");
    }
    
    let res = await api.patch(
      `/api/v1/users/follow/${id}`,
      {}
    );
    toast.success(res.data.message);

    if (dispatch) {
      dispatch(updateData(["followers", id]));
    }
    return true;
  } catch (error) {
    console.error("Follow error:", error);
    toast.error(error.response?.data?.message || "Failed to follow creator");
    return false;
  }
}

function BlogPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  //   const user = JSON.parse(localStorage.getItem("user"));
  //   const token = JSON.parse(localStorage.getItem("token"));
  const [isBlogSaved, setIsBlogSaved] = useState(false);

  const {
    token,
    email,
    id: userId,
    profilePic,
    following,
  } = useSelector((state) => state.user);
  const { likes, comments, content, creator } = useSelector(
    (state) => state.selectedBlog
  );

  const { isOpen } = useSelector((state) => state.comment);

  const [blogData, setBlogData] = useState(null);

  const [islike, setIsLike] = useState(false);

  async function fetchBlogById() {
    try {
      let {
        data: { blog },
      } = await api.get(`/api/v1/blogs/${id}`);
      setBlogData(blog);
      setIsBlogSaved(blog?.totalSaves?.includes(userId));

      dispatch(addSlectedBlog(blog));

      if (blog.likes && blog.likes.includes(userId)) {
        setIsLike((prev) => !prev);
      }
    } catch (error) {
      console.error("Fetch blog error:", error);
      toast.error(error.response?.data?.message || "Failed to load blog");
    }
  }

  async function handleLike() {
    if (!token) {
      return toast.error("Please signin to like this blog");
    }
    
    try {
      setIsLike((prev) => !prev);

      let res = await api.post(
        `/api/v1/blogs/like/${blogData._id}`,
        {}
      );
      dispatch(changeLikes(userId));
      toast.success(res.data.message);
    } catch (error) {
      // Revert like status if there's an error
      setIsLike((prev) => !prev);
      console.error("Like blog error:", error);
      toast.error(error.response?.data?.message || "Failed to like blog");
    }
  }

  async function handleDeleteBlog() {
    if (!token) {
      return toast.error("Please signin to delete this blog");
    }

    if (!blogData || !blogData._id) {
      return toast.error("Blog not found");
    }

    try {
      setIsDeleting(true);
      let res = await api.delete(
        `/api/v1/blogs/${blogData._id}`
      );
      
      toast.success(res.data.message || "Blog deleted successfully");
      
      // Navigate to the home page after deletion
      navigate('/');
    } catch (error) {
      console.error("Delete blog error:", error);
      toast.error(error.response?.data?.message || "Failed to delete blog");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  useEffect(() => {
    fetchBlogById();

    return () => {
      dispatch(setIsOpen(false));
      if (
        window.location.pathname !== `/edit/${id}` &&
        window.location.pathname !== `/blog/${id}`
      ) {
        dispatch(removeSelectedBlog());
      }
    };
  }, [id]);

  // Delete confirmation modal
  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Delete Blog</h2>
        <p className="mb-6">Are you sure you want to delete this blog? This action cannot be undone.</p>
        <div className="flex justify-end gap-4">
          <button 
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            onClick={handleDeleteBlog}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[700px] mx-auto p-5 ">
      {blogData ? (
        <div>
          <h1 className="mt-10 font-bold text-3xl  sm:text-4xl lg:text-6xl capitalize">
            {blogData.title}
          </h1>

          <div className="flex items-center my-5 gap-3">
            <Link to={`/@${blogData.creator?.username}`}>
              <div>
                <div className="w-10 h-10 cursor-pointer aspect-square rounded-full overflow-hidden">
                  <img
                    src={
                      blogData?.creator?.profilePic
                        ? blogData?.creator?.profilePic
                        : `https://api.dicebear.com/9.x/initials/svg?seed=${blogData?.creator?.name}`
                    }
                    alt=""
                    className="rounded-full w-full h-full object-cover"
                  />
                </div>
              </div>
            </Link>
            <div className="flex flex-col">
              <div className="flex items-center gap-1 ">
                <Link to={`/@${blogData?.creator?.username}`}>
                  <h2 className="text-xl hover:underline cursor-pointer">
                    {blogData.creator?.name}
                  </h2>
                </Link>
                {userId !== blogData.creator._id && (
                  <p
                    onClick={() =>
                      handleFollowCreator(blogData.creator?._id, token, dispatch)
                    }
                    className="text-xl my-2 font-medium text-green-700 cursor-pointer"
                  >
                    .
                    {!following?.includes(creator?._id)
                      ? "follow"
                      : "following"}
                  </p>
                )}
              </div>
              <div>
                <span>6 min read</span>
                <span className="mx-2">{formatDate(blogData.createdAt)}</span>
              </div>
            </div>
          </div>

          <img src={blogData.image} alt="" />

          {token && email === blogData.creator?.email && (
            <div className="flex gap-3 mt-5">
              <Link to={"/edit/" + blogData.blogId}>
                <button className="bg-green-400 px-6 py-2 text-xl rounded hover:bg-green-500">
                  Edit
                </button>
              </Link>
              <button 
                className="bg-red-500 px-6 py-2 text-xl rounded text-white hover:bg-red-600"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete
              </button>
            </div>
          )}
          <div className="flex gap-7 mt-4">
            <div className="cursor-pointer flex gap-2 ">
              {islike ? (
                <i
                  onClick={handleLike}
                  className="fi fi-sr-thumbs-up text-blue-600 text-3xl mt-1"
                ></i>
              ) : (
                <i
                  onClick={handleLike}
                  className="fi fi-rr-social-network text-3xl mt-1"
                ></i>
              )}
              <p className="text-2xl">{likes.length}</p>
            </div>

            <div className="flex gap-2">
              <i
                onClick={() => dispatch(setIsOpen())}
                className="fi fi-sr-comment-alt text-3xl mt-1"
              ></i>
              <p className="text-2xl">{comments.length}</p>
            </div>
            <div
              className="flex gap-2 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                handleSaveBlogs(blogData._id, token);
                setIsBlogSaved((prev) => !prev);
              }}
            >
              {isBlogSaved ? (
                <i className="fi fi-sr-bookmark text-3xl mt-1"></i>
              ) : (
                <i className="fi fi-rr-bookmark text-3xl mt-1"></i>
              )}
            </div>
          </div>

          <div className="my-10">
            {content.blocks.map((block, index) => {
              if (block.type == "header") {
                if (block.data.level == 2) {
                  return (
                    <h2
                      key={index}
                      className="font-bold text-4xl my-4"
                      dangerouslySetInnerHTML={{ __html: block.data.text }}
                    ></h2>
                  );
                } else if (block.data.level == 3) {
                  return (
                    <h3
                      key={index}
                      className="font-bold text-3xl my-4"
                      dangerouslySetInnerHTML={{ __html: block.data.text }}
                    ></h3>
                  );
                } else if (block.data.level == 4) {
                  return (
                    <h4
                      key={index}
                      className="font-bold text-2xl my-4"
                      dangerouslySetInnerHTML={{ __html: block.data.text }}
                    ></h4>
                  );
                }
              } else if (block.type == "paragraph") {
                return (
                  <p
                    key={index}
                    className="my-4"
                    dangerouslySetInnerHTML={{ __html: block.data.text }}
                  ></p>
                );
              } else if (block.type == "image") {
                return (
                  <div className="my-4" key={index}>
                    <img src={block.data.file.url} alt="" />
                    <p className="text-center my-2">{block.data.caption}</p>
                  </div>
                );
              } else if (block.type == "List") {
                if (block.data.style == "ordered") {
                  return (
                    <ol key={index} className="list-decimal my-4">
                      {block.data.items.map((item, index) => (
                        <li key={index}>{item?.content}</li>
                      ))}
                    </ol>
                  );
                } else {
                  return (
                    <ul key={index} className="list-disc my-4">
                      {block.data.items.map((item, index) => (
                        <li key={index}>{item?.content}</li>
                      ))}
                    </ul>
                  );
                }
              }
            })}
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center w-full h-[calc(100vh-500px)]">
          <span className="loader"></span>
        </div>
      )}

      {isOpen && <Comment />}
      {showDeleteConfirm && <DeleteConfirmationModal />}
    </div>
  );
}

export default BlogPage;
