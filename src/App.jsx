import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PrivateRoute from "./components/auth/PrivateRoute.jsx";
import PostVibe from "./pages/PostVibe";
import Feed from "./pages/Feed";
import UserProfile from "./pages/Profile.jsx";
import EditProfile from './pages/EditProfile';
import PublicProfile from "./pages/PublicProfile.jsx";
import FollowerList from "./pages/FollowerList";
import FollowingList from "./pages/FollowingList";
import Chat from "./pages/Chat";
import MBTITest from "./pages/MBTItest";
import ChatList from "./pages/ChatList";
import { AuthProvider } from "./hooks/useUser";

import { useTheme } from "./context/ThemeContext";

function AppContent() {
  const { isDark } = useTheme();
  const location = useLocation();
  const shouldHideNavbar =
  location.pathname === "/" ||
  location.pathname === "/signup" ||
  location.pathname.startsWith("/chat/") &&
  location.pathname !== "/chatlist";

  return (
    <>
      

      <div
        className={`min-h-screen transition-colors duration-300 ${
          isDark ? "bg-[#0f0f0f] text-white" : "bg-gray-150 text-gray-900"
        }`}
      >
        {!shouldHideNavbar && <Navbar  />}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/post" element={<PrivateRoute><PostVibe /></PrivateRoute>} />
          <Route path="/feed" element={<PrivateRoute><Feed /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
          <Route path="/edit-profile" element={<PrivateRoute><EditProfile /></PrivateRoute>} />
          <Route path="/profile/:userId" element={<PublicProfile />} />
          <Route path="/profile/:userId/followers" element={<FollowerList />} />
          <Route path="/profile/:userId/following" element={<FollowingList />} />
          <Route path="/chat/:otherUserId" element={<Chat />} />
          <Route path="/mbti-test" element={<MBTITest />} />
          <Route path="/chatlist" element={<PrivateRoute><ChatList /></PrivateRoute>} />
        </Routes>

        <ToastContainer
  position="top-center"
  autoClose={2500}
  hideProgressBar={false}
  newestOnTop
  closeOnClick
  pauseOnHover
  draggable
  theme="dark"
  toastClassName={() =>
    `
      relative
      flex
      items-center
      p-3
      min-h-[64px]
      rounded-2xl
      overflow-hidden
      cursor-pointer
      backdrop-blur-xl
      bg-white/10
      border
      border-white/10
      shadow-2xl
    `
  }
  bodyClassName={() =>
    `
      text-sm
      font-medium
      text-white
      pr-2
      break-words
    `
  }
/>
      </div>
    </>
  );
}

function App() {
  return (
     <AuthProvider>
      <Router>
      <AppContent />
    </Router>
     </AuthProvider>
    
  );
}

export default App;
