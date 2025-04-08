export type Request = {
    id: number;
    buyer_id: string;
    items: { name: string; price: number }[];
    reward: number;
    currency_code: string;
    delivery_window: string; // Supabase에서는 daterange가 string으로 반환됨
    chat_link: string | null;
    notes: string;
    status: "pending" | "matched" | "cancelled" | "delivered";
    created_at: string;
  };
  