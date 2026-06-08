import React, { useEffect, useState } from "react";
import { account, databases, IDUtils } from "../appwrite/config";
import { useNavigate, Link } from "react-router-dom";
import { Query } from "appwrite";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useUser } from "../hooks/useUser";

const Login = () => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const navigate = useNavigate();

  const { refetch } = useUser();

  const handleGoogleLogin = async () => {
  try {
    await account.createOAuth2Session(
      "google",
      `${window.location.origin}/feed`,
      `${window.location.origin}/login`
    );
  } catch (error) {
    console.error(error);
    toast.error("Google login failed");
  }
};


  // Check Existing Session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await account.get();

        console.log("Already Logged In:", user);

        setLoggedIn(true);
        navigate("/feed");
      } catch {
        console.log("No active session");
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [navigate]);

  // Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (loggedIn) {
      toast.info("You're already logged in!");
      navigate("/feed");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanPassword = pass.trim();

    if (!normalizedEmail || !cleanPassword) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      // Create Session
      await account.createEmailPasswordSession(
        normalizedEmail,
        cleanPassword
      );

      await refetch();

      // Get Current User
      const user = await account.get();
      const userId = user.$id;

      // Check Profile
      const response = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID,
        [Query.equal("userId", userId)]
      );

      // Create Profile If Missing
      if (response.total === 0) {
        await databases.createDocument(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID,
          IDUtils.unique(),
          {
            userId: userId,
            email: user.email,
            username: user.name,
            mbtiType: "",
            profilePicUrl: "",
            createdAt: new Date().toISOString(),
          }
        );

        
      }

      

      navigate("/feed");

    } catch (err) {
      console.error("Login Error:", err);

      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  // Prevent UI Flash
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center relative overflow-hidden px-6">

      {/* Background Blobs */}
      <div className="absolute top-[-100px] left-[-100px] w-[350px] h-[350px] bg-pink-500/20 blur-3xl rounded-full"></div>

      <div className="absolute bottom-[-100px] right-[-100px] w-[350px] h-[350px] bg-violet-500/20 blur-3xl rounded-full"></div>

      {/* Main Container */}
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-10 items-center z-10">

        {/* Left Side */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="hidden lg:block"
        >
          <h1 className="text-6xl font-extrabold text-white leading-tight">
            <span className="text-pink-500">Vibe</span>
            <span className="text-white">Soul</span>
          </h1>

          <p className="mt-6 text-gray-300 text-xl max-w-md leading-relaxed">
            Find your people by vibe.
            Share your thoughts, emotions, memes, and energy with personalities
            that truly resonate with you.
          </p>
        </motion.div>

       
        {/* Login Card */}
<motion.div
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.7 }}
  className="backdrop-blur-xl bg-white/[0.06] border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl m-2"
>

<div className="lg:hidden text-center mb-8">
  <h1 className="text-5xl font-extrabold">
    <span className="text-pink-500">Vibe</span>
    <span className="text-white">Soul</span>
  </h1>

  <p className="text-gray-400 mt-3 text-sm">
    Find your people by vibe
  </p>
</div>

          <div className="text-center">
            <h2 className="text-4xl font-bold text-white">
              Welcome Back
            </h2>

            <p className="text-gray-400 mt-3">
              Login to continue your vibe journey.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="mt-10 space-y-5">

            {/* Email */}
            <div>
              <label className="text-sm text-gray-300 block mb-2">
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                required
                className="
                  w-full
                  px-4
                  py-3
                  rounded-2xl
                  bg-white/5
                  border border-white/10
                  text-white
                  placeholder:text-gray-500
                  focus:outline-none
                  focus:ring-2
                  focus:ring-pink-500/40
                  focus:border-pink-500
                  transition
                  disabled:opacity-50
                "
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-gray-300 block mb-2">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                required
                className="
                  w-full
                  px-4
                  py-3
                  rounded-2xl
                  bg-white/5
                  border border-white/10
                  text-white
                  placeholder:text-gray-500
                  focus:outline-none
                  focus:ring-2
                  focus:ring-pink-500/40
                  focus:border-pink-500
                  transition
                  disabled:opacity-50
                "
              />
            </div>

            {/* Button */}
            <motion.button
              disabled={loading}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              type="submit"
              className="
                w-full
                py-3
                rounded-2xl
                bg-gradient-to-r
                from-pink-500
                to-violet-500
                text-white
                font-semibold
                shadow-lg
                shadow-pink-500/20
                hover:shadow-pink-500/40
                transition
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {loading ? "Logging In..." : "Login"}
            </motion.button>

            

          
        <div className="flex items-center gap-4 py-1">
  

  
</div>

<div className="space-y-4">
  <div className="flex items-center gap-4">
    <div className="h-px flex-1 bg-white/10"></div>

    <span className="text-xs text-gray-500 uppercase tracking-wider whitespace-nowrap">
      Or continue with
    </span>

    <div className="h-px flex-1 bg-white/10"></div>
  </div>

  <motion.button
    whileHover={{ scale: 1.02 }}
    onClick={handleGoogleLogin}
    whileTap={{ scale: 0.98 }}
    type="button"
    className="
      w-full
      py-3
      rounded-2xl
      bg-white
      text-gray-900
      font-medium
      flex
      items-center
      justify-center
      gap-3
      hover:bg-gray-100
      transition
    "
  >
    {/* Google Icon */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      className="w-5 h-5"
    >
      ...
    </svg>

    Continue with Google
  </motion.button>
</div>

{/* Signup Link */}
            <p className="text-center text-gray-400 pt-3">
              Don’t have an account?{" "}
              <Link
                to="/signup"
                className="text-pink-400 hover:text-pink-300 transition"
              >
                Create one
              </Link>
            </p>
</form>
        </motion.div>

        
      </div>
    </div>
  );
};

export default Login;