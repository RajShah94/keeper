'use client';

import { useState, useRef, useCallback } from 'react';

interface MicButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export default function MicButton({ onTranscript, disabled = false }: MicButtonProps) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  const getMimeType = (): string => {
    if (typeof MediaRecorder !== 'undefined') {
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus';
      if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4';
    }
    return 'audio/webm';
  };

  const stopRecording = useCallback(() => {
    // Clean up silence detection
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    analyserRef.current = null;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;

      const mimeType = getMimeType();
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        const blob = new Blob(chunksRef.current, { type: mimeType });

        // Ignore very short recordings (accidental taps)
        if (blob.size < 1000) {
          setProcessing(false);
          return;
        }

        setProcessing(true);

        try {
          const ext = mimeType.includes('mp4') ? 'm4a' : 'webm';
          const formData = new FormData();
          formData.append('audio', blob, `recording.${ext}`);

          const res = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) throw new Error('Transcription failed');

          const { text } = await res.json();
          if (text && text.trim()) {
            onTranscript(text.trim());
          }
        } catch (err) {
          console.error('Transcription error:', err);
        } finally {
          setProcessing(false);
        }
      };

      mediaRecorder.start(250); // collect data every 250ms
      setRecording(true);

      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(30);

      // Silence detection via Web Audio API
      try {
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.3;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const SILENCE_THRESHOLD = 15;
        const SILENCE_DURATION = 1500; // ms of silence before auto-stop
        const MIN_RECORD_TIME = 800; // don't auto-stop too early
        const recordStart = Date.now();
        let silenceStart: number | null = null;

        const checkSilence = () => {
          if (!analyserRef.current) return;
          analyser.getByteFrequencyData(dataArray);
          const avg = dataArray.reduce((sum, v) => sum + v, 0) / dataArray.length;

          const elapsed = Date.now() - recordStart;

          if (avg < SILENCE_THRESHOLD && elapsed > MIN_RECORD_TIME) {
            if (!silenceStart) silenceStart = Date.now();
            if (Date.now() - silenceStart > SILENCE_DURATION) {
              // Auto-stop
              stopRecording();
              audioCtx.close();
              return;
            }
          } else {
            silenceStart = null;
          }

          rafRef.current = requestAnimationFrame(checkSilence);
        };
        rafRef.current = requestAnimationFrame(checkSilence);
      } catch {
        // Web Audio API not available — manual stop still works
      }
    } catch (err) {
      console.error('Mic access error:', err);
    }
  }, [onTranscript, stopRecording]);

  const handleClick = () => {
    if (recording) {
      stopRecording();
    } else if (!disabled && !processing) {
      startRecording();
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Pulse ring when recording */}
      {recording && (
        <div className="absolute w-[72px] h-[72px] rounded-full bg-coral mic-pulse" />
      )}

      <button
        onClick={handleClick}
        disabled={disabled && !recording}
        className={`relative w-[72px] h-[72px] rounded-full flex items-center justify-center
                    shadow-lg transition-all duration-200
                    ${recording
                      ? 'bg-coral scale-110'
                      : processing
                        ? 'bg-foreground/20 cursor-wait'
                        : 'bg-sage active:scale-95'
                    }
                    ${disabled && !recording ? 'opacity-50' : ''}`}
        aria-label={recording ? 'Stop recording' : 'Start recording'}
      >
        {processing ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : recording ? (
          <div className="w-6 h-6 rounded-sm bg-white" />
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="1" width="6" height="12" rx="3" />
            <path d="M5 10a7 7 0 0 0 14 0" />
            <line x1="12" y1="17" x2="12" y2="21" />
            <line x1="8" y1="21" x2="16" y2="21" />
          </svg>
        )}
      </button>

      {/* Status text */}
      {recording && (
        <span className="mt-2 text-xs font-medium text-coral animate-pulse">
          Listening...
        </span>
      )}
      {processing && (
        <span className="mt-2 text-xs font-medium text-foreground-secondary">
          Processing...
        </span>
      )}
    </div>
  );
}
