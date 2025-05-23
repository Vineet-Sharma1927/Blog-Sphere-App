import { useDispatch, useSelector } from "react-redux";
import { setIsOpen } from "../utils/commentSlice";
import { useState } from "react";
import api from "../utils/api";
import {
  deleteCommentAndReply,
  setCommentLikes,
  setComments,
  setReplies,
  setUpdatedComments,
} from "../utils/selectedBlogSlice";

import { formatDate } from "../utils/formatDate";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

function Comment() {
  const dispatch = useDispatch();
  const [comment, setComment] = useState("");
  const [activeReply, setActiveReply] = useState(null);
  const [currentPopup, setCurrentPopup] = useState(null);
  const [currentEditComment, setCurrentEditComment] = useState(null);
  const selectedBlog = useSelector((state) => state.selectedBlog);
  const {
    _id: blogId,
    comments,
  } = selectedBlog;
  const creatorId = selectedBlog.creator?._id;
  const { token, id: userId } = useSelector((state) => state.user);

  async function handleComment() {
    try {
      if (!token) {
        return toast.error("Please login to add a comment");
      }
      
      let res = await api.post(
        `/api/v1/blogs/comment/${blogId}`,
        {
          comment,
        }
      );

      setComment("");
      dispatch(setComments(res.data.newComment));
    } catch (error) {
      console.error("Add comment error:", error);
      toast.error(error.response?.data?.message || "Failed to add comment");
    }
  }

  return (
    <div className="bg-white h-screen p-5 fixed top-0 right-0 w-[400px] border-l drop-shadow-xl overflow-y-scroll">
      <div className="flex  justify-between">
        <h1 className="text-xl font-medium">Comment ({comments?.length || 0})</h1>
        <i
          onClick={() => dispatch(setIsOpen(false))}
          className="fi fi-br-cross text-lg mt-1 cursor-pointer"
        ></i>
      </div>

      <div className="my-4">
        <textarea
          value={comment}
          type="text"
          placeholder="Comment..."
          className=" h-[150px] resize-none drop-shadow w-full p-3 text-lg focus:outline-none"
          onChange={(e) => setComment(e.target.value)}
        />
        <button onClick={handleComment} className="bg-green-500 px-7 py-3 my-2">
          Add
        </button>
      </div>

      <div className="mt-4">
        {Array.isArray(comments) && comments.length > 0 ? (
          <DisplayComments
            comments={comments}
            userId={userId}
            blogId={blogId}
            token={token}
            activeReply={activeReply}
            setActiveReply={setActiveReply}
            currentPopup={currentPopup}
            setCurrentPopup={setCurrentPopup}
            currentEditComment={currentEditComment}
            setCurrentEditComment={setCurrentEditComment}
            creatorId={creatorId}
          />
        ) : (
          <p className="text-center text-gray-500 my-4">No comments yet</p>
        )}
      </div>
    </div>
  );
}

