'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function EffectorPage() {
  const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [outputDevices, setOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedInput, setSelectedInput] = useState<string | null>(null);
  const [selectedOutput, setSelectedOutput] = useState<string | null>(null);
  const [reverbEnabled, setReverbEnabled] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const reverbNodeRef = useRef<ConvolverNode | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 音声機器を取得する
    const fetchDevices = async () => {
      try {
        // 音声デバイスのアクセス権をリクエスト
        await navigator.mediaDevices.getUserMedia({ audio: true });

        // すべてのデバイスを取得
        const devices = await navigator.mediaDevices.enumerateDevices();
         
        // 音声入力（audioinput）と音声出力（audiooutput）のみフィルタリング
        const inputs = devices.filter((device) => device.kind === 'audioinput');
        const outputs = devices.filter((device) => device.kind === 'audiooutput');

        setInputDevices(inputs);
        setOutputDevices(outputs);
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };
    fetchDevices();
  }, []);

  const startAudio = async () => {
    // 機器が選ばれていなかった時にエラーを出す
    if (!selectedInput || !selectedOutput) {
      alert('機器を選択してください');
      return;
    }

    // インスタンス化
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const audioContext = audioContextRef.current;

    try {
      // 入力機器の指定
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: selectedInput },
      });

      // AudioNodeの設定
      const source = audioContext.createMediaStreamSource(stream);

      // リバーブノードの作成
      if (!reverbNodeRef.current) {
        reverbNodeRef.current = audioContext.createConvolver();

        const sampleRate = audioContext.sampleRate;
        const length = sampleRate * 10; // 10秒間のリバーブ
        const impulseResponse = audioContext.createBuffer(2, length, sampleRate);

        for (let channel = 0; channel < impulseResponse.numberOfChannels; channel++) {
          const channelData = impulseResponse.getChannelData(channel);
          for (let i = 0; i < length; i++) {
            channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
          }
        }

        reverbNodeRef.current.buffer = impulseResponse;
      }

      // Audio要素を作成
      if (!audioElementRef.current) {
        audioElementRef.current = new Audio();
      }

      const audioElement = audioElementRef.current;

      // 出力デバイスを設定
      await audioElement.setSinkId(selectedOutput).catch((error) => {
        console.error('Error setting sink ID:', error);
      });

      // ノード接続
      if (reverbEnabled && reverbNodeRef.current) {
        source.connect(reverbNodeRef.current);
        reverbNodeRef.current.connect(audioContext.destination);
      } else {
        source.connect(audioContext.destination);
      }

      // Audio要素にストリームを設定
      audioElement.srcObject = stream;
      audioElement.play();
    } catch (error) {
      console.error('Error starting audio:', error);
    }
  };

  return (
    <div >
      <h1 >Effector Page</h1>

      {/* 音声入力デバイス */}
      <div >
        <label htmlFor="inputDevice" >
          Select Input Device
        </label>
        <select
          id="inputDevice"
          
          onChange={(e) => setSelectedInput(e.target.value)}
        >
          <option value="">Select an Input Device</option>
          {inputDevices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Input Device ${device.deviceId}`}
            </option>
          ))}
        </select>
      </div>

      {/* 音声出力デバイス */}
      <div >
        <label htmlFor="outputDevice">
          Select Output Device
        </label>
        <select
          id="outputDevice"
          
          onChange={(e) => setSelectedOutput(e.target.value)}
        >
          <option value="">Select an Output Device</option>
          {outputDevices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Output Device ${device.deviceId}`}
            </option>
          ))}
        </select>
      </div>

      {/* エフェクト設定 */}
      <div >
        <label>
          <input
            type="checkbox"
            checked={reverbEnabled}
            onChange={() => setReverbEnabled(!reverbEnabled)}
          />
          Enable Reverb
        </label>
      </div>

      <button
        onClick={startAudio}
        
      >
        Start Audio
      </button>

      <audio ref={audioElementRef} style={{ display: 'none' }} />
    </div>
  );
}
