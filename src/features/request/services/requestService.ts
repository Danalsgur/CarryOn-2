import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/features/auth/services/authService";

type NewRequestParams = {
  items: { name: string; price: number }[];
  reward: number;
  currency_code: string;
  delivery_window: { from: Date; to: Date };
};

export const createRequest = async ({
  items,
  reward,
  currency_code,
  delivery_window,
}: NewRequestParams) => {
  const user = await getCurrentUser();

  const { error } = await supabase.from("requests").insert([
    {
      buyer_id: user.id,
      items,
      reward,
      currency_code,
      delivery_window: `[${delivery_window.from.toISOString()},${delivery_window.to.toISOString()}]`,
      status: "pending",
      chat_link: null,
      notes: "",
    },
  ]);

  if (error) throw new Error("요청 저장 실패: " + error.message);
};
