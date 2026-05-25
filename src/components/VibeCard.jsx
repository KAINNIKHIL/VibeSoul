import { Link } from "react-router-dom";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

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
  // 🔥 CRITICAL SAFETY CHECK (prevents white screen)
  if (!vibe) return null;

  const comments = commentsMap?.[vibe?.$id] || [];

  const [showHeart, setShowHeart] = useState(false);

  const handleDoubleClick = () => {
    handleLike?.(vibe);

    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 700);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gradient-to-br from-white/[0.07] to-white/[0.03] backdrop-blur-2xl p-5 rounded-3xl border border-white/10"
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
            src={userProfile?.profilePicUrl || "/default-avatar.png"}
            alt="user"
            className="w-12 h-12 rounded-full object-cover border-2 border-pink-500/50"
          />

          <div>
            <h3 className="font-semibold text-white">
              {userProfile?.username || "Anonymous"}
            </h3>

            {userProfile?.mbtiType && (
              <span className="text-xs text-pink-300">
                {userProfile.mbtiType}
              </span>
            )}

            <p className="text-xs text-gray-500 mt-1">
              {vibe?.createdAt
                ? formatDistanceToNow(new Date(vibe.createdAt), {
                    addSuffix: true,
                  })
                : ""}
            </p>
          </div>
        </Link>
      </div>

      {/* TEXT */}
      <div className="mt-5">
        <p className="text-gray-100 text-[17px] leading-8 whitespace-pre-wrap">
          {vibe?.vibeText || ""}
        </p>
      </div>

      {/* IMAGE */}
      {vibe?.imageUrl && (
        <div className="relative mt-5" onDoubleClick={handleDoubleClick}>
          <img
            src={vibe.imageUrl}
            alt="vibe"
            className="rounded-3xl max-h-[550px] w-full object-cover"
          />

          <AnimatePresence>
            {showHeart && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.4, opacity: 1 }}
                exit={{ scale: 1.8, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center text-7xl"
              >
                ❤️
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex items-center justify-between mt-5">
        <button
          onClick={() =>
            setShowComments?.((prev) => ({
              ...prev,
              [vibe?.$id]: !prev?.[vibe?.$id],
            }))
          }
          className="text-sm text-gray-400"
        >
          💬 {commentCount || 0} comments
        </button>

        <button
          onClick={() => handleLike?.(vibe)}
          className="px-4 py-2 rounded-full bg-pink-500 text-white"
        >
          ❤️ {vibe?.likes || 0}
        </button>
      </div>

      {/* COMMENTS */}
      <AnimatePresence>
        {showComments?.[vibe?.$id] && (
          <motion.div className="mt-5 space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment?.$id} className="border-l-2 pl-3 border-pink-500">
                  <p className="text-sm text-white">
                    {comment?.content || ""}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No comments yet</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMMENT INPUT */}
      <form
        onSubmit={(e) => handleCommentSubmit?.(e, vibe?.$id)}
        className="mt-5 flex gap-3"
      >
        <input
          value={commentInput?.[vibe?.$id] || ""}
          onChange={(e) => handleCommentChange?.(e, vibe?.$id)}
          placeholder="Write comment..."
          className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-white"
        />

        <button className="px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-500 rounded-xl">
          Send
        </button>
      </form>
    </motion.div>
  );
};

export default VibeCard;