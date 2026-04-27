const { ChatGroq } = require("@langchain/groq");
const { SystemMessage, HumanMessage } = require("@langchain/core/messages");
const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });
const ytSearch = require('yt-search');

const testGenerate = async (topic, level, language = 'English') => {
  try {
    const llm = new ChatGroq({
      model: "llama-3.3-70b-versatile",
      apiKey: process.env.GROQ_API_KEY,
      temperature: 0.2,
      maxTokens: 4000,
      modelKwargs: { response_format: { type: "json_object" } }
    });

    console.log(`Generating for: ${topic}...`);
    const response = await llm.invoke([
      new SystemMessage(`You are a Zero-to-Mastery Curriculum Architect. YOU MUST RESPOND ONLY WITH A SINGLE VALID JSON OBJECT.
      
      SCHEMA:
      {
        "topic": "Topic Name",
        "level": "Level",
        "explanation": "Deep, professional technical explanation.",
        "roadmap": ["### Phase 1: Name\n- Point 1", "### Phase 2: ... (5 phases total)"],
        "projects": ["Detail 1", "Detail 2"],
        "resources": ["Reference 1"],
        "videos": [
          {"title": "Specific Video Title", "channel": "Channel Name", "url": "https://www.youtube.com/watch?v=..."}
        ]
      }`),
      new HumanMessage(`Generate a MASTERCURRICULUM for: ${topic} (${level}) in ${language}. Output in PURE JSON.`)
    ]);

    let content = response.content.trim();
    console.log('Raw Content Length:', content.length);
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No valid JSON found');
    
    const data = JSON.parse(jsonMatch[0]);
    console.log('Parsed Topic:', data.topic);
    console.log('Roadmap Phases:', data.roadmap.length);

    // Test YouTube Search
    console.log('Searching YouTube...');
    const searchResult = await ytSearch(`${topic} tutorial ${level} ${language} programming course`);
    console.log('YouTube Results:', searchResult.videos.length);

  } catch (err) {
    console.error('Test Failed:', err);
  }
};

testGenerate('React Native', 'Beginner');
