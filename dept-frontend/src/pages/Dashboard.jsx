import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const [hostel, setHostel] = useState("PI-A");

  return (
    <div className="layout">

      {/* Sidebar */}
      <aside className="sidebar glass">
        <h2 className="logo">Department Panel</h2>

        <nav className="nav-links">
          <Link className="nav-item" to="/dashboard">🏠 Dashboard</Link>
          <Link className="nav-item" to={`/laundry?hostel=${hostel}`}>🧺 Laundry</Link>
          <Link className="nav-item" to={`/complaints?hostel=${hostel}`}>⚠ Complaints</Link>
          <Link className="nav-item logout">🚪 Logout</Link>
        </nav>
      </aside>

      {/* Main Area */}
      <main className="main-area">
        <h1 className="page-title">Department Control Panel</h1>

        {/* Hostel Selector */}
        <div className="hostel-box">
          <label>Select Hostel</label>
          <select value={hostel} onChange={(e) => setHostel(e.target.value)}>
            <option>PI-A</option><option>PI-B</option><option>PI-C</option>
            <option>IBN-A</option><option>IBN-B</option><option>IBN-C</option>
            <option>NGH-A</option><option>NGH-B</option><option>VASCO</option>
          </select>
        </div>

        {/* Cards */}
        <div className="card-grid">
          <div className="card glass">
            <h2>Laundry Orders</h2>
            <p>Update laundry status hostel-wise</p>
            <Link to={`/laundry?hostel=${hostel}`} className="btn blue">Manage Laundry</Link>
          </div>

          <div className="card glass">
            <h2>Complaints</h2>
            <p>Handle student complaints effectively</p>
            <Link to={`/complaints?hostel=${hostel}`} className="btn red">Manage Complaints</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
