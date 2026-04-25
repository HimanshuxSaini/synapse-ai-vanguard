const { ChatGroq } = require("@langchain/groq");
const { SystemMessage, HumanMessage, AIMessage } = require("@langchain/core/messages");
const Session = require('../models/Session');
const mongoose = require('mongoose');
const ytSearch = require('yt-search');

// Lazy LLM Initialization
let llmInstance = null;
let fastLlmInstance = null;

const getLlm = () => {
  if (!llmInstance) {
    llmInstance = new ChatGroq({
      model: "llama-3.3-70b-versatile",
      apiKey: process.env.GROQ_API_KEY,
      temperature: 0.2,
      maxTokens: 4000,
      modelKwargs: { response_format: { type: "json_object" } }
    });
  }
  return llmInstance;
};

const getFastLlm = () => {
  if (!fastLlmInstance) {
    fastLlmInstance = new ChatGroq({
      model: "llama-3.1-8b-instant",
      apiKey: process.env.GROQ_API_KEY,
      temperature: 0.3,
      maxTokens: 1500
    });
  }
  return fastLlmInstance;
};

exports.generateCurriculum = async (req, res) => {
  const { topic, level, language = 'English' } = req.body;
  console.log(`--- INITIALIZING DIRECTIVE: ${topic} (${level}) ---`);
  if (!topic) return res.status(400).json({ error: 'Topic required' });

  try {
    const response = await getLlm().invoke([
      new SystemMessage(`You are a Zero-to-Mastery Curriculum Architect. YOU MUST RESPOND ONLY WITH A SINGLE VALID JSON OBJECT.
      
      SCHEMA:
      {
        "topic": "Topic Name",
        "level": "Level",
        "explanation": "Deep, professional technical explanation. Use \\n for pure JSON newlines.",
        "roadmap": ["### Phase 1: Name\\n- Point 1", "### Phase 2: ... (5 phases total)"],
        "projects": ["Detail 1", "Detail 2"],
        "resources": ["Reference 1"],
        "videos": [
          {"title": "Specific Video Title", "channel": "Channel Name", "url": "https://www.youtube.com/watch?v=..."}
        ]
      }
      
      RULES:
      1. FULL PHASES: Generate 5 detailed master phases.
      2. VIDEOS: Include 3-5 high-quality YouTube video suggestions. Use well-known/top-tier channels.
      3. Return ONLY the JSON object.`),
      new HumanMessage(`Generate a MASTERCURRICULUM + VANGUARD LECTURES (YouTube) for: ${topic} (${level}) in ${language}. Output in PURE JSON.`)
    ]);

    let content = response.content.trim();
    console.log('--- NEURAL DATA RECEIVED ---');
    
    // Robust extraction fallback just in case, though response_format guarantees JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('ERROR: No valid JSON found in LLM response');
      throw new Error('Neural matrix returned no valid JSON data.');
    }
    
    let data;
    try {
      data = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error('ERROR: JSON Parsing failed:', parseErr.message);
      throw new Error('Failed to parse neural data patterns.');
    }
    
    // FETCH REAL YOUTUBE VIDEOS (to avoid LLM hallucinated dead links)
    try {
      console.log(`--- FETCHING VANGUARD LECTURES FOR: ${topic} ---`);
      const searchResult = await ytSearch(`${topic} tutorial ${level} ${language} programming course`);
      if (searchResult && searchResult.videos.length > 0) {
        data.videos = searchResult.videos.slice(0, 4).map(v => ({
          title: v.title,
          channel: v.author.name,
          url: v.url
        }));
        console.log(`--- SYNCED ${data.videos.length} LECTURES ---`);
      }
    } catch (err) {
      console.log('YouTube Search fallback skipped:', err.message);
    }
    
    const session = new Session({
      userId: req.user.id,
      ...data,
      level: level || data.level,
      language
    });
    await session.save();
    console.log(`--- SESSION PERSISTED: ${session._id} ---`);

    res.json(session);
  } catch (err) {
    console.error('CRITICAL GENERATION ERROR:', err.message);
    res.status(500).json({ 
      error: `Generation failed: ${err.message}`,
      details: 'Ensure the Groq API key is valid and you have a stable connection.'
    });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const history = await Session.find({ userId: req.user.id }).sort({ timestamp: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve history' });
  }
};

exports.handleChat = async (req, res) => {
  const { topic, message, history } = req.body;
  try {
    const chatResponse = await getFastLlm().invoke([
      new SystemMessage(`You are Synapse Assistant for ${topic}. Professional/Technical tone. Be concise, direct, and deep. Answer instantly.`),
      ...history.map(m => m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content)),
      new HumanMessage(message)
    ]);
    res.json({ response: chatResponse.content });
  } catch (err) {
    res.status(500).json({ error: 'Chat failure' });
  }
};

exports.generateQuiz = async (req, res) => {
  const { topic, level } = req.body;
  try {
    const response = await getFastLlm().invoke([
      new SystemMessage(`Generate a 5-question high-level interactive technical quiz for ${topic}. Professional tone. High-end learning.`),
      new HumanMessage(`Topic: ${topic}. Difficulty: ${level}. Format as Markdown list.`)
    ]);
    res.json({ quiz: response.content });
  } catch (err) {
    res.status(500).json({ error: 'Quiz generation failed.' });
  }
};

exports.clearHistory = async (req, res) => {
  try {
    await Session.deleteMany({ userId: req.user.id });
    res.json({ message: 'Neural history purged successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to purge history.' });
  }
};

exports.generateVideos = async (req, res) => {
  const { id } = req.params;
  try {
    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Use true YouTube Search for valid links instead of LLM hallucination
    const searchResult = await ytSearch(`${session.topic} full course ${session.level || ''} tutorial`);
    if (searchResult && searchResult.videos.length > 0) {
      session.videos = searchResult.videos.slice(0, 6).map(v => ({
        title: v.title,
        channel: v.author.name,
        url: v.url
      }));
      await session.save();
    }
    
    res.json(session);
  } catch (err) {
    console.error('Video Sync Error:', err);
    res.status(500).json({ error: 'Video sync failed.' });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await Session.findOneAndDelete({ 
      _id: new mongoose.Types.ObjectId(id), 
      userId: new mongoose.Types.ObjectId(req.user.id) 
    });
    if (!session) return res.status(404).json({ error: 'Topic not found in neural registry.' });
    res.json({ message: 'Session purged successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to purge session.' });
  }
};
