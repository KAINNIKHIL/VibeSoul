import { Link } from "react-router-dom";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

import {
  Heart,
  Send,
  Bookmark,
  Repeat2,
  MessageCircle,
} from "lucide-react";

const VibeCard = ({
  vibe,
  userProfile,
  currentUserId,
  commentInput,
  commentsMap,
  showComments,
  handleLike,
  handleCommentSubmit,
  handleCommentChange,
  setShowComments,
  commentUserProfilesMap,
  commentCount,
}) => {
  if (!vibe) return null;

  const comments = commentsMap?.[vibe?.$id] || [];

  const [showHeart, setShowHeart] = useState(false);

  const handleDoubleClick = () => {
    if (!vibe?.likedBy?.includes(currentUserId)) {
      handleLike?.(vibe);
    }

    setShowHeart(true);

    setTimeout(() => {
      setShowHeart(false);
    }, 700);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gradient-to-br from-white/[0.07] to-white/[0.03] backdrop-blur-2xl p-4 sm:p-5 rounded-3xl border border-white/10 shadow-xl"
    >

      {/* HEADER */}
      <div className="flex items-center justify-between">

        <Link
          to={
            vibe?.userId === currentUserId
              ? "/profile"
              : `/profile/${vibe?.userId}`
          }
          className="flex items-center gap-3"
        >

          <img
            src={
              userProfile?.profilePicUrl ||
              "/default-avatar.png"
            }
            alt="user"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-pink-500/40"
          />

          <div>

            <h3 className="font-semibold text-white text-[15px] sm:text-base">
              {userProfile?.username || "Anonymous"}
            </h3>

            <div className="flex items-center gap-2 mt-[2px]">

              {userProfile?.mbtiType && (
                <span className="text-xs text-pink-300 font-medium">
                  {userProfile.mbtiType}
                </span>
              )}

              <span className="text-gray-500 text-xs">
                •
              </span>

              <p className="text-xs text-gray-500">
                {vibe?.createdAt
                  ? formatDistanceToNow(
                      new Date(vibe.createdAt),
                      { addSuffix: true }
                    )
                  : ""}
              </p>

            </div>
          </div>
        </Link>
      </div>

      {/* TEXT */}
      {vibe?.vibeText && (
        <div className="mt-4">
          <p className="text-gray-100 text-[15px] sm:text-[16px] leading-7 whitespace-pre-wrap">
            {vibe.vibeText}
          </p>
        </div>
      )}

      {/* IMAGE */}
      {vibe?.imageUrl && (
        <div
          className="relative mt-4 overflow-hidden rounded-3xl"
          onDoubleClick={handleDoubleClick}
        >

          <img
            src={vibe.imageUrl}
            alt="vibe"
            className="w-full max-h-[550px] object-cover"
          />

          <AnimatePresence>
            {showHeart && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.3, opacity: 1 }}
                exit={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 0.45 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Heart
                  size={110}
                  className="fill-white text-white drop-shadow-2xl"
                />
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      )}

      {/* ACTIONS */}
      <div className="flex items-center justify-between mt-4 px-1">

        {/* LEFT */}
        <div className="flex items-center gap-5">

          {/* LIKE */}
          <button
            onClick={() => handleLike?.(vibe)}
            className="group transition-all duration-200 active:scale-90"
          >
            <Heart
              size={24}
              strokeWidth={2}
              className={`transition-all duration-300 ${
                vibe?.likedBy?.includes(currentUserId)
                  ? "fill-red-500 text-red-500 scale-110"
                  : "text-white/90 group-hover:text-red-400"
              }`}
            />
          </button>

          {/* COMMENT */}
          <button
            onClick={() =>
              setShowComments?.((prev) => ({
                ...prev,
                [vibe?.$id]: !prev?.[vibe?.$id],
              }))
            }
            className="group transition-all duration-200 active:scale-90"
          >
            <MessageCircle
              size={23}
              strokeWidth={2}
              className="text-white/90 group-hover:text-cyan-400 transition-all duration-300"
            />
          </button>

          {/* SHARE */}
          <button className="group transition-all duration-200 active:scale-90">
            <Send
              size={22}
              strokeWidth={2}
              className="text-white/90 rotate-[-15deg] group-hover:text-cyan-400 transition-all duration-300"
            />
          </button>

          {/* REPOST */}
          <button className="group transition-all duration-200 active:scale-90">
            <Repeat2
              size={22}
              strokeWidth={2}
              className="text-white/90 group-hover:text-violet-400 transition-all duration-300"
            />
          </button>

        </div>

        {/* BOOKMARK */}
        <button className="group transition-all duration-200 active:scale-90">
          <Bookmark
            size={23}
            strokeWidth={2}
            className="text-white/90 group-hover:text-yellow-300 transition-all duration-300"
          />
        </button>

      </div>

      {/* STATS */}
      <div className="mt-3 px-1 space-y-1">

        <p className="text-sm font-semibold text-white">
          {vibe?.likes || 0} vibes
        </p>

        {commentCount > 0 && (
          <button
            onClick={() =>
              setShowComments?.((prev) => ({
                ...prev,
                [vibe?.$id]: !prev?.[vibe?.$id],
              }))
            }
            className="text-sm text-gray-400 hover:text-gray-300 transition"
          >
            View all {commentCount} comments
          </button>
        )}

      </div>

      {/* COMMENTS */}
      <AnimatePresence>
        {showComments?.[vibe?.$id] && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 space-y-4"
          >

            {comments.length > 0 ? (
              comments.map((comment) => {
                const commentUser =
                  commentUserProfilesMap?.[
                    comment?.userId
                  ];

                return (
                  <div
                    key={comment?.$id}
                    className="flex items-start gap-3"
                  >

                    <img
                      src={
                        commentUser?.profilePicUrl ||
                        "/default-avatar.png"
                      }
                      alt="user"
                      className="w-8 h-8 rounded-full object-cover"
                    />

                    <div className="flex-1">

                      <div className="bg-white/[0.05] rounded-2xl px-4 py-3">

                        <p className="text-sm font-medium text-pink-300">
                          {commentUser?.username ||
                            "User"}
                        </p>

                        <p className="text-sm text-white mt-1 break-words">
                          {comment?.content || ""}
                        </p>

                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-400 text-sm">
                No comments yet
              </p>
            )}

          </motion.div>
        )}
      </AnimatePresence>

      {/* COMMENT INPUT */}
      <form
        onSubmit={(e) =>
          handleCommentSubmit?.(e, vibe?.$id)
        }
        className="mt-5 flex items-center gap-3"
      >

        <input
          value={commentInput?.[vibe?.$id] || ""}
          onChange={(e) =>
            handleCommentChange?.(e, vibe?.$id)
          }
          placeholder="Add a comment..."
          className="flex-1 px-4 py-3 rounded-2xl bg-white/[0.05] border border-white/10 text-white placeholder:text-gray-500 outline-none focus:border-pink-500/40"
        />

        <button
          type="submit"
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 text-white font-medium hover:scale-105 active:scale-95 transition-all duration-200"
        >
          Post
        </button>

      </form>
    </motion.div>
  );
};

export default VibeCard;