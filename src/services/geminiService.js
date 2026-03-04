import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '../constants/config';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Chuyển đổi base64 image sang format Gemini cần
const imageToGenerativePart = (base64Data, mimeType = 'image/jpeg') => ({
  inlineData: { data: base64Data, mimeType },
});

export const geminiService = {
  // Nhận diện vật thể và tạo từ điển từ ảnh
  analyzeImage: async (base64Image, sourceLanguage = 'vi', targetLanguage = 'en') => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const languageMap = {
        vi: 'Vietnamese',
        en: 'English',
        ja: 'Japanese',
        ko: 'Korean',
        zh: 'Chinese',
        fr: 'French',
      };

      const sourceLang = languageMap[sourceLanguage] || 'Vietnamese';
      const targetLang = languageMap[targetLanguage] || 'English';
      const prompt = `You are an AI language learning assistant. Analyze this image and identify the main object(s).

Return a JSON response (no markdown, no code blocks, just pure JSON) with this exact structure:
{
  "objectName": "Name of the main object in ${sourceLang}",
  "objectNameEn": "Name in English",
  "translation": "Translation in ${targetLang}",
  "pronunciation": "IPA pronunciation if translating to English, otherwise romanization",
  "partOfSpeech": "noun/verb/adjective etc",
  "confidence": 0.95,
  "examples": [
    {
      "sentence": "Example sentence using the word in ${sourceLang}",
      "translation": "Translation of example in ${targetLang}"
    },
    {
      "sentence": "Another example in ${sourceLang}",
      "translation": "Translation in ${targetLang}"
    }
  ],
  "relatedWords": [
    {"word": "related word 1 in ${targetLang}", "meaning": "meaning in ${sourceLang}"},
    {"word": "related word 2 in ${targetLang}", "meaning": "meaning in ${sourceLang}"}
  ],
  "category": "category of the object (e.g: food, furniture, electronics, nature, etc)",
  "description": "Brief description of the object in ${sourceLang} (2-3 sentences)"
}`;

      const imagePart = imageToGenerativePart(base64Image, 'image/jpeg');
      const result = await model.generateContent([prompt, imagePart]);
      const response = result.response.text();

      // Parse JSON từ response
      const cleanResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsed = JSON.parse(cleanResponse);
      return { success: true, data: parsed };
    } catch (error) {
      console.error('Gemini API Error:', error);
      return { success: false, error: error.message };
    }
  },

  // Dịch văn bản
  translateText: async (text, fromLang = 'vi', toLang = 'en') => {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Translate the following text from ${fromLang} to ${toLang}. Return only the translation, no explanations:\n\n"${text}"`;
      const result = await model.generateContent(prompt);
      return { success: true, translation: result.response.text().trim() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Phát âm text-to-speech (sử dụng Gemini để tạo phiên âm)
  getPronunciation: async (word, language = 'en') => {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Provide the IPA pronunciation for the word "${word}" in ${language}. Return only the IPA notation in brackets like [wɜːrd].`;
      const result = await model.generateContent(prompt);
      return { success: true, pronunciation: result.response.text().trim() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};