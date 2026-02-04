'use client';

/**
 * Plant Disease Scanner Component
 * ================================
 * Image upload for plant disease identification with simulation mode support.
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    Camera,
    AlertTriangle,
    CheckCircle,
    Leaf,
    Bug,
    Droplets,
    X,
    Loader2
} from 'lucide-react';
import { useSimulationModeStore } from '@/store/useSimulationModeStore';
import { cn } from '@/lib/utils';

interface DiseaseResult {
    name: string;
    severity: 'low' | 'medium' | 'high';
    confidence: number;
    affectedArea: number;
    description: string;
    treatment: {
        organic: string;
        chemical: string;
    };
    prevention: string[];
}

// Mock disease detection results for simulation mode
const MOCK_DISEASES: DiseaseResult[] = [
    {
        name: 'Leaf Blight',
        severity: 'high',
        confidence: 87,
        affectedArea: 35,
        description: 'Fungal infection causing brown lesions on leaves, spreading rapidly in humid conditions.',
        treatment: {
            organic: 'Remove infected leaves immediately. Apply neem oil spray (2ml/L) weekly.',
            chemical: 'Copper-based fungicide (Bordeaux mixture) - spray every 7-10 days.'
        },
        prevention: [
            'Ensure proper plant spacing for air circulation',
            'Avoid overhead watering',
            'Rotate crops annually'
        ]
    },
    {
        name: 'Powdery Mildew',
        severity: 'medium',
        confidence: 92,
        affectedArea: 20,
        description: 'White powdery fungal growth on leaves and stems, common in warm, dry climates.',
        treatment: {
            organic: 'Spray milk solution (40% milk, 60% water) or neem oil.',
            chemical: 'Sulfur-based fungicide or potassium bicarbonate spray.'
        },
        prevention: [
            'Improve air circulation around plants',
            'Water at soil level, not on foliage',
            'Choose resistant varieties'
        ]
    },
    {
        name: 'Aphid Infestation',
        severity: 'low',
        confidence: 95,
        affectedArea: 15,
        description: 'Small sap-sucking insects clustering on new growth, causing leaf curling and yellowing.',
        treatment: {
            organic: 'Strong water spray to dislodge. Introduce ladybugs. Neem oil spray.',
            chemical: 'Insecticidal soap or pyrethrin-based spray.'
        },
        prevention: [
            'Encourage beneficial insects like ladybugs',
            'Avoid over-fertilizing with nitrogen',
            'Use reflective mulch to deter aphids'
        ]
    }
];

interface PlantDiseaseScannerProps {
    className?: string;
}

export default function PlantDiseaseScanner({ className }: PlantDiseaseScannerProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<DiseaseResult | null>(null);
    const { isSimulationMode } = useSimulationModeStore();

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            processImage(file);
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processImage(file);
        }
    };

    const processImage = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
            analyzeImage();
        };
        reader.readAsDataURL(file);
    };

    const analyzeImage = async () => {
        setIsAnalyzing(true);
        setResult(null);

        // Simulate analysis delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (isSimulationMode) {
            // Return random mock disease for simulation
            const randomDisease = MOCK_DISEASES[Math.floor(Math.random() * MOCK_DISEASES.length)];
            setResult(randomDisease);
        } else {
            // In real mode, would call API
            // For now, still return mock data
            const randomDisease = MOCK_DISEASES[Math.floor(Math.random() * MOCK_DISEASES.length)];
            setResult(randomDisease);
        }

        setIsAnalyzing(false);
    };

    const clearImage = () => {
        setImagePreview(null);
        setResult(null);
    };

    const severityColors = {
        low: 'text-green-400 bg-green-500/20 border-green-500/30',
        medium: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
        high: 'text-red-400 bg-red-500/20 border-red-500/30'
    };

    const severityLabels = {
        low: 'Low Risk',
        medium: 'Medium Risk',
        high: 'High Risk'
    };

    return (
        <div className={cn("space-y-4", className)}>
            {/* Upload Area */}
            {!imagePreview ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                        "relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
                        isDragging
                            ? "border-emerald-500 bg-emerald-500/10"
                            : "border-white/20 hover:border-white/40 bg-white/5"
                    )}
                >
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-3">
                        <div className={cn(
                            "p-4 rounded-full transition-colors",
                            isDragging ? "bg-emerald-500/20" : "bg-white/10"
                        )}>
                            {isDragging ? (
                                <Upload className="w-8 h-8 text-emerald-400" />
                            ) : (
                                <Camera className="w-8 h-8 text-white/60" />
                            )}
                        </div>
                        <div>
                            <p className="text-white font-medium">
                                {isDragging ? 'Drop image here' : 'Upload Plant Photo'}
                            </p>
                            <p className="text-white/50 text-sm mt-1">
                                Drag & drop or click to select
                            </p>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative rounded-xl overflow-hidden"
                >
                    <img
                        src={imagePreview}
                        alt="Uploaded plant"
                        className="w-full h-48 object-cover"
                    />
                    <button
                        onClick={clearImage}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
                    >
                        <X className="w-4 h-4 text-white" />
                    </button>

                    {isAnalyzing && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                                <span className="text-white text-sm">Analyzing...</span>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Analysis Results */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                    >
                        {/* Disease Header */}
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "p-2 rounded-lg",
                                        result.severity === 'high' ? 'bg-red-500/20' :
                                            result.severity === 'medium' ? 'bg-yellow-500/20' : 'bg-green-500/20'
                                    )}>
                                        <Bug className={cn(
                                            "w-5 h-5",
                                            result.severity === 'high' ? 'text-red-400' :
                                                result.severity === 'medium' ? 'text-yellow-400' : 'text-green-400'
                                        )} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold">{result.name}</h3>
                                        <p className="text-white/50 text-sm">{result.confidence}% confidence</p>
                                    </div>
                                </div>
                                <span className={cn(
                                    "px-2 py-1 text-xs font-medium rounded-full border",
                                    severityColors[result.severity]
                                )}>
                                    {severityLabels[result.severity]}
                                </span>
                            </div>

                            <p className="text-white/70 text-sm mb-3">{result.description}</p>

                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                    <Leaf className="w-4 h-4 text-emerald-400" />
                                    <span className="text-white/60">Affected: {result.affectedArea}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Treatment Recommendations */}
                        <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-xl border border-white/10">
                            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                                <Droplets className="w-4 h-4 text-blue-400" />
                                Treatment Options
                            </h4>

                            <div className="space-y-3">
                                <div>
                                    <span className="text-green-400 text-xs font-medium">🌿 ORGANIC</span>
                                    <p className="text-white/70 text-sm mt-1">{result.treatment.organic}</p>
                                </div>
                                <div>
                                    <span className="text-blue-400 text-xs font-medium">🧪 CHEMICAL</span>
                                    <p className="text-white/70 text-sm mt-1">{result.treatment.chemical}</p>
                                </div>
                            </div>
                        </div>

                        {/* Prevention Tips */}
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                Prevention Tips
                            </h4>
                            <ul className="space-y-1">
                                {result.prevention.map((tip, index) => (
                                    <li key={index} className="text-white/60 text-sm flex items-start gap-2">
                                        <span className="text-emerald-400">•</span>
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
