import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchMyRequests,
  fetchCarrierCandidates,
  confirmMatching,
  deleteRequest,
  cancelMatching,
  fetchMyAcceptedRequests,
  fetchMyInterestedRequests,
} from "../services/mypageService";
import { supabase } from "@/lib/supabase";
import { Request } from "@/types/request";

const MyPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [statusFilter, setStatusFilter] = useState<"pending" | "matched">("pending");
  const [expandedRequestId, setExpandedRequestId] = useState<number | null>(null);
  const [candidates, setCandidates] = useState<
    { carrier_id: string; carrier_nickname: string; created_at: string }[]
  >([]);

  const [viewMode, setViewMode] = useState<"buyer" | "carrier">("buyer");
  const [carrierTab, setCarrierTab] = useState<"accepted" | "interested">("accepted");
  const [carrierRequests, setCarrierRequests] = useState<Request[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        alert("로그인이 필요합니다");
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const data = await fetchMyRequests();
        setRequests(data);
      } catch {
        console.error("An error occurred while loading requests.");
      }
    };
    if (viewMode === "buyer") loadRequests();
  }, [viewMode]);

  useEffect(() => {
    const loadCarrierRequests = async () => {
      try {
        const data =
          carrierTab === "accepted"
            ? await fetchMyAcceptedRequests()
            : await fetchMyInterestedRequests();
        setCarrierRequests(data);
      } catch {
        alert("캐리어 요청 불러오기 실패");
      }
    };
    if (viewMode === "carrier") loadCarrierRequests();
  }, [viewMode, carrierTab]);

  const handleShowCandidates = async (requestId: number) => {
    try {
      if (expandedRequestId === requestId) {
        setExpandedRequestId(null);
        return;
      }

      const data = await fetchCarrierCandidates(requestId);
      setCandidates(data);
      setExpandedRequestId(requestId);
    } catch {
      alert("지원자 목록을 불러올 수 없습니다.");
    }
  };

  const handleConfirm = async (
    requestId: number,
    carrierId: string,
    carrierNickname: string
  ) => {
    const ok = confirm(`${carrierNickname}님과 매칭하시겠습니까?`);
    if (!ok) return;

    try {
      await confirmMatching({ requestId, carrierId, carrierNickname });
      alert("매칭이 확정되었습니다.");
      location.reload();
    } catch {
      alert("매칭 확정 실패");
    }
  };

  const handleDelete = async (requestId: number) => {
    const ok = confirm("요청을 삭제하시겠습니까?");
    if (!ok) return;

    try {
      await deleteRequest(requestId);
      alert("삭제되었습니다");
      location.reload();
    } catch {
      alert("삭제 실패");
    }
  };

  const handleCancelMatching = async (requestId: number) => {
    const ok = confirm("매칭을 취소하시겠습니까?");
    if (!ok) return;

    try {
      await cancelMatching(requestId);
      alert("매칭이 취소되었습니다");
      location.reload();
    } catch {
      alert("취소 실패");
    }
  };

  const formatCurrency = (num: number, code: string) => {
    return num.toLocaleString("ko-KR") + " " + code;
  };

  const parseDateRange = (range: string) => {
    const [start, end] = range.replace("[", "").replace("]", "").split(",");
    return `${start.slice(0, 10)} ~ ${end.slice(0, 10)}`;
  };

  const filtered = requests.filter((r) => r.status === statusFilter);

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4 space-y-6">
      <h2 className="text-2xl font-semibold mb-4">내 배송 요청</h2>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setViewMode("buyer")}
          className={viewMode === "buyer" ? "font-bold underline" : ""}
        >
          바이어
        </button>
        <button
          onClick={() => setViewMode("carrier")}
          className={viewMode === "carrier" ? "font-bold underline" : ""}
        >
          캐리어
        </button>
      </div>

      {viewMode === "buyer" && (
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setStatusFilter("pending")}
            className={statusFilter === "pending" ? "font-bold underline" : ""}
          >
            대기중
          </button>
          <button
            onClick={() => setStatusFilter("matched")}
            className={statusFilter === "matched" ? "font-bold underline" : ""}
          >
            매칭완료
          </button>
        </div>
      )}

      {viewMode === "carrier" && (
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setCarrierTab("accepted")}
            className={carrierTab === "accepted" ? "font-bold underline" : ""}
          >
            맡은 요청
          </button>
          <button
            onClick={() => setCarrierTab("interested")}
            className={carrierTab === "interested" ? "font-bold underline" : ""}
          >
            관심 요청
          </button>
        </div>
      )}

      {viewMode === "buyer" && filtered.length === 0 && <p>요청이 없습니다.</p>}
      {viewMode === "carrier" && carrierRequests.length === 0 && <p>요청이 없습니다.</p>}

      {viewMode === "buyer" && filtered.map((req) => (
        <div key={req.id} className="border rounded p-4 space-y-2 shadow">
          <div className="text-sm text-gray-500">
            #{req.id} | 등록일: {req.created_at.slice(0, 10)}
          </div>
          <ul className="text-sm list-disc pl-5">
            {req.items.map((item, idx) => (
              <li key={idx}>
                {item.name} - {item.price.toLocaleString()}원
              </li>
            ))}
          </ul>
          <div>수고비: {formatCurrency(req.reward, req.currency_code)}</div>
          <div>희망 수령일: {parseDateRange(req.delivery_window)}</div>
          <div className="text-sm text-gray-600">상태: {req.status}</div>

          {statusFilter === "pending" && (
            <button
              onClick={() => handleShowCandidates(req.id)}
              className="text-blue-600 underline mt-2 text-sm"
            >
              {expandedRequestId === req.id ? "지원자 숨기기" : "지원자 보기"}
            </button>
          )}

          {expandedRequestId === req.id && candidates.length > 0 && (
            <div className="mt-2 space-y-2 text-sm border-t pt-2">
              {candidates.map((c) => (
                <div key={c.carrier_id} className="flex justify-between items-center">
                  <div>
                    {c.carrier_nickname} | 신청 시각: {c.created_at.slice(0, 19).replace("T", " ")}
                  </div>
                  <button
                    onClick={() => handleConfirm(req.id, c.carrier_id, c.carrier_nickname)}
                    className="text-green-600"
                  >
                    확정
                  </button>
                </div>
              ))}
            </div>
          )}

          {expandedRequestId === req.id && candidates.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              아직 지원한 캐리어가 없습니다.
            </p>
          )}

          {req.status === "pending" && (
            <button
              onClick={() => handleDelete(req.id)}
              className="text-sm text-red-500 underline"
            >
              요청 삭제
            </button>
          )}

          {req.status === "matched" && (
            <button
              onClick={() => handleCancelMatching(req.id)}
              className="text-sm text-orange-500 underline"
            >
              매칭 취소
            </button>
          )}
        </div>
      ))}

      {viewMode === "carrier" && carrierRequests.map((req) => (
        <div key={req.id} className="border rounded p-4 space-y-2 shadow">
          <div className="text-sm text-gray-500">
            #{req.id} | 등록일: {req.created_at.slice(0, 10)}
          </div>
          <ul className="text-sm list-disc pl-5">
            {req.items.map((item, idx) => (
              <li key={idx}>
                {item.name} - {item.price.toLocaleString()}원
              </li>
            ))}
          </ul>
          <div>수고비: {formatCurrency(req.reward, req.currency_code)}</div>
          <div>희망 수령일: {parseDateRange(req.delivery_window)}</div>
          <div className="text-sm text-gray-600">상태: {req.status}</div>
        </div>
      ))}
    </div>
  );
};

export default MyPage;
