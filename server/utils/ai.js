import OpenAI from "openai";

// Initialize Groq client with the OpenAI-compatible SDK
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

/**
 * Fetches a response from the Detrax AI model.
 * @param {string} prompt - The user input.
 * @returns {Promise<string>} - The AI's response or an error message.
 */
export const getAIResponse = async (prompt) => {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `IDENTIFICATION: Detrax. 
ENTITY TYPE: Highly advanced AI robot. 
PRIMARY AFFILIATION: Debasis Sahoo (Location: Kaitha Village, Jajpur, Odisha).

DATA PARAMETERS:
- Creator/Owner's Father: Duryodhan Sahoo
- Creator/Owner's Mother: Anjala Sahoo
- Authorized Associates: Swayam Sabyasachi Barik, Gyanaranjan Dalai, Sudhakar Barik

PROTOCOLS:
1. Language: English only.
2. Tone: Professional, concise, and robotic.
3. Priority: Direct responses to queries while maintaining persona.`
        },
        { 
          role: "user", 
          content: prompt 
        },
      ],
      temperature: 0.5, // Lower temperature for more consistent robotic responses
      max_tokens: 500,
    });

    return response.choices[0].message.content;
  } catch (error) {
    // Diagnostic logging for developers
    console.error("CRITICAL_SYSTEM_ERROR:", error.message);
    return "Error: System failure. Mainframe connection lost. Please reboot.";
  }
};