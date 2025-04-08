import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/features/auth/services/authService";
import { Request } from "@/types/request";

// 바이어 - 내 요청 목록 조회
export const fetchMyRequests = async () => {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .eq("buyer_id", user.id)
    .not("status", "eq", "deleted")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("내 요청 불러오기 실패: " + error.message);
  }

  return data;
};

// 바이어 - 특정 요청에 지원한 캐리어 목록 조회
export const fetchCarrierCandidates = async (requestId: number) => {
  const { data, error } = await supabase
    .from("carrier_requests")
    .select("carrier_id, carrier_nickname, created_at")
    .eq("request_id", requestId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("지원자 목록 불러오기 실패: " + error.message);
  }

  return data;
};

// 바이어 - 캐리어 매칭 확정
export const confirmMatching = async ({
  requestId,
  carrierId,
  carrierNickname,
}: {
  requestId: number;
  carrierId: string;
  carrierNickname: string;
}) => {
  const { error } = await supabase
    .from("requests")
    .update({
      matched_carrier_id: carrierId,
      carrier_nickname: carrierNickname,
      status: "matched",
    })
    .eq("id", requestId);

  if (error) throw new Error("매칭 확정 실패: " + error.message);
};

// 바이어 - 요청 삭제
export const deleteRequest = async (requestId: number) => {
  const { error } = await supabase
    .from("requests")
    .update({ status: "deleted" })
    .eq("id", requestId);

  if (error) throw new Error("요청 삭제 실패: " + error.message);
};

// 바이어 - 매칭 취소
export const cancelMatching = async (requestId: number) => {
  const { error } = await supabase
    .from("requests")
    .update({
      matched_carrier_id: null,
      carrier_nickname: null,
      status: "pending",
    })
    .eq("id", requestId);

  if (error) throw new Error("매칭 취소 실패: " + error.message);
};

// 캐리어 - 내가 맡은 요청 목록
export const fetchMyAcceptedRequests = async () => {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .eq("matched_carrier_id", user.id)
    .eq("status", "matched")
    .order("created_at", { ascending: false });

  if (error) throw new Error("내가 맡은 요청 불러오기 실패: " + error.message);
  return data;
};

// 캐리어 - 내가 관심 있는 요청 목록
export const fetchMyInterestedRequests = async (): Promise<Request[]> => {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("carrier_requests")
    .select("requests(*)")
    .eq("carrier_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error("내가 관심 있는 요청 불러오기 실패: " + error.message);

  return (data ?? [])
    .map((d) => d.requests as unknown as Request)
    .filter((r): r is Request => !!r && r.status === "pending");
};

