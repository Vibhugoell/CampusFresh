const express = require("express");
const router = express.Router();
const deptAuth = require("../middleware/auth");

const Complaint = require("../models/complaint");

// ⭐ GET all complaints
router.get("/", deptAuth, async (req, res) => {
  try {
    const data = await Complaint.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ⭐ Update ANY status (general)
router.put("/:id/update", deptAuth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ msg: "Status is required" });
    }

    await Complaint.findByIdAndUpdate(req.params.id, { status });
    res.json({ msg: "Status updated", status });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ⭐ Specifically resolve complaint
router.put("/:id/resolve", deptAuth, async (req, res) => {
  try {
    await Complaint.findByIdAndUpdate(req.params.id, { status: "resolved" });
    res.json({ msg: "Complaint resolved" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
