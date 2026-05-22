import React, { useEffect, useState, useRef } from "react";
import {
  account,
  databases,
  storage,
  IDUtils as ID,
} from "../appwrite/config";

import { Query } from "appwrite";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const validMbti = [
  "INTJ","INTP","ENTJ","ENTP",
  "INFJ","INFP","ENFJ","ENFP",
  "ISTJ","ISFJ","ESTJ","ESFJ",
  "ISTP","ISFP","ESTP","ESFP"
];

const EditProfile = () => {

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [userDocId, setUserDocId] = useState(null);

  const [formData, setFormData] = useState({
    username: "",
    mbtiType: "",
    bio: "",
    profilePicUrl: "",
    profilePicId: "",
  });

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // FETCH USER + PROFILE
  useEffect(() => {

    const init = async () => {
      try {

        const userData = await account.get();

        const profileRes = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID,
          [Query.equal("userId", userData.$id)]
        );

        if (profileRes.documents.length > 0) {

          const doc = profileRes.documents[0];

          setUserDocId(doc.$id);

          setFormData({
            username: doc.username || "",
            mbtiType: doc.mbtiType || "",
            bio: doc.bio || "",
            profilePicUrl: doc.profilePicUrl || "",
            profilePicId: doc.profilePicId || "",
          });
        }

      } catch (error) {
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    init();

  }, []);

  // IMAGE UPLOAD
  const handleFileChange = async (e) => {

    const file = e.target.files[0];

    if (!file) return;

    // IMAGE VALIDATION
    if (!file.type.startsWith("image/")) {
      toast.error("Only images allowed");
      return;
    }

    // SIZE VALIDATION
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max size is 5MB");
      return;
    }

    setIsUploading(true);

    try {

      

      // UPLOAD NEW IMAGE
      const uploadedFile = await storage.createFile(
        import.meta.env.VITE_APPWRITE_BUCKET_ID,
        ID.unique(),
        file
      );

      const previewUrl =
  storage
    .getFileView(
      import.meta.env.VITE_APPWRITE_BUCKET_ID,
      uploadedFile.$id
    )
    .toString();

      // UPDATE STATE
      setFormData((prev) => ({
        ...prev,
         profilePicUrl: previewUrl,
        profilePicId: uploadedFile.$id,
      }));

     
      

      toast.success("Image uploaded");

    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  // SUBMIT
  const handleSubmit = async (e) => {

    e.preventDefault();

    // USERNAME VALIDATION
    if (formData.username.trim().length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      toast.error(
        "Username can only contain letters, numbers, and underscores"
      );
      return;
    }

    // MBTI VALIDATION
    if (
      formData.mbtiType &&
      !validMbti.includes(formData.mbtiType)
    ) {
      toast.error("Invalid MBTI type");
      return;
    }

    try {

      setIsSaving(true);

      await databases.updateDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID,
        userDocId,
        formData
      );

      toast.success("Profile updated!");

      navigate("/profile");

    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // LOGOUT
  const handleLogout = async () => {

    try {

      await account.deleteSession("current");

      toast.success("Logged out");

      navigate("/");

    } catch (error) {
      toast.error("Logout failed");
    }
  };

  // LOADING SCREEN
  if (loading) {
    if (loading) {
  return (
    <div className="min-h-screen bg-[#0b1120] px-4 py-10">

      <div className="max-w-2xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 animate-pulse">

        {/* Heading */}
        <div className="h-8 w-48 bg-white/10 rounded mb-8" />

        {/* Avatar */}
        <div className="flex justify-center mb-8">
          <div className="w-28 h-28 rounded-full bg-white/10" />
        </div>

        {/* Username */}
        <div className="space-y-2 mb-6">
          <div className="h-4 w-24 bg-white/10 rounded" />
          <div className="h-12 w-full bg-white/10 rounded-2xl" />
        </div>

        {/* MBTI */}
        <div className="space-y-2 mb-6">
          <div className="h-4 w-20 bg-white/10 rounded" />

          <div className="flex gap-2">
            <div className="h-12 flex-1 bg-white/10 rounded-2xl" />
            <div className="h-12 w-24 bg-white/10 rounded-2xl" />
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2 mb-6">
          <div className="h-4 w-16 bg-white/10 rounded" />
          <div className="h-32 w-full bg-white/10 rounded-2xl" />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-8">
          <div className="h-12 flex-1 bg-white/10 rounded-2xl" />
          <div className="h-12 w-28 bg-white/10 rounded-2xl" />
        </div>

      </div>
    </div>
  );
}
  }

  return (
    <div className="min-h-screen bg-[#0b1120] text-white px-4 py-10">

      <div className="max-w-2xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">

        <h2 className="text-3xl font-bold mb-8">
          Edit Profile ✨
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* PROFILE IMAGE */}
          <div className="flex flex-col items-center">

            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current.click()}
            >

              <img
  key={formData.profilePicUrl}
  src={
    formData.profilePicUrl ||
    "/default-avatar.png"
  }
  alt="Profile"
  className="w-28 h-28 rounded-full object-cover border-4 border-pink-500/40"
/>
              {/* OVERLAY */}
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-sm">
                Change
              </div>

              {/* UPLOADING */}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full text-xs">
                  Uploading...
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="mt-3 text-sm text-pink-400 hover:text-pink-300"
            >
              Change Photo
            </button>
          </div>

          {/* USERNAME */}
          <input
            name="username"
            value={formData.username}
            onChange={(e) =>
              setFormData({
                ...formData,
                username: e.target.value.replace(/\s/g, ""),
              })
            }
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10"
            placeholder="Username"
          />

          {/* MBTI */}
          <div className="flex gap-2">

            <input
              name="mbtiType"
              value={formData.mbtiType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  mbtiType: e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z]/g, "")
                    .slice(0, 4),
                })
              }
              className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10"
              placeholder="MBTI"
            />

            <button
              type="button"
              onClick={() => navigate("/mbti-test")}
              className="px-4 rounded-xl bg-pink-500 hover:bg-pink-600 transition"
            >
              Test
            </button>

          </div>

          {/* BIO */}
          <div>

            <textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bio: e.target.value,
                })
              }
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10"
              placeholder="Bio"
              maxLength={150}
            />

            <p className="text-xs text-right text-gray-400 mt-1">
              {formData.bio.length}/150
            </p>

          </div>

          {/* BUTTONS */}
          <div className="flex gap-3">

            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Update"}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="px-5 py-3 rounded-xl border border-white/10"
            >
              Logout
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default EditProfile;