import React from "react";
import { motion } from "framer-motion";

const StoryBar = ({ stories = [], onStoryClick, loading = false }) => {
  // 🔥 Skeleton Loader
  if (loading) {
    return (
      <div className="flex items-center gap-4 overflow-x-auto px-2 py-2 scrollbar-hide">

        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center animate-pulse">

            {/* Ring skeleton (gradient feel) */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500/10 via-violet-500/10 to-cyan-500/10 flex items-center justify-center">

              <div className="w-12 h-12 rounded-full bg-white/10" />

            </div>

            {/* Username skeleton */}
            <div className="w-10 h-2 mt-2 bg-white/10 rounded" />

          </div>
        ))}

      </div>
    );
  }



  return (
    <div
      className="
        flex
        items-center
        gap-4
        overflow-x-auto
        px-2
        py-2
        scrollbar-hide
        scroll-smooth
      "
    >
      {stories.map((story, index) => (
        <motion.div
          key={story.$id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center"
        >
          {/* Story Ring */}
          <div
            onClick={() => onStoryClick?.(story)}
            className="relative cursor-pointer"
          >
            <div className="p-[2px] rounded-full bg-gradient-to-tr from-pink-500 via-violet-500 to-cyan-400 shadow-lg shadow-pink-500/20">

              <div className="bg-[#0f172a] rounded-full p-[3px]">

                <img
                  src={story.profilePicUrl || "/default-avatar.png"}
                  alt="story"
                  className="w-16 h-16 rounded-full object-cover"
                />

              </div>
            </div>

            {/* glow */}
            <span className="absolute inset-0 rounded-full animate-pulse bg-pink-500/10 blur-md -z-10" />
          </div>

          {/* Username */}
          <span className="text-xs text-gray-300 text-center mt-2 truncate max-w-[70px] font-medium">
            {story.username}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

export default StoryBar;