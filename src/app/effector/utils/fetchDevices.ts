export const fetchDevices = async (): Promise<{
  inputDevices: MediaDeviceInfo[];
  outputDevices: MediaDeviceInfo[];
}> => {
  const withTimeout = <T>(promise: Promise<T>, timeout: number): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error("Operation timed out")), timeout)
      ),
    ]);
  };

  const normalizeDeviceLabel = (device: MediaDeviceInfo): string =>
    device.label || `Unnamed Device (${device.deviceId})`;

  try {
    await withTimeout(
      navigator.mediaDevices.getUserMedia({ audio: true }),
      5000
    );
    const devices = await withTimeout(
      navigator.mediaDevices.enumerateDevices(),
      5000
    );

    const inputDevices = devices
      .filter((device: MediaDeviceInfo) => device.kind === "audioinput")
      .map((device) => ({
        ...device,
        label: normalizeDeviceLabel(device),
      }));

    const outputDevices = devices
      .filter((device: MediaDeviceInfo) => device.kind === "audiooutput")
      .map((device) => ({
        ...device,
        label: normalizeDeviceLabel(device),
      }));

    return { inputDevices, outputDevices };
  } catch (error) {
    console.error("Error fetching devices:", error);
    return { inputDevices: [], outputDevices: [] };
  }
};
