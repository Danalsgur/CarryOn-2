import { useState } from "react";
import { DateRange, RangeKeyDict } from "react-date-range";
import { addDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createRequest } from "../services/requestService";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

type Item = {
  name: string;
  price: number;
};

const NewRequestPage = () => {
  const [items, setItems] = useState<Item[]>([{ name: "", price: 0 }]);
  const [reward, setReward] = useState(0);
  const [currency, setCurrency] = useState("KRW");
  const navigate = useNavigate();

  const [dateRange, setDateRange] = useState<{
    startDate: Date;
    endDate: Date;
    key: string;
  }[]>([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 3),
      key: "selection",
    },
  ]);

  const handleDateChange = (ranges: RangeKeyDict) => {
    const range = ranges.selection;
    setDateRange([
      {
        startDate: range.startDate ?? new Date(),
        endDate: range.endDate ?? new Date(),
        key: "selection",
      },
    ]);
  };

  const handleItemChange = (index: number, field: keyof Item, value: string) => {
    const updatedItems = [...items];
    if (field === "price") {
      const number = Number(value.replace(/,/g, ""));
      updatedItems[index][field] = isNaN(number) ? 0 : number;
    } else {
      updatedItems[index][field] = value;
    }
    setItems(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    setItems([...items, { name: "", price: 0 }]);
  };

  const handleRewardChange = (value: string) => {
    const number = Number(value.replace(/,/g, ""));
    setReward(isNaN(number) ? 0 : number);
  };

  const formatPrice = (num: number) => num.toLocaleString("ko-KR");

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

  const handleSubmit = async () => {
    try {
      await createRequest({
        items,
        reward,
        currency_code: currency,
        delivery_window: {
          from: dateRange[0].startDate,
          to: dateRange[0].endDate,
        },
      });
      alert("요청이 등록되었습니다");
      navigate("/mypage");
    } catch (err) {
        if (err instanceof Error) {
          alert(err.message);
        } else {
          alert("알 수 없는 오류가 발생했습니다");
        }
      }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 border rounded-lg shadow space-y-6">
      <h2 className="text-xl font-semibold">배송 요청 등록</h2>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="물품명"
            value={item.name}
            onChange={(e) => handleItemChange(index, "name", e.target.value)}
            className="flex-1 border p-2 rounded"
          />
          <input
            type="text"
            placeholder="가격"
            value={item.price ? formatPrice(item.price) : ""}
            onChange={(e) => handleItemChange(index, "price", e.target.value)}
            className="w-32 border p-2 rounded text-right"
          />
          <button
            type="button"
            onClick={() => handleRemoveItem(index)}
            className="text-sm text-red-500"
          >
            삭제
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddItem}
        className="text-blue-600 underline"
      >
        + 물품 추가
      </button>

      <div className="text-right font-medium">
        배송 물품 총 가격: {formatPrice(totalPrice)}원
      </div>

      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="수고비"
          value={reward ? formatPrice(reward) : ""}
          onChange={(e) => handleRewardChange(e.target.value)}
          className="border p-2 rounded w-40 text-right"
        />
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="KRW">원</option>
          <option value="GBP">파운드</option>
          <option value="USD">달러</option>
          <option value="EUR">유로</option>
        </select>
      </div>

      <div>
        <p className="font-medium mb-1">희망 수령 날짜</p>
        <DateRange
          ranges={dateRange}
          onChange={handleDateChange}
          rangeColors={["#000"]}
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="w-full bg-black text-white py-2 rounded"
      >
        요청 등록
      </button>
    </div>
  );
};

export default NewRequestPage;
