const express = require("express");
const router = express.Router();
const deptAuth = require("../middleware/auth");

// 👈 100% Correct Now
const LaundryOrder = require("../models/laundryModels");


// ⭐ GET laundry
router.get("/", deptAuth, async (req, res) => {
  try {
    const { hostel, status } = req.query;

    const filter = {};
    if (hostel && hostel !== "ALL") filter.hostel = hostel;
    if (status && status !== "ALL") filter.status = status;

    const data = await LaundryOrder.find(filter);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ⭐ UPDATE STATUS

router.put("/:id/status", deptAuth, async (req, res) => {
  console.log("ID RECEIVED:", req.params.id);        // ⭐ ADD THIS
  console.log("BODY RECEIVED:", req.body);           // ⭐ ADD THIS
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const updated = await LaundryOrder.findByIdAndUpdate(
      req.params.id,
      { status, lastUpdate: Date.now() },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ msg: "Status updated successfully", order: updated });

  } catch (err) {
    console.error("BACKEND ERROR:", err);           // ⭐ ADD THIS
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;