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
  X,
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

  const [showHeart, setShowHeart] =
    useState(false);

  // =========================
  // LIKE STATE
  // =========================
  const isLiked =
  Array.isArray(vibe?.likedBy) &&
  vibe.likedBy.includes(currentUserId);

console.log("currentUserId:", currentUserId);
console.log("likedBy:", vibe?.likedBy);
console.log("isLiked:", isLiked);

// DOUBLE CLICK LIKE
const handleDoubleClick = () => {
    if (!isLiked) {
      handleLike?.(vibe);
    }

    setShowHeart(true);

    setTimeout(() => {
      setShowHeart(false);
    }, 700);
  };

  return (
    <>
      <motion.div
        initial={{
          opacity: 0,
          y: 25,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
        }}
        className="bg-gradient-to-br from-white/[0.07] to-white/[0.03]
        backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden"
      >

        {/* HEADER */}
        <div className="p-4 flex items-center justify-between">

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
              className="w-11 h-11 rounded-full object-cover border border-pink-500/40"
            />

            <div>

              <h3 className="font-semibold text-white text-sm">
                {userProfile?.username ||
                  "Anonymous"}
              </h3>

              <div className="flex items-center gap-2">

                {userProfile?.mbtiType && (
                  <span className="text-xs text-pink-300">
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
                        {
                          addSuffix: true,
                        }
                      )
                    : ""}
                </p>

              </div>
            </div>
          </Link>
        </div>

        

        {/* IMAGE */}
        {vibe?.imageUrl && (
          <div
            className="relative"
            onDoubleClick={
              handleDoubleClick
            }
          >

            <img
              src={vibe.imageUrl}
              alt="vibe"
              className="w-full max-h-[650px] object-cover"
            />

            {/* BIG HEART */}
            <AnimatePresence>
              {showHeart && (
                <motion.div
                  initial={{
                    scale: 0,
                    opacity: 0,
                  }}
                  animate={{
                    scale: 1.2,
                    opacity: 1,
                  }}
                  exit={{
                    scale: 1.8,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.45,
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >

                  <Heart
  size={120}
  className="fill-red-500 text-red-500 drop-shadow-[0_0_35px_rgba(236,72,153,0.9)]"
/>

                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}

        {/* ACTIONS */}
        <div className="px-4 py-4">

          <div className="flex items-center justify-between">

            {/* LEFT */}
            <div className="flex items-center gap-5">

              {/* LIKE */}
              <motion.button
  whileTap={{ scale: 0.8 }}
  onClick={() => handleLike?.(vibe)}
  className="flex items-center gap-1.5"
>
  <Heart
    size={24}
    strokeWidth={2}
    fill={isLiked ? "currentColor" : "none"}
    className={`transition-all duration-300 ${
      isLiked
        ? "text-red-500"
        : "text-white hover:text-red-400"
    }`}
  />

  <span className="text-sm text-gray-300">
    {vibe?.likes || 0}
  </span>
</motion.button>


              {/* COMMENT */}
              <motion.button
  whileTap={{ scale: 0.85 }}
  onClick={() =>
    setShowComments?.((prev) => ({
      ...prev,
      [vibe?.$id]: !prev?.[vibe?.$id],
    }))
  }
  className="flex items-center gap-1.5"
>
  <MessageCircle
    size={24}
    className="text-white hover:text-cyan-400 transition"
  />

  <span className="text-sm text-gray-300">
    {commentCount || 0}
  </span>
</motion.button>

              {/* SHARE */}
              <motion.button
                whileTap={{
                  scale: 0.85,
                }}
              >

                <Send
                  size={23}
                  className="text-white rotate-[-15deg] hover:text-cyan-400 transition"
                />

              </motion.button>

              {/* REPOST */}
              <motion.button
                whileTap={{
                  scale: 0.85,
                }}
              >

                <Repeat2
                  size={23}
                  className="text-white hover:text-violet-400 transition"
                />

              </motion.button>

            </div>

            {/* BOOKMARK */}
            <motion.button
              whileTap={{
                scale: 0.85,
              }}
            >

              <Bookmark
                size={23}
                className="text-white hover:text-yellow-300 transition"
              />

            </motion.button>

          </div>

          {/* LIKES */}
          <div className="mt-3">

            

            {/* TEXT */}
        {vibe?.vibeText && (
          <div className="px-4 pb-4">
            <p className="text-white whitespace-pre-wrap leading-7 text-[15px]">
              {vibe.vibeText}
            </p>
          </div>
        )}

          </div>
        </div>
      </motion.div>

      {/* COMMENTS MODAL */}
      <AnimatePresence>
        {showComments?.[vibe?.$id] && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed top-[72px] left-0 right-0 bottom-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-end justify-center sm:p-4"
          >

            <motion.div
              initial={{
                y: 100,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              exit={{
                y: 100,
                opacity: 0,
              }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 18,
              }}
              className="w-full sm:max-w-lg h-[70vh] sm:h-[80vh]
              bg-[#0f172a] rounded-t-3xl sm:rounded-3xl
              border border-white/10 overflow-hidden flex flex-col"
            >

              {/* TOP */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">

                <h2 className="text-lg font-semibold text-white">
                  Comments
                </h2>

                <button
                  onClick={() =>
                    setShowComments?.(
                      (prev) => ({
                        ...prev,
                        [vibe?.$id]:
                          false,
                      })
                    )
                  }
                >

                  <X
                    size={24}
                    className="text-white"
                  />

                </button>
              </div>

              {/* COMMENTS */}
              <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">

                {comments.length > 0 ? (
                  comments.map(
                    (comment) => {
                      const commentUser =
                        commentUserProfilesMap?.[
                          comment?.userId
                        ];

                      return (
                        <div
                          key={
                            comment?.$id
                          }
                          className="flex gap-3"
                        >

                          <img
                            src={
                              commentUser?.profilePicUrl ||
                              "/default-avatar.png"
                            }
                            alt="user"
                            className="w-9 h-9 rounded-full object-cover"
                          />

                          <div>

                            <p className="text-sm font-semibold text-pink-300">
                              {commentUser?.username ||
                                "User"}
                            </p>

                            <p className="text-sm text-white mt-1 break-words">
                              {comment?.content}
                            </p>

                          </div>
                        </div>
                      );
                    }
                  )
                ) : (
                  <div className="h-full flex items-center justify-center">

                    <p className="text-gray-400">
                      No comments yet
                    </p>

                  </div>
                )}

              </div>

              {/* COMMENT INPUT */}
              <form
                onSubmit={(e) =>
                  handleCommentSubmit?.(
                    e,
                    vibe?.$id
                  )
                }
                className="border-t border-white/10 p-4 flex items-center gap-3"
              >

                <input
                  value={
                    commentInput?.[
                      vibe?.$id
                    ] || ""
                  }
                  onChange={(e) =>
                    handleCommentChange?.(
                      e,
                      vibe?.$id
                    )
                  }
                  placeholder="Add a comment..."
                  className="flex-1 bg-white/[0.05] border border-white/10 rounded-full px-5 py-3 text-white outline-none"
                />

                <button
                  type="submit"
                  className="text-pink-400 font-semibold"
                >
                  Post
                </button>

              </form>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VibeCard;