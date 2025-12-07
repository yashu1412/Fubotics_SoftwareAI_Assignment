import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

export default function AiChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await api.get('/ai/history');
        setMessages(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load history');
      }
    };
    loadHistory();
  }, []);

  const sanitize = (s) => s.replace(/\*\*/g, '');

  const send = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setIsTyping(true);
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const clientTimeISO = new Date().toISOString();
      const res = await api.post('/ai/message', { content: input.trim(), timezone: tz, clientTimeISO });
      const { userMessage, assistantMessage } = res.data;
      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setInput('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[72%] p-3 rounded-2xl shadow-sm ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white'
                      : 'bg-gradient-to-r from-gray-800 to-gray-700 text-gray-200 border border-gray-700'
                  }`}
                >
                  {sanitize(m.content)}
                  <div className="text-[11px] mt-2 text-right text-gray-300/70">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div
                key="typing"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex justify-start"
              >
                <div className="max-w-[60%] px-4 py-3 rounded-2xl bg-gradient-to-r from-gray-800 to-gray-700 text-gray-300 border border-gray-700 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Assistant is typing</span>
                    <div className="flex items-center gap-1">
                      <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 border-t border-gray-800 bg-gray-900">
          {error && (
            <div className="mb-2 p-2 text-sm bg-red-500 bg-opacity-20 border border-red-500 text-red-500 rounded">
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <textarea
              className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type your message..."
            />
            <button
              onClick={send}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
