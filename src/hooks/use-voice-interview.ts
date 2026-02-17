import { useState, useEffect, useCallback, useRef } from 'react';

interface VoiceInterviewHook {
    isListening: boolean;
    isSpeaking: boolean;
    transcript: string;
    startListening: () => void;
    stopListening: () => void;
    speak: (text: string) => void;
    cancelSpeech: () => void;
    stopSpeaking: () => void;
    supported: boolean;
}

export function useVoiceInterview(language: 'en-US' | 'de-DE' = 'en-US'): VoiceInterviewHook {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [supported, setSupported] = useState(true);

    const recognitionRef = useRef<any>(null);
    const synthesisRef = useRef<SpeechSynthesis>(window.speechSynthesis);

    useEffect(() => {
        const speechWindow = window as Window & {
            SpeechRecognition?: any;
            webkitSpeechRecognition?: any;
        };
        const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = language;

            recognitionRef.current.onstart = () => setIsListening(true);
            recognitionRef.current.onend = () => setIsListening(false);
            recognitionRef.current.onresult = (event: any) => {
                let currentTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcriptPart = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        setTranscript(prev => prev + transcriptPart + ' ');
                    } else {
                        currentTranscript += transcriptPart;
                    }
                }
                // We update with final + interim for real-time feedback
                // Note: In a real app, you'd manage final vs interim carefully
                if (currentTranscript) {
                    setTranscript(prev => {
                        // Avoid duplicating if we just appended final
                        return prev.trim() + ' ' + currentTranscript;
                    });
                }
            };
        } else {
            setSupported(false);
        }

        const recognition = recognitionRef.current;
        const synthesis = synthesisRef.current;

        return () => {
            if (recognition) {
                recognition.stop();
            }
            if (synthesis) {
                synthesis.cancel();
            }
        };
    }, [language]);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Speech recognition already started");
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    }, [isListening]);

    const speak = useCallback((text: string) => {
        if (synthesisRef.current) {
            // Cancel any current speech
            synthesisRef.current.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = language;

            // Try to find a good voice
            const voices = synthesisRef.current.getVoices();
            console.log("Available voices:", voices.length);

            // Prefer Google voices or native enhanced voices
            const preferredVoice = voices.find(v =>
                v.lang === language && (v.name.includes("Google") || v.name.includes("Natural"))
            );

            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            synthesisRef.current.speak(utterance);
        }
    }, [language]);

    const cancelSpeech = useCallback(() => {
        if (synthesisRef.current) {
            synthesisRef.current.cancel();
            setIsSpeaking(false);
        }
    }, []);

    // Load voices eagerly
    useEffect(() => {
        window.speechSynthesis.getVoices();
    }, []);

    useEffect(() => {
        if (isListening && isSpeaking) {
            // Barge-in: User started speaking while AI is talking -> Stop AI
            if (synthesisRef.current) {
                synthesisRef.current.cancel();
                setIsSpeaking(false);
            }
        }
    }, [isListening, isSpeaking]);

    return {
        isListening,
        isSpeaking,
        transcript,
        startListening,
        stopListening,
        speak,
        cancelSpeech,
        stopSpeaking: cancelSpeech, // Alias for clarity
        supported
    };
}
