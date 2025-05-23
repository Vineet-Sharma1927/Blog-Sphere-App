import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, Navigate, useLocation, useParams, useNavigate } from "react-router-dom";
import { handleFollowCreator } from "./BlogPage";
import { useSelector, useDispatch } from "react-redux";
import DisplayBlogs from "../components/DisplayBlogs";
import api from "../utils/api";

function ProfilePage() {
  const { username } = useParams();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { token, id: userId = null, following = [] } = useSelector((state) => state.user);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function renderComponent() {
    if (!userData) {
      return <p>Loading...</p>;
    }

    if (location.pathname === `/${username}`) {
      return (
        <DisplayBlogs blogs={userData.blogs?.filter((blog) => !blog.draft) || []} />
      );
    } else if (location.pathname === `/${username}/saved-blogs`) {
      return (
        <>
          {userData.showSavedBlogs || userData._id === userId ? (
            <DisplayBlogs blogs={userData.saveBlogs || []} />
          ) : (
            <Navigate to={`/${username}`} />
          )}
        </>
      );
    } else if (location.pathname === `/${username}/draft-blogs`) {
      return (
        <>
          {userData._id === userId ? (
            <DisplayBlogs blogs={userData.blogs?.filter((blog) => blog.draft) || []} />
          ) : (
            <Navigate to={`/${username}`} />
          )}
        </>
      );
    } else {
      return (
        <>
          {userData.showLikedBlogs || userData._id === userId ? (
            <DisplayBlogs blogs={userData.likeBlogs || []} />
          ) : (
            <Navigate to={`/${username}`} />
          )}
        </>
      );
    }
  }

  useEffect(() => {
    async function fetchUserDetails() {
      try {
        setIsLoading(true);
        let res = await api.get(
          `/api/v1/users/${username.split("@")[1]}`
        );
        setUserData(res.data.user);
      } catch (error) {
        console.error("Fetch user error:", error);
        toast.error(error.response?.data?.message || "Failed to load user profile");
      } finally {
        setIsLoading(false);
      }
    }
    
    if (username && username.includes('@')) {
      fetchUserDetails();
    } else {
      // If no valid username or user logged out, redirect to home
      navigate('/');
    }
  }, [username, navigate]);

  return (
    <div className="w-full flex justify-center">
      {isLoading ? (
        <div className="flex justify-center items-center h-[50vh]">
          <span className="loader"></span>
        </div>
      ) : userData ? (
        <div className="w-[80%] flex max-lg:flex-col-reverse justify-evenly ">
          <div className=" max-lg:w-full w-[50%] ">
            <div className="hidden sm:flex justify-between my-10 ">
              <p className="text-4xl font-semibold">{userData.name}</p>
              <i className="fi fi-bs-menu-dots cursor-pointer opacity-70"></i>
            </div>
            <div className=" my-4">
              <nav className="my-4">
                <ul className="flex gap-6">
                  <li>
                    <Link
                      to={`/${username}`}
                      className={`${
                        location.pathname === `/${username}`
                          ? "border-b-2 border-black"
                          : ""
                      }  pb-1`}
                    >
                      Home
                    </Link>
                  </li>
                  {userData.showSavedBlogs || userData._id === userId ? (
                    <li>
                      <Link
                        to={`/${username}/saved-blogs`}
                        className={`${
                          location.pathname === `/${username}/saved-blogs`
                            ? "border-b-2 border-black"
                            : ""
                        }  pb-1`}
                      >
                        Saved <span className="hidden sm:inline">Blogs</span>
                      </Link>
                    </li>
                  ) : null}

                  {userData.showLikedBlogs || userData._id === userId ? (
                    <li>
                      <Link
                        to={`/${username}/liked-blogs`}
                        className={`${
                          location.pathname === `/${username}/liked-blogs`
                            ? "border-b-2 border-black"
                            : ""
                        }  pb-1`}
                      >
                        Liked <span className="hidden sm:inline">Blogs</span>
                      </Link>
                    </li>
                  ) : null}

                  {userData._id === userId ? (
                    <li>
                      <Link
                        to={`/${username}/draft-blogs`}
                        className={`${
                          location.pathname === `/${username}/draft-blogs`
                            ? "border-b-2 border-black"
                            : ""
                        }  pb-1`}
                      >
                        Draft <span className="hidden sm:inline">Blogs</span>
                      </Link>
                    </li>
                  ) : null}
                </ul>
              </nav>

              {renderComponent()}
            </div>
          </div>

          <div className=" max-lg:w-full w-[20%]   lg:border-l max-lg:flex lg:pl-10 lg:min-h-[calc(100vh_-_70px)] ">
            <div className="my-10">
              <div className="w-20 h-20 aspect-square rounded-full overflow-hidden">
                <img
                  src={
                    userData.profilePic
                      ? userData.profilePic
                      : `https://api.dicebear.com/9.x/initials/svg?seed=${userData.name}`
                  }
                  alt={userData.name}
                  className="rounded-full w-full h-full object-cover"
                />
              </div>
              <p className="text-base max-md:text-lg font-medium my-3">
                {userData?.name}
              </p>
              <p>{userData.followers?.length || 0} Followers</p>

              <p className="text-slate-600 text-sm font-normal my-3">
                {userData?.bio}
              </p>

              {userId === userData._id ? (
                <button className="bg-green-600 px-7 py-3  max-lg:w-full rounded-full text-white my-3">
                  <Link to="/edit-profile">Edit Profile</Link>
                </button>
              ) : (
                <button
                  onClick={() =>
                    handleFollowCreator(userData?._id, token, dispatch)
                  }
                  className="bg-green-600 px-7 py-3 rounded-full max-lg:w-full text-white my-3"
                >
                  {following && !following.includes(userData?._id) ? "Follow" : "Following"}
                </button>
              )}

              <div className="my-6 w-full hidden lg:block">
                <h2 className="font-semibold">Following</h2>

                <div className="my-5 ">
                  {userData?.following && userData.following.length > 0 ? (
                    userData.following.map((user) => (
                      <div key={user._id} className="flex justify-between items-center">
                        <Link to={`/@${user.username}`}>
                          <div className="flex gap-2 items-center hover:underline cursor-pointer">
                            <div className="w-4 h-4 aspect-square rounded-full overflow-hidden">
                              <img
                                src={
                                  user?.profilePic
                                    ? user?.profilePic
                                    : `https://api.dicebear.com/9.x/initials/svg?seed=${user.name || 'User'}`
                                }
                                alt=""
                                className="rounded-full w-full h-full object-cover"
                              />
                            </div>
                            <p className="text-base font-medium my-3">
                              {user.name || 'Anonymous'}
                            </p>
                          </div>
                        </Link>
                        <i className="fi fi-bs-menu-dots cursor-pointer opacity-70"></i>
                      </div>
                    ))
                  ) : (
                    <p>No following found</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold">User not found</h1>
          <p className="mt-2">The user you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="inline-block mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg">
            Back to Home
          </Link>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
