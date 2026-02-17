import { useState, useEffect, useCallback } from 'react';

interface MediaStreamHook {
    stream: MediaStream | null;
    error: Error | null;
    isLoading: boolean;
    startStream: () => Promise<void>;
    stopStream: () => void;
    checkPermissions: () => Promise<boolean>;
}

export function useMediaStream(): MediaStreamHook {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const stopStream = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    const startStream = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
                audio: false // We use separate audio handling for now (Speech API)
            });
            setStream(mediaStream);
        } catch (err) {
            console.error("Error accessing media devices:", err);
            setError(err instanceof Error ? err : new Error('Unknown error accessing camera'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    const checkPermissions = useCallback(async () => {
        try {
            const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
            return result.state === 'granted';
        } catch (e) {
            // Firefox/Safari might not support this query
            return false;
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    return { stream, error, isLoading, startStream, stopStream, checkPermissions };
}
