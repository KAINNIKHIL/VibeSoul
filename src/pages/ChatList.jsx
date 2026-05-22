import React, { useEffect, useState } from "react";
import { databases, account } from "../appwrite/config";
import { Query } from "appwrite";
import { useNavigate } from "react-router-dom";

export default function ChatList() {
  const [chats, setChats] = useState([]);
  const [userId, setUserId] = useState("");
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const getChats = async () => {
      try {
        setLoading(true);

        const user = await account.get();
        setUserId(user.$id);

        const response = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_CHATS_COLLECTION_ID,
          [Query.contains("participants", user.$id)]
        );

        setChats(response.documents);

        const participantIds = response.documents.flatMap(
          (chat) => chat.participants
        );

        const uniqueUserIds = [
          ...new Set(participantIds.filter((id) => id !== user.$id)),
        ];

        const userInfoResponses = await Promise.all(
          uniqueUserIds.map((id) =>
            databases.listDocuments(
              import.meta.env.VITE_APPWRITE_DATABASE_ID,
              import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID,
              [Query.equal("userId", id)]
            )
          )
        );

        const usersMap = userInfoResponses.reduce((acc, response) => {
          if (response.documents.length > 0) {
            const user = response.documents[0];
            acc[user.userId] = user;
          }
          return acc;
        }, {});

        setUsers(usersMap);
      } catch (err) {
        console.error("Error fetching chats", err);
      } finally {
        setLoading(false);
      }
    };

    getChats();
  }, []);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-white relative overflow-hidden px-4 py-8">

      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-120px] left-[-80px] w-[300px] h-[300px] bg-pink-500/20 blur-3xl rounded-full" />
        <div className="absolute bottom-[-120px] right-[-80px] w-[320px] h-[320px] bg-violet-500/20 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Chats ✨</h1>
            <p className="text-sm text-gray-400 mt-1">
              Connect with your vibe circle
            </p>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-white/[0.05] border border-white/10 text-sm text-gray-300">
            {chats.length} Chats
          </div>
        </div>

        {/* 🔥 LOADING SKELETON */}
        {loading ? (
          <div className="space-y-4 animate-pulse">

            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.05] p-4"
              >
                <div className="flex items-center gap-4">

                  <div className="w-14 h-14 rounded-full bg-white/10" />

                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-white/10 rounded" />
                    <div className="h-3 w-48 bg-white/10 rounded" />
                  </div>

                </div>

                <div className="h-3 w-10 bg-white/10 rounded" />
              </div>
            ))}

          </div>
        ) : chats.length === 0 ? (

          /* EMPTY STATE */
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-12 text-center">
            <div className="text-5xl mb-4">💬</div>
            <h2 className="text-xl font-semibold">No Chats Yet</h2>
            <p className="text-gray-400 mt-2 text-sm">
              Start connecting with other souls.
            </p>
          </div>

        ) : (

          /* CHAT LIST */
          <div className="space-y-4">
            {chats.map((chat) => {
              const otherUserId = chat.participants.find(
                (id) => id !== userId
              );

              const otherUser = users[otherUserId];

              return (
                <div
                  key={chat.$id}
                  onClick={() => navigate(`/chat/${otherUserId}`)}
                  className="group flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-xl p-4 hover:border-pink-500/30 hover:bg-white/[0.07] transition-all cursor-pointer"
                >

                  {/* Left */}
                  <div className="flex items-center gap-4">

                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-pink-500/20 blur-lg scale-110" />

                      <img
                        src={
                          otherUser?.profilePicUrl ||
                          "/default-avatar.png"
                        }
                        className="relative w-14 h-14 rounded-full object-cover border-2 border-pink-500/40"
                      />
                    </div>

                    <div>
                      <h2 className="font-semibold text-lg group-hover:text-pink-300 transition">
                        {otherUser?.username || "VibeSoul User"}
                      </h2>

                      <p className="text-sm text-gray-400 mt-1 max-w-[200px] truncate">
                        {chat.lastMessage || "Say hi 👋"}
                      </p>
                    </div>

                  </div>

                  <span className="text-xs text-gray-500">
                    {formatTimestamp(chat.timestamp)}
                  </span>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}