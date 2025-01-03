"use client";

import React, { useState, useEffect } from "react";
import { DeviceSelector } from "./components/DeviceSelector";
import { fetchDevices } from "./utils/fetchDevices";

export default function EffectorPage() {
  const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [outputDevices, setOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedInput, setSelectedInput] = useState<string | null>(null);
  const [selectedOutput, setSelectedOutput] = useState<string | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    const loadDevices = async () => {
      const { inputDevices, outputDevices } = await fetchDevices();

      setInputDevices(inputDevices);
      setOutputDevices(outputDevices);
      console.log(inputDevices, outputDevices);

      if (inputDevices.length > 0) {
        setSelectedInput(inputDevices[0].deviceId); // 最初の入力デバイス
      }

      if (outputDevices.length > 0) {
        setSelectedOutput(outputDevices[0].deviceId); // 最初の出力デバイス
      }
    };

    loadDevices();
  }, []);

  // デバイス選択時に音声処理を自動開始
  useEffect(() => {
    const startAudio = async () => {
      if (!selectedInput || !selectedOutput) {
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

        const context =
          audioContext || new AudioContext({ latencyHint: "interactive" });
        setAudioContext(context);

        const source = context.createMediaStreamSource(stream);

        console.log("Loading processor module...");
        await context.audioWorklet.addModule("/processor.js");
        console.log("Processor module loaded successfully!");

        const workletNode = new AudioWorkletNode(context, "guitar-processor");
        source.connect(workletNode);
        workletNode.connect(context.destination);

        console.log("Audio processing started successfully!");
      } catch (error) {
        console.error("Error starting audio processing:", error);
      }
    };

    startAudio();
  }, [selectedInput, selectedOutput]); // 入力または出力デバイスが変更されるたびに実行

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
    </div>
  );
}
