export const fetchDevices = async (): Promise<{
  inputDevices: MediaDeviceInfo[];
  outputDevices: MediaDeviceInfo[];
}> => {
  try {
    // 音声デバイスへのアクセス権をリクエスト
    await navigator.mediaDevices.getUserMedia({ audio: true });

    // デバイス情報を取得
    const devices = await navigator.mediaDevices.enumerateDevices();

    // 入力デバイスをフィルタリング
    const inputDevices = devices.filter(
      (device: MediaDeviceInfo) => device.kind === "audioinput"
    );

    // 出力デバイスをフィルタリング
    const outputDevices = devices.filter(
      (device: MediaDeviceInfo) => device.kind === "audiooutput"
    );

    return { inputDevices, outputDevices };
  } catch (error) {
    console.error("Error fetching devices:", error);

    // エラー時には空のリストを返す
    return { inputDevices: [], outputDevices: [] };
  }
};
