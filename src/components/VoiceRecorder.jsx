// src/components/VoiceRecorder.jsx
import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import "./VoiceRecorder.css";

export default function VoiceRecorder({ ticketId, disabled }) {
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [recording, setRecording] = useState(false);

  const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: "audio/webm",
  });

  mediaRecorderRef.current = mediaRecorder;
  chunksRef.current = [];

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunksRef.current.push(e.data);
  };

  mediaRecorder.onstop = async () => {
    const blob = new Blob(chunksRef.current, {
      type: "audio/webm",
    });

    const file = new File([blob], `voice-${Date.now()}.webm`, {
      type: "audio/webm",
    });

    const formData = new FormData();
    formData.append("file", file);

    await api.post(`/api/tickets/${ticketId}/upload`, formData);
    stream.getTracks().forEach((t) => t.stop());
  };

  mediaRecorder.start();
  setRecording(true);
};

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <button
      type="button"
      className={`voice-btn ${recording ? "recording" : ""}`}
      onClick={recording ? stopRecording : startRecording}
      disabled={disabled}
    >
      {recording ? "⏹ Stop" : "🎤 Voice"}
    </button>
  );
}
