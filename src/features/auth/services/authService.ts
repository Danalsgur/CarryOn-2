import { supabase } from "@/lib/supabase";

type SignupParams = {
  email: string;
  password: string;
  nickname: string;
  phoneNumber: string;
  countryCode: string;
};

// 회원가입 + 프로필 저장
export const signup = async ({
  email,
  password,
  nickname,
  phoneNumber,
  countryCode,
}: SignupParams) => {
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError || !signUpData.user) {
    throw new Error(signUpError?.message || "회원가입 실패");
  }

  const user = signUpData.user;

  const { error: profileError } = await supabase.from("users").insert([
    {
      id: user.id,
      nickname,
      phone_number: phoneNumber,
      country_code: countryCode,
    },
  ]);

  if (profileError) {
    throw new Error("프로필 저장 실패: " + profileError.message);
  }

  return user;
};

// 로그인
export const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    throw new Error(error?.message || "로그인 실패");
  }

  return data.user;
};

// 현재 로그인된 유저 가져오기
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error(error?.message || "유저 정보 불러오기 실패");
  }

  return data.user;
};

// 로그아웃
export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error("로그아웃 실패: " + error.message);
};
