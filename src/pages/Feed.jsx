import React, { useEffect, useState } from "react";
import client, { databases, account } from "../appwrite/config";
import VibeCard from "../components/VibeCard";
import { Query, ID } from "appwrite";
import { useUser } from "../hooks/useUser";
import Stories from "../components/Stories";
import { createLikeNotification } from "../lib/notifications";
import { createCommentNotification } from "../lib/notifications";

const Feed = () => {
  const [vibes, setVibes] = useState([]);
  const [commentUserProfilesMap, setCommentUserProfilesMap] = useState({});
  const [commentInput, setCommentInput] = useState({});
  const [commentsMap, setCommentsMap] = useState({});
  const [commentsCountMap, setCommentsCountMap] = useState({});
  const [showComments, setShowComments] = useState({});
  const [userProfilesMap, setUserProfilesMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("same-mbti");
  const [currentUserId, setCurrentUserId] = useState(null);

 const auth = useUser() || {};

const user = auth.user;
const userId = auth.userId;
const loading = auth.loading;
  // =========================
  // CREATE PROFILE IF MISSING
  // =========================
  const ensureUserProfile = async (currentUser) => {
    try {
      const response = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID,
        [Query.equal("userId", currentUser.$id)]
      );

      if (response.total === 0) {
        await databases.createDocument(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID,
          ID.unique(),
          {
            userId: currentUser.$id,
            email: currentUser.email,
            username: currentUser.name || "User",
            mbtiType: "",
            profilePicUrl: "",
            createdAt: new Date().toISOString(),
          }
        );
      }
    } catch (err) {
      console.error("Profile creation failed:", err);
    }
  };

  // =========================
  // FETCH USER PROFILES
  // =========================
  const fetchUserProfiles = async () => {
    try {
      const res = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID
      );

      const userMap = {};

      res.documents.forEach((profile) => {
        userMap[profile.userId] = profile;
      });

      setUserProfilesMap(userMap);
    } catch (err) {
      console.error("Failed to fetch profiles:", err);
    }
  };

  // =========================
  // FETCH VIBES
  // =========================
  const fetchVibes = async () => {
    try {
      setIsLoading(true);

      const response = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_COLLECTION_ID,
        [Query.orderDesc("$createdAt")]
      );

      let vibesData = response.documents;

      const currentUserProfile = userProfilesMap?.[userId];

      if (
        filter === "same-mbti" &&
        currentUserProfile?.mbtiType
      ) {
        const currentMBTI = currentUserProfile.mbtiType;

        vibesData = vibesData.filter((vibe) => {
          const authorProfile = userProfilesMap[vibe.userId];

          return authorProfile?.mbtiType === currentMBTI;
        });
      }

      setVibes(vibesData);
    } catch (err) {
      console.error("Failed to fetch vibes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // =========================
  // FETCH COMMENTS
  // =========================
  const fetchComments = async () => {
    try {
      const res = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID
      );

      const grouped = res.documents.reduce(
        (acc, comment) => {
          if (!acc.map[comment.vibeId]) {
            acc.map[comment.vibeId] = [];
          }

          acc.map[comment.vibeId].push(comment);

          acc.counts[comment.vibeId] =
            (acc.counts[comment.vibeId] || 0) + 1;

          return acc;
        },
        {
          map: {},
          counts: {},
        }
      );

      setCommentsMap(grouped.map);
      setCommentsCountMap(grouped.counts);

      await fetchCommentUserProfiles(res.documents);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  };

  // =========================
  // FETCH COMMENT USER PROFILES
  // =========================
  const fetchCommentUserProfiles = async (comments) => {
    try {
      const uniqueUserIds = [
        ...new Set(comments.map((c) => c.userId)),
      ];

      const profiles = {};

      for (const uid of uniqueUserIds) {
        const res = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID,
          [Query.equal("userId", uid)]
        );

        if (res.documents[0]) {
          profiles[uid] = res.documents[0];
        }
      }

      setCommentUserProfilesMap(profiles);
    } catch (err) {
      console.error("Failed comment profile fetch:", err);
    }
  };

  // =========================
  // LIKE
  // =========================
  const handleLike = async (vibe) => {
    try {
      const currentUser = await account.get();

      const likedByList = Array.isArray(vibe?.likedBy)
        ? vibe.likedBy
        : [];

      const currentLikes =
        typeof vibe?.likes === "number"
          ? vibe.likes
          : 0;

      const hasLiked = likedByList.includes(
        currentUser.$id
      );

      const updatedLikedBy = hasLiked
        ? likedByList.filter(
            (id) => id !== currentUser.$id
          )
        : [...likedByList, currentUser.$id];

      const updatedLikes = hasLiked
        ? Math.max(currentLikes - 1, 0)
        : currentLikes + 1;

      const updated = await databases.updateDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_COLLECTION_ID,
        vibe.$id,
        {
          likedBy: updatedLikedBy,
          likes: updatedLikes,
        }
      );

      setVibes((prev) =>
        prev.map((v) =>
          v.$id === vibe.$id
            ? { ...v, ...updated }
            : v
        )
      );

      if (!hasLiked) {
        await createLikeNotification(
          vibe.userId,
          currentUser.$id,
          vibe.$id
        );
      }
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  // =========================
  // COMMENT
  // =========================
  const handleCommentChange = (e, vibeId) => {
    setCommentInput((prev) => ({
      ...prev,
      [vibeId]: e.target.value,
    }));
  };

  const handleCommentSubmit = async (
    e,
    vibeId
  ) => {
    e.preventDefault();

    try {
      const currentUser = await account.get();

      const comment = commentInput[vibeId];

      if (!comment?.trim()) return;

      await databases.createDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID,
        ID.unique(),
        {
          vibeId,
          userId: currentUser.$id,
          content: comment.trim(),
          createdAt: new Date().toISOString(),
        }
      );

      setCommentInput((prev) => ({
        ...prev,
        [vibeId]: "",
      }));

      await fetchComments();

      const vibe = vibes.find(
        (v) => v.$id === vibeId
      );

      if (vibe) {
        await createCommentNotification(
          vibe.userId,
          currentUser.$id,
          vibeId
        );
      }
    } catch (err) {
      console.error("Comment failed:", err);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    const initializeFeed = async () => {
      try {
        console.log("Feed Rendered");
console.log(vibes);
console.log(userProfilesMap);
        const currentUser = await account.get();

        setCurrentUserId(currentUser.$id);

        await ensureUserProfile(currentUser);

        await fetchUserProfiles();
      } catch (err) {
        console.error(
          "Initialization failed:",
          err
        );
      }
    };

    initializeFeed();
  }, []);

  // =========================
  // REALTIME COMMENTS
  // =========================
  useEffect(() => {
    const unsubscribe = client.subscribe(
      `databases.${import.meta.env.VITE_APPWRITE_DATABASE_ID}.collections.${import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID}.documents`,
      () => {
        fetchComments();
      }
    );

    return () => unsubscribe();
  }, []);

  // =========================
  // FETCH DATA
  // =========================
  useEffect(() => {
    if (
      !loading &&
      user &&
      currentUserId
    ) {
      fetchVibes();
      fetchComments();
    }
  }, [
    loading,
    user,
    currentUserId,
    filter,
  ]);

  // =========================
  // REFETCH VIBES AFTER PROFILES LOAD
  // =========================
  useEffect(() => {
    if (
      Object.keys(userProfilesMap).length > 0
    ) {
      fetchVibes();
    }
  }, [userProfilesMap]);

  // =========================
  // LOADING
  // =========================
  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center text-white">
        Loading Vibes...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b1120] text-white">
      
      {/* Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-120px] left-[-80px] w-[300px] h-[300px] bg-pink-500/20 blur-3xl rounded-full" />

        <div className="absolute bottom-[-120px] right-[-80px] w-[320px] h-[320px] bg-violet-500/20 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-5">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">

          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              VibeSoul
            </h1>

            <p className="text-sm text-gray-400 mt-1">
              Feel the vibe of your tribe ✨
            </p>
          </div>

          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value)
            }
            className="px-4 py-2 rounded-2xl bg-white/[0.06] border border-white/10"
          >
            <option
              value="all"
              className="bg-black"
            >
              All Vibes
            </option>

            <option
              value="same-mbti"
              className="bg-black"
            >
              Soul Vibes
            </option>
          </select>
        </div>

        {/* Stories */}
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-2">
          <Stories currentUser={user} />
        </div>

        {/* Feed */}
        <div className="space-y-6">
          {vibes.length > 0 ? (
            vibes.map((vibe) => (
              
              <VibeCard
                key={vibe.$id}
                vibe={vibe}
                currentUserId={userId}
                commentInput={commentInput}
                commentsMap={commentsMap}
                showComments={showComments}
                handleLike={handleLike}
                handleCommentSubmit={(e) =>
                  handleCommentSubmit(
                    e,
                    vibe.$id
                  )
                }
                handleCommentChange={
                  handleCommentChange
                }
                setShowComments={
                  setShowComments
                }
                commentCount={
                  commentsCountMap[
                    vibe.$id
                  ] || 0
                }
                commentUserProfilesMap={
                  commentUserProfilesMap
                }
                userProfile={
                  userProfilesMap[
                    vibe.userId
                  ]
                }
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <h2 className="text-2xl font-semibold">
                No vibes yet
              </h2>

              <p className="text-gray-400 mt-2 max-w-sm">
                Follow more souls or post your
                first vibe ✨
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;