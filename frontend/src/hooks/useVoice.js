// frontend/src/hooks/useVoice.js
import { useState, useEffect, useCallback } from 'react';

export const useVoice = (onResult) => {
  const [listening,   setListening]   = useState(false);
  const [transcript,  setTranscript]  = useState('');
  const [supported,   setSupported]   = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    setSupported(true);
    const rec = new SpeechRecognition();
    rec.continuous      = false;
    rec.interimResults  = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => setListening(true);
    rec.onend   = () => setListening(false);

    rec.onresult = (e) => {
      const current = Array.from(e.results)
        .map(r => r[0].transcript)
        .join('');
      setTranscript(current);
      if (e.results[e.results.length - 1].isFinal) {
        onResult?.(current);
      }
    };

    rec.onerror = (e) => {
      console.error('Speech error:', e.error);
      setListening(false);
    };

    setRecognition(rec);
  }, []);

  const startListening = useCallback((lang = 'hi-IN') => {
    if (!recognition) return;
    recognition.lang = lang;
    try { recognition.start(); } catch (e) { console.error(e); }
  }, [recognition]);

  const stopListening = useCallback(() => {
    recognition?.stop();
  }, [recognition]);

  const speak = useCallback((text, lang = 'hi-IN') => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt  = new SpeechSynthesisUtterance(text);
    utt.lang   = lang;
    utt.rate   = 0.9;
    utt.pitch  = 1;
    utt.volume = 1;
    window.speechSynthesis.speak(utt);
  }, []);

  const cancelSpeak = useCallback(() => {
    window.speechSynthesis?.cancel();
  }, []);

  return {
    listening, transcript, supported,
    startListening, stopListening,
    speak, cancelSpeak,
    setTranscript
  };
};