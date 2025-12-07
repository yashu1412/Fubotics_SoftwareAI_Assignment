const express = require('express');
const router = express.Router();
const AiMessage = require('../models/AiMessage');
const auth = require('../middleware/auth.middleware');

router.get('/history', auth, async (req, res) => {
  try {
    const messages = await AiMessage.find({ user: req.userId })
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/message', auth, async (req, res) => {
  try {
    const { content, timezone, clientTimeISO } = req.body;
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ message: 'content is required' });
    }

    const userMsg = await AiMessage.create({
      user: req.userId,
      role: 'user',
      content,
    });

    const historyDocs = await AiMessage.find({ user: req.userId })
      .sort({ createdAt: 1 })
      .limit(20);
    const history = historyDocs.map((m) => ({ role: m.role, content: m.content }));

    const baseUrl = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    if (!apiKey) {
      return res.status(500).json({ message: 'AI provider API key not configured' });
    }

    const tzPref = timezone || process.env.TIMEZONE || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const nowDirect = clientTimeISO ? new Date(clientTimeISO) : new Date();
    const dayDirect = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: tzPref }).format(nowDirect);
    const dateDirect = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: tzPref }).format(nowDirect);
    const timeDirect = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: tzPref }).format(nowDirect);
    const lc = content.toLowerCase();
    const keywordHit = ['today','date','day','time','month','year'].some(k => lc.includes(k));
    const regexHit = /(what\s*(is|'s)\s*(today|date|day|time)|current\s*(date|day|time)|today(?:'s)?\s*date|date\s*now|time\s*now|\bmonth\b|\byear\b)/i.test(lc);
    const isDateQuery = keywordHit || regexHit;
    if (isDateQuery) {
      const assistantContent = `Today is ${dayDirect}, ${dateDirect}. Local time: ${timeDirect} (${tzPref}).`;
      const assistantMsg = await AiMessage.create({
        user: req.userId,
        role: 'assistant',
        content: assistantContent,
      });
      return res.status(201).json({ userMessage: userMsg, assistantMessage: assistantMsg });
    }

    const contents = history.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const now = clientTimeISO ? new Date(clientTimeISO) : new Date();
    const tz = tzPref;
    const day = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: tz }).format(now);
    const dateStr = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: tz }).format(now);
    const timeStr = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: tz }).format(now);
    contents.unshift({
      role: 'user',
      parts: [{
        text: `Context: Current server date/time is ${day}, ${dateStr}, ${timeStr} (${tz}). Use this when answering date/time/day questions.`
      }],
    });

    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });
      const sysText = `You are a helpful assistant. Current server date/time: ${dayDirect}, ${dateDirect}, ${timeDirect} (${tzPref}). Use this to answer date/time/day queries accurately.`;
      const response = await ai.models.generateContent({
        model,
        contents,
        systemInstruction: { role: 'system', parts: [{ text: sysText }] },
      });
      let assistantContent = response?.text;
      if (!assistantContent) {
        const parts = response?.candidates?.[0]?.content?.parts || [];
        assistantContent = parts
          .map((p) => p?.text)
          .filter(Boolean)
          .join('\n');
      }
      if (!assistantContent) {
        const friendly = 'AI provider returned empty response. Please try again later.';
        const assistantMsg = await AiMessage.create({
          user: req.userId,
          role: 'assistant',
          content: friendly,
        });
        return res.status(201).json({
          userMessage: userMsg,
          assistantMessage: assistantMsg,
        });
      }

      const assistantMsg = await AiMessage.create({
        user: req.userId,
        role: 'assistant',
        content: assistantContent,
      });

      return res.status(201).json({
        userMessage: userMsg,
        assistantMessage: assistantMsg,
      });
    } catch (sdkError) {
      const friendly = `AI provider error. ${sdkError?.message || 'Please check configuration, billing, or service availability.'}`;
      const assistantMsg = await AiMessage.create({
        user: req.userId,
        role: 'assistant',
        content: friendly,
      });
      return res.status(201).json({
        userMessage: userMsg,
        assistantMessage: assistantMsg,
      });
    }
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
