import { useState } from "react";
import { signup } from "../services/authService";
import { useNavigate } from "react-router-dom";

const SignupPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    nickname: "",
    phoneNumber: "",
    countryCode: "KR",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signup(form);
      navigate("/login"); // 회원가입 후 로그인 페이지로 이동
    } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError("알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">회원가입</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="email" name="email" placeholder="이메일" required className="w-full border p-2 rounded" onChange={handleChange} />
        <input type="password" name="password" placeholder="비밀번호" required className="w-full border p-2 rounded" onChange={handleChange} />
        <input type="text" name="nickname" placeholder="닉네임" required className="w-full border p-2 rounded" onChange={handleChange} />
        <input type="text" name="phoneNumber" placeholder="전화번호" required className="w-full border p-2 rounded" onChange={handleChange} />
        <select name="countryCode" className="w-full border p-2 rounded" onChange={handleChange} value={form.countryCode}>
          <option value="KR">대한민국</option>
          <option value="GB">영국</option>
          <option value="US">미국</option>
          <option value="FR">프랑스</option>
        </select>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-black text-white py-2 rounded">
          {loading ? "가입 중..." : "회원가입"}
        </button>
      </form>
    </div>
  );
};

export default SignupPage;
