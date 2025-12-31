"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useUploadVoice } from "@/hooks/auth";
import {
  checkMediaRecorderSupport,
  getSupportedAudioMimeType,
  MEDIA_RECORDER_NOT_SUPPORTED_ERROR,
  MICROPHONE_PERMISSION_ERROR,
  RECORDING_START_ERROR,
  RECORDING_ERROR,
} from "@/lib/audio";

export const VoiceInput = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const { uploadVoiceAsync, isLoading, error: uploadError, data } = useUploadVoice();

  useEffect(() => {
    const isSupported = checkMediaRecorderSupport();
    setIsSupported(isSupported);
    if (!isSupported) {
      setError(MEDIA_RECORDER_NOT_SUPPORTED_ERROR);
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // hookのdataからtranscriptを更新
  useEffect(() => {
    if (data?.text) {
      setTranscript(data.text);
    }
  }, [data]);

  const startRecording = async () => {
    try {
      setError(null);
      setTranscript("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = getSupportedAudioMimeType();
      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
        const audioFile = new File([audioBlob], "recording.wav", { type: "audio/wav" });

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        try {
          await uploadVoiceAsync(audioFile);
        } catch (err) {
          console.error("Error uploading voice file:", err);
          // エラーはhookのerrorから取得されるため、ここではログのみ
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        setError(RECORDING_ERROR);
        setIsListening(false);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsListening(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      if (err instanceof Error && (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")) {
        setError(MICROPHONE_PERMISSION_ERROR);
      } else {
        setError(RECORDING_START_ERROR);
      }
      setIsListening(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (!isSupported) return;

    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const displayError = error || (uploadError ? uploadError.message : null);

  return (
    <div className="flex flex-col gap-4">
      {displayError && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
          {displayError}
        </div>
      )}

      {!isSupported && !displayError && (
        <div className="mb-4 p-4 bg-muted rounded-md text-sm">
          音声認識機能を読み込んでいます...
        </div>
      )}

      <Button
        onClick={toggleListening}
        disabled={!isSupported || isLoading}
        variant={isListening ? "destructive" : "default"}
        size="lg"
        className="w-full"
      >
        {isListening ? (
          <>
            <MicOff className="size-5" />
            録音を停止
          </>
        ) : (
          <>
            <Mic className="size-5" />
            録音を開始
          </>
        )}
      </Button>

      <div className="mt-4 p-4 bg-muted rounded-md min-h-[200px]">
        <h2 className="text-sm font-semibold mb-2">認識結果:</h2>
        {isLoading ? (
          <div className="flex items-center justify-center text-muted-foreground">
            <p>音声をアップロード中です...</p>
          </div>
        ) : transcript ? (
          <p className="whitespace-pre-wrap">{transcript}</p>
        ) : (
          <div className="flex items-center justify-center text-muted-foreground">
            <p>音声認識を開始すると、ここにテキストが表示されます。</p>
          </div>
        )}
      </div>
    </div>
  );
};

