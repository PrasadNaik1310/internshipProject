import React, { useState } from "react";
import api from "./api";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import "bootstrap/dist/css/bootstrap.min.css";

interface ChartDataItem {
  year: number;
  price: number;
  demand: number;
}

interface TableRow {
  [key: string]: string | number | null;
}

interface Message {
  type: "user" | "bot";
  text: string;
}

function App() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [tableData, setTableData] = useState<TableRow[]>([]);

  const sendMessage = async () => {
    if (!query) return;

    // Add user message
    setMessages((prev) => [...prev, { type: "user", text: query }]);
    const currentQuery = query;
    setQuery("");

    try {
      const res = await api.post("/api/analyze/", { query: currentQuery });

      // Add bot message (summary)
      setMessages((prev) => [...prev, { type: "bot", text: res.data.summary }]);

      // Prepare chart data
      const chartArray: ChartDataItem[] = res.data.chart.years.map(
        (year: number, idx: number) => ({
          year,
          price: res.data.chart.prices[idx],
          demand: res.data.chart.demand[idx],
        })
      );
      setChartData(chartArray);
      setTableData(res.data.table);
    } catch (err: any) {
      const errorMsg = err.response?.data?.Error || "Something went wrong";
      setMessages((prev) => [...prev, { type: "bot", text: errorMsg }]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "800px" }}>
      <h2 className="mb-4">Real Estate Chatbot</h2>

      {/* Chat box */}
      <div
        className="border rounded p-3 mb-3"
        style={{ height: "400px", overflowY: "auto", background: "#f9f9f9" }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`d-flex mb-2 ${msg.type === "user" ? "justify-content-end" : "justify-content-start"}`}
          >
            <div
              className={`p-2 rounded ${msg.type === "user" ? "bg-primary text-white" : "bg-light text-dark"}`}
              style={{ maxWidth: "70%" }}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input box */}
      <div className="input-group mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Type a query, e.g., Analyze Wakad"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button className="btn btn-primary" onClick={sendMessage}>
          Send
        </button>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <LineChart width={700} height={300} data={chartData} className="mb-4">
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="price" stroke="#8884d8" name="Price" />
          <Line type="monotone" dataKey="demand" stroke="#82ca9d" name="Demand" />
        </LineChart>
      )}

      {/* Table */}
      {tableData.length > 0 && (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="table-dark">
              <tr>
                {Object.keys(tableData[0]).map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, idx) => (
                <tr key={idx}>
                  {Object.values(row).map((val, i) => (
                    <td key={i}>{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
