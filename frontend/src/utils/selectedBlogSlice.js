import { createSlice } from "@reduxjs/toolkit";

const initialBlogState = {
  creator: { _id: "" },
  likes: [],
  comments: [],
};

// Safely parse localStorage data
const getSelectedBlogFromStorage = () => {
  try {
    // First clear any malformed data
    const storedBlog = localStorage.getItem("selectedBlog");
    if (storedBlog === "undefined" || storedBlog === null) {
      localStorage.removeItem("selectedBlog");
      return initialBlogState;
    }
    
    const parsedBlog = JSON.parse(storedBlog);
    
    // Ensure all required properties exist
    return {
      ...initialBlogState,
      ...parsedBlog,
      creator: parsedBlog.creator || { _id: "" },
      likes: Array.isArray(parsedBlog.likes) ? parsedBlog.likes : [],
      comments: Array.isArray(parsedBlog.comments) ? parsedBlog.comments : []
    };
  } catch (error) {
    console.error("Error parsing blog data from localStorage:", error);
    // Clear corrupted data
    localStorage.removeItem("selectedBlog");
    return initialBlogState;
  }
};

const selectedBlogSlice = createSlice({
  name: "selectedBlogSlice",
  initialState: getSelectedBlogFromStorage(),
  reducers: {
    addSlectedBlog(state, action) {
      if (!action.payload) {
        return state;
      }
      
      // Ensure the payload has all required properties
      const safePayload = {
        ...action.payload,
        creator: action.payload.creator || { _id: "" },
        likes: Array.isArray(action.payload.likes) ? action.payload.likes : [],
        comments: Array.isArray(action.payload.comments) ? action.payload.comments : []
      };
      
      try {
        localStorage.setItem("selectedBlog", JSON.stringify(safePayload));
      } catch (error) {
        console.error("Error saving blog data to localStorage:", error);
      }
      return safePayload;
    },
    removeSelectedBlog(state, action) {
      try {
        localStorage.removeItem("selectedBlog");
      } catch (error) {
        console.error("Error removing blog data from localStorage:", error);
      }
      return initialBlogState;
    },

    changeLikes(state, action) {
      if (!Array.isArray(state.likes)) {
        state.likes = [];
      }
      
      if (state.likes.includes(action.payload)) {
        state.likes = state.likes.filter((like) => like !== action.payload);
      } else {
        state.likes = [...state.likes, action.payload];
      }

      return state;
    },

    setComments(state, action) {
      state.comments = [...state.comments, action.payload];
    },

    setCommentLikes(state, action) {
      let { commentId, userId } = action.payload;
      function toogleLike(comments) {
        return comments.map((comment) => {
          if (comment._id == commentId) {
            if (comment.likes.includes(userId)) {
              comment.likes = comment.likes.filter((like) => like !== userId);
              return comment;
            } else {
              comment.likes = [...comment.likes, userId];
              return comment;
            }
          }

          if (comment.replies && comment.replies.length > 0) {
            return { ...comment, replies: toogleLike(comment.replies) };
          }

          return comment;
        });
      }
      state.comments = toogleLike(state.comments);
    },

    setReplies(state, action) {
      let newReply = action.payload;

      function findParentComment(comments) {
        let parentComment;

        for (const comment of comments) {
          if (comment._id === newReply.parentComment) {
            parentComment = {
              ...comment,
              replies: [...comment.replies, newReply],
            };
            break;
          }

          if (comment.replies.length > 0) {
            parentComment = findParentComment(comment.replies);
            if (parentComment) {
              parentComment = {
                ...comment,
                replies: comment.replies.map((reply) =>
                  reply._id == parentComment._id ? parentComment : reply
                ),
              };
              break;
            }
          }
        }

        return parentComment; //top level comment return kr raha hu dost ;
      }

      let parentComment = findParentComment(state.comments);

      state.comments = state.comments.map((comment) =>
        comment._id == parentComment._id ? parentComment : comment
      );
    },

    setUpdatedComments(state, action) {
      function updateComment(comments) {
        return comments.map((comment) =>
          comment._id == action.payload._id
            ? { ...comment, comment: action.payload.comment }
            : comment.replies && comment.replies.length > 0
            ? { ...comment, replies: updateComment(comment.replies) }
            : comment
        );
      }

      state.comments = updateComment(state.comments);
    },

    deleteCommentAndReply(state, action) {
      function deleteComment(comments) {
        return comments
          .filter((comment) => comment._id !== action.payload)
          .map((comment) =>
            comment.replies && comment.replies.length > 0
              ? { ...comment, replies: deleteComment(comment.replies) }
              : comment
          );
      }

      state.comments = deleteComment(state.comments);
    },
  },
});

export const {
  addSlectedBlog,
  removeSelectedBlog,
  changeLikes,
  setComments,
  setCommentLikes,
  setReplies,
  deleteCommentAndReply,
  setUpdatedComments,
} = selectedBlogSlice.actions;
export default selectedBlogSlice.reducer;
