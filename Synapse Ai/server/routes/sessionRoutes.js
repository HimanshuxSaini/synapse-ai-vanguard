const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { 
  generateCurriculum, 
  getHistory, 
  handleChat, 
  generateQuiz,
  clearHistory,
  deleteSession,
  generateVideos
} = require('../controllers/sessionController');

// All session routes are protected by JWT verification
router.post('/generate', verifyToken, generateCurriculum);
router.get('/history', verifyToken, getHistory);
router.delete('/clear', verifyToken, clearHistory);
router.delete('/:id', verifyToken, deleteSession);
router.post('/chat', verifyToken, handleChat);
router.post('/quiz', verifyToken, generateQuiz);
router.post('/:id/videos', verifyToken, generateVideos);

module.exports = router;
