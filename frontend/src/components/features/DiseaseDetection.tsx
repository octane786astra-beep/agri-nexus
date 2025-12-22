'use client';

/**
 * Disease Detection Component
 * ===========================
 * Upload plant photos for AI-powered disease detection.
 */

import { useState, useRef } from 'react';
import { API_URL } from '@/lib/utils';

interface DetectionResult {
    disease: string;
    confidence: number;
    symptoms: string[];
    treatment: string[];
    prevention: string[];
}

export default function DiseaseDetection() {
    const [image, setImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<DetectionResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setResult(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const analyzeImage = async () => {
        if (!image) return;
        setIsAnalyzing(true);

        // Simulated AI response (In production, send to Gemini Vision API)
        setTimeout(() => {
            setResult({
                disease: 'Late Blight (Phytophthora infestans)',
                confidence: 87,
                symptoms: [
                    'Brown/black lesions on leaves',
                    'White fuzzy growth on undersides',
                    'Rapid spread in wet conditions'
                ],
                treatment: [
                    'Apply copper-based fungicide immediately',
                    'Remove and destroy infected leaves',
                    'Spray Mancozeb 75% WP @ 2.5g/L'
                ],
                prevention: [
                    'Use disease-resistant varieties',
                    'Maintain proper plant spacing',
                    'Avoid overhead irrigation'
                ]
            });
            setIsAnalyzing(false);
        }, 2000);
    };

    return (
        <div className="p-5">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center">
                    <span className="material-icons-round text-white text-lg">biotech</span>
                </div>
                <div>
                    <h3 className="text-white font-semibold">Disease Detection</h3>
                    <p className="text-white/50 text-xs">AI-powered plant diagnosis</p>
                </div>
            </div>

            {/* Upload Area */}
            <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative h-40 rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${image
                        ? 'border-transparent'
                        : 'border-white/20 hover:border-white/40'
                    }`}
            >
                {image ? (
                    <img src={image} alt="Uploaded" className="w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="material-icons-round text-white/30 text-4xl mb-2">add_photo_alternate</span>
                        <p className="text-white/40 text-sm">Click to upload plant image</p>
                        <p className="text-white/30 text-xs mt-1">JPG, PNG up to 5MB</p>
                    </div>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                />
            </div>

            {/* Analyze Button */}
            {image && !result && (
                <button
                    onClick={analyzeImage}
                    disabled={isAnalyzing}
                    className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 text-white font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {isAnalyzing ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <span className="material-icons-round text-lg">search</span>
                            Detect Disease
                        </>
                    )}
                </button>
            )}

            {/* Results */}
            {result && (
                <div className="mt-4 space-y-4">
                    {/* Disease Name */}
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-red-400 font-medium text-sm">Detection Result</h4>
                            <span className="text-xs bg-red-500/20 px-2 py-0.5 rounded-full text-red-300">
                                {result.confidence}% confidence
                            </span>
                        </div>
                        <p className="text-white font-semibold">{result.disease}</p>
                    </div>

                    {/* Symptoms */}
                    <div className="p-3 rounded-xl bg-white/5">
                        <h5 className="text-white/70 text-xs font-medium mb-2 flex items-center gap-1">
                            <span className="material-icons-round text-sm">warning</span>
                            Symptoms
                        </h5>
                        <ul className="space-y-1">
                            {result.symptoms.map((s, i) => (
                                <li key={i} className="text-white/60 text-xs flex items-start gap-2">
                                    <span className="text-amber-400">•</span> {s}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Treatment */}
                    <div className="p-3 rounded-xl bg-emerald-500/10">
                        <h5 className="text-emerald-400 text-xs font-medium mb-2 flex items-center gap-1">
                            <span className="material-icons-round text-sm">healing</span>
                            Treatment
                        </h5>
                        <ul className="space-y-1">
                            {result.treatment.map((t, i) => (
                                <li key={i} className="text-emerald-200/80 text-xs flex items-start gap-2">
                                    <span>{i + 1}.</span> {t}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Reset Button */}
                    <button
                        onClick={() => { setImage(null); setResult(null); }}
                        className="w-full py-2 rounded-xl border border-white/10 text-white/60 text-sm hover:bg-white/5 transition-all"
                    >
                        Scan Another Plant
                    </button>
                </div>
            )}
        </div>
    );
}
