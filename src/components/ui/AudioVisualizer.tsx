import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
    isListening: boolean;
    isSpeaking: boolean;
}

export function AudioVisualizer({ isListening, isSpeaking }: AudioVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = 300;
        canvas.height = 100;

        let frame = 0;

        const animate = () => {
            frame++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const centerY = canvas.height / 2;
            ctx.lineWidth = 2;

            // Determine wave color and activity
            let amplitude = 5;
            let frequency = 0.05;
            let color = '#94a3b8'; // slate-400 (idle)

            if (isListening) {
                amplitude = 15;
                frequency = 0.1;
                color = '#ef4444'; // red-500 (recording)
            } else if (isSpeaking) {
                amplitude = 25;
                frequency = 0.2;
                color = '#3b82f6'; // blue-500 (AI speaking)
            }

            ctx.strokeStyle = color;
            ctx.beginPath();

            for (let x = 0; x < canvas.width; x++) {
                // Combine sine waves for organic look
                const y = centerY +
                    Math.sin(x * frequency + frame * 0.1) * amplitude * Math.sin(frame * 0.05) +
                    Math.sin(x * frequency * 2 + frame * 0.15) * (amplitude / 2);

                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            ctx.stroke();
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isListening, isSpeaking]);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-24 rounded-lg bg-black/5"
        />
    );
}
