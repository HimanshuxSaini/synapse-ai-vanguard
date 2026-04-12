const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const { body, validationResult } = require('express-validator');

// Register (with Sanitization and Validation)
router.post('/register', [
  body('email').isEmail().withMessage('Please provide a valid neural link (email).').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 bits long for secure encryption.')
    .matches(/\d/).withMessage('Password must include at least one digit.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  const { email, password, name } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'Access Denied: Connection already established with this pattern.' });

    user = new User({ email, password, name: name?.substring(0, 50) }); // Sanitize name length
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: 'System Error: Something went wrong during initialization.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Access Denied: Neural pattern does not match our records.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: 'Access Denied: Incorrect credentials for this link.' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: 'Neural link failed during login.' });
  }
});

module.exports = router;
