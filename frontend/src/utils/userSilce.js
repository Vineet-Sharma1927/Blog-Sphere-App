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

// Safely parse localStorage data
const getUserFromStorage = () => {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : initialUserState;
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
    return initialUserState;
  }
};

const userSlice = createSlice({
  name: "userSlice",
  initialState: getUserFromStorage(),
  reducers: {
    login(state, action) {
      const userData = { followers: [], following: [], ...action.payload };
      try {
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (error) {
        console.error("Error saving user data to localStorage:", error);
      }
      return userData;
    },
    logout(state, action) {
      try {
        localStorage.removeItem("user");
      } catch (error) {
        console.error("Error removing user data from localStorage:", error);
      }
      return {
        token: null,
      };
    },

    updateData(state, action) {
      const data = action.payload;
      if (data[0] === "visibility") {
        const updatedState = { ...state, ...data[1] };
        try {
          localStorage.setItem("user", JSON.stringify(updatedState));
        } catch (error) {
          console.error("Error updating user data in localStorage:", error);
        }
        return updatedState;
      } else if (data[0] === "followers") {
        const finalData = {
          ...state,
          following: state?.following?.includes(data[1])
            ? state?.following?.filter((id) => id !== data[1])
            : [...state.following, data[1]],
        };

        try {
          localStorage.setItem("user", JSON.stringify(finalData));
        } catch (error) {
          console.error("Error updating following data in localStorage:", error);
        }
        return finalData;
      }
    },
  },
});

export const { login, logout, updateData } = userSlice.actions;
export default userSlice.reducer;
