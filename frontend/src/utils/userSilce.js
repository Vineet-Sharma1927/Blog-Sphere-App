import { createSlice } from "@reduxjs/toolkit";

const initialUserState = {
  token: null,
  name: null,
  username: null,
  email: null,
  id: null,
  profilePic: null,
  followers: [],
  following: [],
};

// Clear corrupted localStorage data
const clearLocalStorage = () => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("user");
    }
  } catch (error) {
    console.error("Error clearing localStorage:", error);
  }
};

// Safely parse localStorage data
const getUserFromStorage = () => {
  try {
    if (typeof window === 'undefined') {
      return initialUserState;
    }
    
    const storedUser = localStorage.getItem("user");
    
    // Handle invalid data
    if (storedUser === "undefined" || storedUser === null) {
      clearLocalStorage();
      return initialUserState;
    }
    
    const parsedUser = JSON.parse(storedUser);
    
    // Ensure object has all required properties
    return {
      ...initialUserState,
      ...parsedUser,
      followers: Array.isArray(parsedUser.followers) ? parsedUser.followers : [],
      following: Array.isArray(parsedUser.following) ? parsedUser.following : [],
    };
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
    clearLocalStorage();
    return initialUserState;
  }
};

const userSlice = createSlice({
  name: "userSlice",
  initialState: getUserFromStorage(),
  reducers: {
    login(state, action) {
      if (!action.payload) {
        return state;
      }
      
      const userData = { 
        ...initialUserState,
        ...action.payload,
        followers: Array.isArray(action.payload.followers) ? action.payload.followers : [],
        following: Array.isArray(action.payload.following) ? action.payload.following : [],
      };
      
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem("user", JSON.stringify(userData));
        }
      } catch (error) {
        console.error("Error saving user data to localStorage:", error);
      }
      return userData;
    },
    logout(state, action) {
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem("user");
          localStorage.removeItem("selectedBlog");
        }
      } catch (error) {
        console.error("Error removing user data from localStorage:", error);
      }
      return initialUserState;
    },

    updateData(state, action) {
      if (!action.payload || !Array.isArray(action.payload) || action.payload.length === 0) {
        return state;
      }
      
      const data = action.payload;
      
      if (data[0] === "visibility" && data[1]) {
        const updatedState = { ...state, ...data[1] };
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem("user", JSON.stringify(updatedState));
          }
        } catch (error) {
          console.error("Error updating user data in localStorage:", error);
        }
        return updatedState;
      } else if (data[0] === "followers" && data[1]) {
        // Ensure following is an array
        const following = Array.isArray(state.following) ? state.following : [];
        
        const finalData = {
          ...state,
          following: following.includes(data[1])
            ? following.filter((id) => id !== data[1])
            : [...following, data[1]],
        };

        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem("user", JSON.stringify(finalData));
          }
        } catch (error) {
          console.error("Error updating following data in localStorage:", error);
        }
        return finalData;
      }
      
      return state;
    },
  },
});

export const { login, logout, updateData } = userSlice.actions;
export default userSlice.reducer;
