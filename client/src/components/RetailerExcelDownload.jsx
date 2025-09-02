import React, { useState } from "react";
import dayjs from "dayjs";
import axios from "axios";

const RetailerExcelDownload = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const setQuickRange = (type) => {
    const today = dayjs();
    let start, end;

    switch (type) {
      case "today":
        start = today.startOf("day");
        end = today.endOf("day");
        break;
      case "yesterday":
        start = today.subtract(1, "day").startOf("day");
        end = today.subtract(1, "day").endOf("day");
        break;
      case "week":
        start = today.startOf("week");
        end = today.endOf("week");
        break;
      case "month":
        start = today.startOf("month");
        end = today.endOf("month");
        break;
      case "all":
        start = "";
        end = "";
        break;
      default:
        return;
    }

    setStartDate(start ? start.format("YYYY-MM-DD") : "");
    setEndDate(end ? end.format("YYYY-MM-DD") : "");
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.start = startDate;
      if (endDate) params.end = endDate;

      const res = await axios.get(
        "https://retailors-data.onrender.com/api/customers/excel",
        {
          params,
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "customers_data.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert("Failed to download file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Download customers Data
      </h3>

      {/* Date Inputs */}
      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setQuickRange("today")}
          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
        >
          Today
        </button>
        <button
          onClick={() => setQuickRange("yesterday")}
          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
        >
          Yesterday
        </button>
        <button
          onClick={() => setQuickRange("week")}
          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
        >
          Current Week
        </button>
        <button
          onClick={() => setQuickRange("month")}
          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
        >
          Current Month
        </button>
        <button
          onClick={() => setQuickRange("all")}
          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
        >
          Full Data
        </button>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleDownload}
        disabled={loading}
        className={`w-full py-2 rounded-lg text-white font-medium transition ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Downloading..." : "Download Excel"}
      </button>
    </div>
  );
};

export default RetailerExcelDownload;
