import React, { useEffect, useState } from "react";
import API from "../api";
import "./Complaints.css";

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch complaints
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.get("/complaints");
      setComplaints(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setLoading(false);
    }
  };

  // Update complaint status
  const updateStatus = async (id, status) => {
    try {
      if (status === "resolved") {
        await API.put(`/complaints/${id}/resolve`);
      } else {
        // we mimic support for other statuses
        await API.put(`/complaints/${id}/update`, { status });
      }

      fetchData();
    } catch (err) {
      console.error("Error updating complaint:", err);
      alert("Failed to update complaint");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="complaints-page">
      <div className="header-row">
        <h1 className="title">Complaints</h1>
      </div>

      {loading && <p className="loading">Loading complaints...</p>}

      <div className="complaints-grid">
        {complaints.map((item) => (
          <div key={item._id} className="complaint-card">
            <p className="email"><b>Email:</b> {item.userEmail || "Unknown"}</p>
            <p className="message"><b>Message:</b> {item.message}</p>

            <p>
              <b>Status:</b>
              <span className={`badge ${item.status}`}>
                {item.status}
              </span>
            </p>

            <select
              className="status-select"
              value={item.status}
              onChange={(e) => updateStatus(item._id, e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="in review">In Review</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
