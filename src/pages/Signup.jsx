import React, { useState } from "react";
import { account, databases } from "../appwrite/config";
import { ID, Query } from "appwrite";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const Signup = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (loading) return;

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // =========================
    // NAME VALIDATION
    // =========================
    if (trimmedName.length < 3) {
      toast.error("Name must be at least 3 characters");
      return;
    }

    if (trimmedName.length > 30) {
      toast.error("Name too long");
      return;
    }

    // =========================
    // PASSWORD VALIDATION
    // =========================
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(cleanPassword)) {
      toast.error(
        "Password must contain uppercase, lowercase, number and special character"
      );
      return;
    }

    try {
      setLoading(true);

      // =========================
      // CHECK EXISTING USER PROFILE
      // =========================
      const existingProfiles = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID,
        [Query.equal("email", normalizedEmail)]
      );

      if (existingProfiles.total > 0) {
        toast.error("Account already exists");
        return;
      }

      // =========================
      // CREATE ACCOUNT
      // =========================
      await account.create(
        ID.unique(),
        normalizedEmail,
        cleanPassword,
        trimmedName
      );

      // =========================
      // LOGIN USER
      // =========================
      await account.createEmailPasswordSession(
        normalizedEmail,
        cleanPassword
      );

      // =========================
      // GET CURRENT USER
      // =========================
      const currentUser = await account.get();

      // =========================
      // CREATE USER PROFILE
      // =========================
      await databases.createDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID,
        ID.unique(),
        {
          userId: currentUser.$id,
          email: currentUser.email,
          username: trimmedName,
          mbtiType: "",
          profilePicUrl: "",
          createdAt: new Date().toISOString(),
        }
      );

      toast.success("Account created successfully!");

      navigate("/feed");

    } catch (err) {
      console.error("Signup Error:", err);

      if (err.code === 409) {
        toast.error("Account already exists");
      } else if (err.code === 429) {
        toast.error("Too many requests. Try again later.");
      } else if (err.message) {
        toast.error(err.message);
      } else {
        toast.error("Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center relative overflow-hidden px-6">

      {/* Background Glow */}
      <div className="absolute top-[-100px] left-[-100px] w-[350px] h-[350px] bg-pink-500/20 blur-3xl rounded-full"></div>

      <div className="absolute bottom-[-100px] right-[-100px] w-[350px] h-[350px] bg-violet-500/20 blur-3xl rounded-full"></div>

      {/* Main Container */}
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-10 items-center z-10">

        {/* Left Section */}
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
            Join a world where personalities connect through vibes,
            emotions, memes, and stories that truly resonate.
          </p>

          {/* MBTI Pills */}
          <div className="flex flex-wrap gap-3 mt-8">
            {["INFJ", "ENFP", "INTJ", "ISFP", "ENTP"].map((type) => (
              <div
                key={type}
                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 backdrop-blur-md"
              >
                {type}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Signup Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl"
        >

          <div className="text-center">
            <h2 className="text-4xl font-bold text-white">
              Create Account
            </h2>

            <p className="text-gray-400 mt-3">
              Start your VibeSoul journey today.
            </p>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSignup}
            className="mt-10 space-y-5"
          >

            {/* NAME */}
            <div>
              <label className="text-sm text-gray-300 block mb-2">
                Full Name
              </label>

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
                autoComplete="name"
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

            {/* EMAIL */}
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
                required
                autoComplete="email"
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

            {/* PASSWORD */}
            <div>
              <label className="text-sm text-gray-300 block mb-2">
                Password
              </label>

              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                autoComplete="new-password"
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

            {/* BUTTON */}
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
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </motion.button>

            {/* LOGIN LINK */}
            <p className="text-center text-gray-400 pt-3">
              Already have an account?{" "}

              <Link
                to="/"
                className="text-pink-400 hover:text-pink-300 transition"
              >
                Login
              </Link>
            </p>

          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;