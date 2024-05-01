const express = require('express');
const router = express.Router();
const Reclamation = require('../models/reclamationModel');

// Add a new reclamation
router.post('/', async (req, res) => {
  const { name, email, rating, message } = req.body;

  try {
    const newReclamation = new Reclamation({ name, email, rating, message });
    await newReclamation.save();
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;