function DisplayComments({
  comments,
  userId,
  blogId,
  token,
  setActiveReply,
  activeReply,
  currentPopup,
  setCurrentPopup,
  currentEditComment,
  setCurrentEditComment,
  creatorId,
}) {
  const [reply, setReply] = useState("");
  const [updatedCommentContent, setUpdatedCommentContent] = useState("");

  const dispatch = useDispatch();

  async function handleReply(parentCommentId) {
    try {
      if (!token) {
        return toast.error("Please login to reply to this comment");
      }
      
      let res = await api.post(
        `/api/v1/blogs/comment/${parentCommentId}/${blogId}`,
        {
          reply,
        }
      );

      setReply("");
      setActiveReply(null);
      dispatch(setReplies(res.data.newReply));
    } catch (error) {
      console.error("Reply error:", error);
      toast.error(error.response?.data?.message || "Failed to add reply");
    }
  }

  async function handleCommentLike(commentId) {
    try {
      if (!token) {
        return toast.error("Please login to like this comment");
      }
      
      const res = await api.patch(
        `/api/v1/blogs/like-comment/${commentId}`,
        {}
      );

      toast.success(res.data.message);
      dispatch(setCommentLikes({ commentId, userId }));
    } catch (error) {
      console.error("Comment like error:", error);
      toast.error(error.response?.data?.message || "Failed to like comment");
    }
  }

  function handleActiveReply(id) {
    setActiveReply((prev) => (prev === id ? null : id));
  }

  async function handleCommentUpdate(id) {
    try {
      if (!token) {
        return toast.error("Please login to edit this comment");
      }
      
      if (!updatedCommentContent.trim()) {
        return toast.error("Comment cannot be empty");
      }
      
      let res = await api.patch(
        `/api/v1/blogs/edit-comment/${id}`,
        {
          updatedCommentContent,
        }
      );

      toast.success(res.data.message);
      dispatch(setUpdatedComments(res.data.updatedComment));
    } catch (error) {
      console.error("Update comment error:", error);
      toast.error(error.response?.data?.message || "Failed to update comment");
    } finally {
      setUpdatedCommentContent("");
      setCurrentEditComment(null);
    }
  }

  async function handleCommentDelete(id) {
    try {
      if (!token) {
        return toast.error("Please login to delete this comment");
      }
      
      let res = await api.delete(
        `/api/v1/blogs/comment/${id}`
      );

      toast.success(res.data.message);
      dispatch(deleteCommentAndReply(id));
    } catch (error) {
      console.error("Delete comment error:", error);
      toast.error(error.response?.data?.message || "Failed to delete comment");
    } finally {
      setUpdatedCommentContent("");
      setCurrentEditComment(null);
    }
  }

  return (
    <>
      {comments.map((comment) => (
        <div key={comment._id}>
          <hr className="my-2" />
          <div className="flex flex-col gap-2 my-4">
            {currentEditComment === comment._id ? (
              <div className="my-4">
                <textarea
                  defaultValue={comment.comment}
                  type="text"
                  placeholder="Reply..."
                  className=" h-[150px] resize-none drop-shadow w-full p-3 text-lg focus:outline-none"
                  onChange={(e) => setUpdatedCommentContent(e.target.value)}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setCurrentEditComment(null)}
                    className="bg-red-500 px-7 py-3 my-2 rounded-3xl "
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleCommentUpdate(comment._id);
                    }}
                    className="bg-green-500 px-7 py-3 my-2 rounded-3xl "
                  >
                    Edit
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex w-full justify-between">
                  <Link
                    to={`/@${comment?.user?.username}`}
                    className="flex gap-2"
                  >
                    <div className="flex gap-2">
                      <div className="w-10 h-10 aspect-square rounded-full overflow-hidden">
                        <img
                          src={
                            comment?.user?.profilePic
                              ? comment?.user?.profilePic
                              : `https://api.dicebear.com/9.x/initials/svg?seed=${comment?.user?.name || 'User'}`
                          }
                          alt=""
                          className="rounded-full w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="capitalize font-medium">
                          {comment?.user?.name || 'Anonymous'}
                        </p>
                        <p>{formatDate(comment?.createdAt)}</p>
                      </div>
                    </div>
                  </Link>

                  {(comment?.user?._id === userId || userId === creatorId) ? (
                    currentPopup == comment?._id ? (
                      <div className="bg-gray-200 w-[70px] rounded-lg">
                        <i
                          onClick={() =>
                            setCurrentPopup((prev) =>
                              prev == comment?._id ? null : comment?._id
                            )
                          }
                          className="fi fi-br-cross relative left-12 text-sm mt-1 cursor-pointer"
                        ></i>
                        {comment?.user?._id === userId ? (
                          <p
                            className="p-2 py-1 hover:bg-blue-300"
                            onClick={() => {
                              setCurrentEditComment(comment._id);
                              setCurrentPopup(null);
                            }}
                          >
                            Edit
                          </p>
                        ) : (
                          ""
                        )}

                        <p
                          className="p-2 py-1 hover:bg-blue-300"
                          onClick={() => {
                            handleCommentDelete(comment._id);
                            setCurrentPopup(null);
                          }}
                        >
                          Delete
                        </p>
                      </div>
                    ) : (
                      <i
                        className="fi fi-bs-menu-dots cursor-pointer"
                        onClick={() => setCurrentPopup(comment._id)}
                      ></i>
                    )
                  ) : (
                    ""
                  )}
                </div>

                <p className="font-medium text-lg">{comment.comment}</p>

                <div className="flex justify-between">
                  <div className="flex gap-4">
                    <div className="cursor-pointer flex gap-2 ">
                      {comment.likes && Array.isArray(comment.likes) && comment.likes.includes(userId) ? (
                        <i
                          onClick={() => handleCommentLike(comment._id)}
                          className="fi fi-sr-thumbs-up text-blue-600 text-xl mt-1"
                        ></i>
                      ) : (
                        <i
                          onClick={() => handleCommentLike(comment._id)}
                          className="fi fi-rr-social-network text-lg mt-1"
                        ></i>
                      )}
                      <p className="text-lg">{comment.likes ? comment.likes.length : 0}</p>
                    </div>
                    <div className="flex gap-2 cursor-pointer">
                      <i className="fi fi-sr-comment-alt text-lg mt-1"></i>
                      <p className="text-lg">{comment.replies ? comment.replies.length : 0}</p>
                    </div>
                  </div>
                  <p
                    onClick={() => handleActiveReply(comment._id)}
                    className="text-lg hover:underline cursor-pointer"
                  >
                    reply
                  </p>
                </div>
              </>
            )}

            {activeReply === comment._id && (
              <div className="my-4">
                <textarea
                  type="text"
                  placeholder="Reply..."
                  className=" h-[150px] resize-none drop-shadow w-full p-3 text-lg focus:outline-none"
                  onChange={(e) => setReply(e.target.value)}
                />
                <button
                  onClick={() => handleReply(comment._id)}
                  className="bg-green-500 px-7 py-3 my-2"
                >
                  Add
                </button>
              </div>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <div className="pl-6 border-l ">
                <DisplayComments
                  comments={comment.replies}
                  userId={userId}
                  blogId={blogId}
                  token={token}
                  activeReply={activeReply}
                  setActiveReply={setActiveReply}
                  currentPopup={currentPopup}
                  setCurrentPopup={setCurrentPopup}
                  currentEditComment={currentEditComment}
                  setCurrentEditComment={setCurrentEditComment}
                  creatorId={creatorId}
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
}

export default Comment;
