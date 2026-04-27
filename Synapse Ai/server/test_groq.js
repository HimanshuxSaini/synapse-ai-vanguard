const { ChatGroq } = require("@langchain/groq");
const path = require('path');
// If running from server directory, .env is in the same directory
require('dotenv').config({ path: path.join(process.cwd(), '.env') });

const testGroq = async () => {
  try {
    console.log('Using API Key:', process.env.GROQ_API_KEY ? 'Present' : 'Missing');
    const llm = new ChatGroq({
      model: "llama-3.3-70b-versatile",
      apiKey: process.env.GROQ_API_KEY,
    });
    const res = await llm.invoke("Hello, say 'Neural link active'");
    console.log('Groq Response:', res.content);
  } catch (err) {
    console.error('Groq Error:', err.message);
  }
};

testGroq();
