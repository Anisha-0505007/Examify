import Tesseract from 'tesseract.js'
import mammoth from 'mammoth/mammoth.browser.js'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

export function getApiKey() {
  return localStorage.getItem('groq_api_key') || import.meta.env.VITE_GROQ_API_KEY || '';
}


export function setApiKey(key) {
  if (key) {
    localStorage.setItem('groq_api_key', key)
  } else {
    localStorage.removeItem('groq_api_key')
  }
}

export async function fixQuestionTextWithAI(mangledText, context = '') {
  const apiKey = getApiKey()
  if (!apiKey) return mangledText

  try {
    const prompt = `You are an expert physics and mathematics exam digitizer.
The following text contains mangled symbols represented by boxes (□ or similar artifacts like ?, \uFFFD). 
Your task is to infer the correct mathematical symbols based on the context and return ONLY the completely repaired full text.
Use standard Unicode symbols (π, θ, Ω, Δ, etc.) where appropriate.

CRITICAL RULES:
1. DO NOT solve the question.
2. NEVER output just an option letter (like "(B)" or "D").
3. Your output MUST be the full mathematical expression or sentence, exactly as it should appear in the paper, with the mangled symbols converted to proper math notation.
4. Do not add any conversational text or markdown quotes. Just return the repaired raw text.

${context ? `Question Context for reference:\n${context}\n` : ''}
Mangled text to repair:
${mangledText}

Corrected text:`

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (e) {
    console.error('AI Repair failed:', e)
    return mangledText
  }
}

export async function uploadAnswerKey(file) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error("Groq API Key is missing. Please provide one.")

  let ocrText = "";

  if (file.name.toLowerCase().endsWith('.docx')) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    ocrText = result.value;
  } else if (file.name.toLowerCase().endsWith('.pdf')) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(' ');
      ocrText += pageText + '\n\n';
    }
  } else if (file.name.toLowerCase().endsWith('.txt')) {
    ocrText = await file.text();
  } else {
    // 1. Run completely free local OCR on the user's browser
    try {
      const result = await Tesseract.recognize(file, 'eng');
      ocrText = result.data.text;
    } catch (ocrErr) {
      console.error('Tesseract failed:', ocrErr);
      throw new Error("Local OCR extraction failed on the image.");
    }
  }

  if (!ocrText || ocrText.trim().length === 0) {
    throw new Error("Could not find any readable text in the image.");
  }

  // 2. Parse rough OCR text to structured JSON Key using the lightning fast open source Text model
  const prompt = `You are an expert exam key extractor. 
I am providing the rough OCR text extraction of an uploaded answer key. 
Extract the question numbers and their corresponding correct answers from the text.
Use your intelligence to fix common OCR mistakes (e.g. 'I' for '1', 'O' for '0', 'l' for '1').
Return ONLY a valid JSON array of objects, no markdown formatting or extra text.
Each object must have:
- "q": question number (integer)
- "a": correct answer (for multiple choice, use the letter "A", "B", "C", or "D" etc. For numerical questions, provide the numeric value as a string).

RAW OCR TEXT:
${ocrText}
`

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    })
  });

  if (!response.ok) {
     const errText = await response.text();
     throw new Error(`Groq API Error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const responseText = data.choices[0].message.content.trim();
  
  let cleanJson = responseText
  
  const jsonMatch = cleanJson.match(/\[[\s\S]*\]/)
  if (jsonMatch) {
    cleanJson = jsonMatch[0]
  }

  try {
    return JSON.parse(cleanJson)
  } catch (parseError) {
    console.error("Raw AI Response:", responseText)
    throw new Error("Failed to parse AI output as JSON.")
  }
}
