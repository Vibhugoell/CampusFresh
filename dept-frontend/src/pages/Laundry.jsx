import React, { useEffect, useState, useCallback } from "react";
import API from "../api";
import { useLocation } from "react-router-dom";
import "./Laundry.css";

export default function Laundry() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const location = useLocation();

  // Get selected hostel from URL
  const hostel = new URLSearchParams(location.search).get("hostel") || "ALL";

  // 🚀 Clean + memoized fetchData (fixes React warning)
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const query = [];
      if (hostel !== "ALL") query.push(`hostel=${hostel}`);
      if (statusFilter !== "ALL") query.push(`status=${statusFilter}`);

      const url = query.length ? `/laundry?${query.join("&")}` : "/laundry";

      const res = await API.get(url);
      setOrders(res.data);
      setLoading(false);
    } catch (err) {
      console.log("Fetch Error:", err);
      setLoading(false);
    }
  }, [hostel, statusFilter]); // dependencies safe now

  // Status update function
  const updateStatus = async (id, status) => {
    try {
      const res = await API.put(`/laundry/${id}/status`, { status });
      alert(res.data.msg);
      fetchData(); // reload data
    } catch (err) {
      alert("Error updating status!");
      console.error(err.response?.data || err);
    }
  };

  // Fetch every time hostel or filter changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Search filter
  const filteredOrders = orders.filter(order =>
    order.userEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="laundry-page">
      <div className="header-row">
        <h1 className="title">Laundry — {hostel}</h1>

        <input
          type="text"
          placeholder="Search by email.."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-box"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="status-filter"
        >
          <option value="ALL">All Status</option>
          <option value="Submitted">Submitted</option>
          <option value="In Process">In Process</option>
          <option value="Ready for Pickup">Ready for Pickup</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {loading && <p className="loading">Loading orders...</p>}

      <div className="orders-grid">
        {filteredOrders.map((item) => (
          <div key={item._id} className="order-card">
            <p><b>Email:</b> {item.userEmail}</p>
            <p><b>Hostel:</b> {item.hostel}</p>

            <p>
              <b>Status:</b>
              <span className={`badge ${item.status.replace(/\s+/g, "-")}`}>
                {item.status}
              </span>
            </p>

            <select
              className="status-select"
              value={item.status}
              onChange={(e) => updateStatus(item._id, e.target.value)}
            >
              <option value="Submitted">Submitted</option>
              <option value="In Process">In Process</option>
              <option value="Ready for Pickup">Ready for Pickup</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}