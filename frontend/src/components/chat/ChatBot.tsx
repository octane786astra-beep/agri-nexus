'use client';

/**
 * ChatBot Component
 * =================
 * Floating AI chat assistant for farmers using Gemini API.
 * Supports simulation mode with mock answers for suggested questions.
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '@/lib/utils';
import { useSimulationModeStore } from '@/store/useSimulationModeStore';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface SensorContext {
    temperature: string;
    humidity: string;
    soil_moisture: string;
    condition: string;
    alerts: string[];
}

// Predefined Q&A pairs for simulation mode
const SIMULATION_QA: Record<string, string> = {
    'Based on current soil moisture, do my crops need watering?':
        '💧 **Watering Analysis**\n\nBased on current soil moisture (45%), I recommend:\n\n• **Light watering** in the early morning (6-8 AM)\n• Focus on root zone irrigation\n• Avoid midday watering to prevent evaporation\n• Expected water requirement: 4-5 liters per sqm\n\n✅ Your drip irrigation system is optimal for this condition.',

    'Is the current temperature causing any stress to crops?':
        '🌡️ **Temperature Stress Analysis**\n\nAt 28°C, your crops are within the **optimal range**.\n\n• No heat stress detected\n• Photosynthesis rate: Optimal\n• Night temperature differential: Good (8-10°C drop)\n\n⚠️ If temperature exceeds 35°C, consider:\n- Shade nets for sensitive crops\n- Increased irrigation frequency\n- Mulching to cool soil',

    'What crops should I plant in the current season?':
        '🌾 **Rabi Season Recommendations** (Oct-Mar)\n\nTop picks for your location:\n\n1. **Wheat** - ROI: 40-60%\n2. **Chickpea (Chana)** - ROI: 35-50%\n3. **Mustard** - ROI: 45-55%\n4. **Coriander** - Quick harvest, good market\n\n💡 Pro Tip: Consider intercropping wheat with mustard for better soil health and risk distribution.',

    'What pests should I watch out for in current conditions?':
        '🐛 **Pest Alert Analysis**\n\nWith current humidity (65%) and temperature (28°C), watch for:\n\n🔴 **High Risk:**\n• Aphids - Check undersides of leaves\n• Whiteflies - Yellow sticky traps recommended\n\n🟡 **Moderate Risk:**\n• Thrips - Especially in flowering stage\n• Caterpillars - Manual removal if spotted\n\n**Prevention:** Neem oil spray (2ml/L) every 10 days'
};

// Smart response generator for any question (fallback)
// Returns generic guidance without specific numbers to avoid misleading users
const generateSmartResponse = (message: string, addDisclaimer: boolean = false): string => {
    const lower = message.toLowerCase();
    const disclaimer = addDisclaimer ? '⚠️ *API unavailable — showing general guidance*\n\n' : '';

    if (lower.includes('water') || lower.includes('irrigation') || lower.includes('moisture')) {
        return disclaimer + '💧 **Irrigation Advice**\n\nGeneral recommendations:\n\n• Water crops in early morning (6-8 AM)\n• Check soil moisture before watering\n• Avoid midday watering to prevent evaporation\n• Monitor weather forecasts for rain\n\n💡 Use a moisture meter for accurate readings.';
    }
    if (lower.includes('crop') || lower.includes('plant') || lower.includes('grow') || lower.includes('seed')) {
        return disclaimer + '🌾 **Crop Recommendations**\n\nFor this season, consider:\n\n• **Wheat** - Good drought tolerance\n• **Chickpea** - Nitrogen fixer, low water need\n• **Mustard** - Quick harvest\n\n💡 Check local mandi prices before planting.';
    }
    if (lower.includes('pest') || lower.includes('disease') || lower.includes('insect') || lower.includes('bug')) {
        return disclaimer + '🐛 **Pest Management Tips**\n\nCommon precautions:\n\n• Aphids - Check undersides of leaves\n• Whiteflies - Use yellow sticky traps\n• General - Apply neem oil spray preventively\n\n🛡️ Prevention: Maintain plant spacing and avoid overwatering.';
    }
    if (lower.includes('weather') || lower.includes('rain') || lower.includes('temperature') || lower.includes('forecast')) {
        return disclaimer + '🌤️ **Weather Tips**\n\nGeneral guidance:\n\n• Check local weather forecasts regularly\n• Adjust irrigation based on rainfall\n• Protect crops during extreme weather\n\n💡 Use weather apps for accurate local forecasts.';
    }
    if (lower.includes('price') || lower.includes('market') || lower.includes('sell') || lower.includes('mandi')) {
        return disclaimer + '📈 **Market Guidance**\n\nGeneral tips:\n\n• Check current prices at your local mandi\n• Compare prices across nearby markets\n• Consider storage if prices are low\n\n💡 Use eNAM or AgriMarket apps for real-time prices.';
    }
    if (lower.includes('fertilizer') || lower.includes('nutrient') || lower.includes('npk')) {
        return disclaimer + '🧪 **Fertilizer Tips**\n\nGeneral recommendations:\n\n• Get soil tested before applying fertilizers\n• Apply in split doses for better absorption\n• Follow recommended dosages for your crop\n\n📅 Consult local agriculture office for specific guidance.';
    }

    return disclaimer + '🌾 **Krishi Mitra**\n\nI can help you with:\n• Irrigation scheduling\n• Crop recommendations\n• Pest management\n• Weather guidance\n• Market information\n• Fertilizer advice\n\nJust ask about any of these topics!';
};

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sensorContext, setSensorContext] = useState<SensorContext | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { isSimulationMode } = useSimulationModeStore();

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Welcome message on first open
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                role: 'assistant',
                content: '🌾 Namaste! I\'m Krishi Mitra (कृषि मित्र), your AI farming assistant.\n\nI can see your live sensor data and help you with:\n• Crop recommendations\n• Pest & disease advice\n• Irrigation guidance\n• Weather-based tips\n\nAsk me anything about your farm!'
            }]);
        }
    }, [isOpen, messages.length]);

    // Handle sending message with simulation mode support
    const handleSendMessage = async (messageText: string) => {
        if (!messageText.trim() || isLoading) return;

        const userMessage = messageText.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        // Check if we're in simulation mode and have a predefined answer
        if (isSimulationMode && SIMULATION_QA[userMessage]) {
            // Simulate network delay for realism
            await new Promise(resolve => setTimeout(resolve, 800));
            setMessages(prev => [...prev, { role: 'assistant', content: SIMULATION_QA[userMessage] }]);
            setIsLoading(false);
            return;
        }

        // In simulation mode, use smart response for any question
        if (isSimulationMode) {
            await new Promise(resolve => setTimeout(resolve, 800));
            setMessages(prev => [...prev, { role: 'assistant', content: '🎮 *Simulation Mode*\n\n' + generateSmartResponse(userMessage) }]);
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages.slice(-10)
                })
            });

            if (!response.ok) throw new Error('Chat failed');

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
            setSensorContext(data.sensor_context);
        } catch (error) {
            // Log the actual error for debugging/telemetry
            console.error('ChatBot API error:', error);
            // Fallback with clear disclaimer that this is not a real AI response
            await new Promise(resolve => setTimeout(resolve, 300));
            setMessages(prev => [...prev, { role: 'assistant', content: generateSmartResponse(userMessage, true) }]);
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async () => {
        await handleSendMessage(input);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Quick action buttons with predefined messages
    const quickActions = [
        { label: '💧 Water needed?', message: 'Based on current soil moisture, do my crops need watering?' },
        { label: '🌡️ Crop stress?', message: 'Is the current temperature causing any stress to crops?' },
        { label: '🌾 What to plant?', message: 'What crops should I plant in the current season?' },
        { label: '🐛 Pest alert?', message: 'What pests should I watch out for in current conditions?' },
    ];

    return (
        <>
            {/* Chat Toggle Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                {isOpen ? (
                    <span className="material-icons-round text-2xl">close</span>
                ) : (
                    <span className="material-icons-round text-2xl">smart_toy</span>
                )}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-120px)] bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-3 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <span className="material-icons-round text-white">agriculture</span>
                            </div>
                            <div>
                                <h3 className="text-white font-bold">Krishi Mitra</h3>
                                <p className="text-emerald-100 text-xs">AI Farm Assistant</p>
                            </div>
                            {sensorContext && (
                                <div className="ml-auto text-right text-xs text-emerald-100">
                                    <div>{sensorContext.temperature} | {sensorContext.humidity}</div>
                                    <div className="text-emerald-200">{sensorContext.condition}</div>
                                </div>
                            )}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${msg.role === 'user'
                                            ? 'bg-emerald-600 text-white rounded-br-sm'
                                            : 'bg-white/10 text-gray-200 rounded-bl-sm'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-bl-sm">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Actions */}
                        {messages.length <= 1 && (
                            <div className="px-4 pb-2 flex flex-wrap gap-2">
                                {quickActions.map((action, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSendMessage(action.message)}
                                        className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-colors"
                                    >
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-4 border-t border-white/10">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask about your farm..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 text-sm"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={isLoading || !input.trim()}
                                    className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <span className="material-icons-round text-lg">send</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
