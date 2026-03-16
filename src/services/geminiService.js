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
      const prompt = `Identify the main object in this image. Return ONLY pure JSON no markdown:
{
  "objectName": "tên bằng ${sourceLang}",
  "translation": "dịch sang ${targetLang}",
  "pronunciation": "IPA",
  "partOfSpeech": "noun/verb/adj",
  "confidence": 0.95,
  "category": "food/furniture/electronics/nature/etc",
  "description": "1 câu mô tả ngắn bằng ${sourceLang}",
  "examples": [{"sentence": "ví dụ bằng ${sourceLang}", "translation": "dịch sang ${targetLang}"}],
  "relatedWords": [{"word": "từ liên quan", "meaning": "nghĩa"}]
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