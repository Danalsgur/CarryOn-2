import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignupPage from "@/features/auth/pages/SignupPage";
import LoginPage from "@/features/auth/pages/LoginPage";
import MyPage from "@/features/mypage/pages/MyPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="*" element={<div className="p-4">404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
