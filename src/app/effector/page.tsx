"use client";

import React, { useState, useEffect, useRef } from "react";
import { DeviceSelector } from "./components/DeviceSelector";
import { fetchDevices } from "./utils/fetchDevices";

export default function EffectorPage() {
  const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [outputDevices, setOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedInput, setSelectedInput] = useState<string | null>(null);
  const [selectedOutput, setSelectedOutput] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    fetchDevices().then(({ inputDevices, outputDevices }) => {
      setInputDevices(inputDevices);
      setOutputDevices(outputDevices);
    });
  }, []);

  const startAudio = async () => {
    if (!selectedInput || !selectedOutput) {
      alert("Please select both an input and an output device");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedInput,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      // AudioContextを低遅延モードで作成
      const audioContext = new AudioContext({
        latencyHint: "interactive", // 低遅延モード
        sampleRate: 44100, // サンプルレートを固定
      });
      audioContextRef.current = audioContext;

      // AudioWorkletモジュールをロード
      console.log("Loading processor module...");
      await audioContext.audioWorklet.addModule("/processor.js");
      console.log("Processor module loaded successfully!");

      const source = audioContext.createMediaStreamSource(stream);

      // GainNodeを作成してゲイン調整
      const inputGain = audioContext.createGain();
      inputGain.gain.value = 1.0; // 必要に応じて調整

      // AudioWorkletNodeを作成
      const workletNode = new AudioWorkletNode(
        audioContext,
        "guitar-processor"
      );

      // 出力ゲインの追加
      const outputGain = audioContext.createGain();
      outputGain.gain.value = 1.0; // 必要に応じて調整

      // ノード接続
      source.connect(inputGain);
      inputGain.connect(workletNode);
      workletNode.connect(outputGain);
      outputGain.connect(audioContext.destination);

      console.log("Audio chain successfully started");
    } catch (error) {
      console.error("Error starting audio:", error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Effector Page</h1>

      {/* 音声入力デバイス */}
      <DeviceSelector
        devices={inputDevices}
        selectedDevice={selectedInput}
        onChange={setSelectedInput}
        label="Select Input Device"
      />

      {/* 音声出力デバイス */}
      <DeviceSelector
        devices={outputDevices}
        selectedDevice={selectedOutput}
        onChange={setSelectedOutput}
        label="Select Output Device"
      />

      <button
        onClick={startAudio}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        Start Audio
      </button>
    </div>
  );
}
