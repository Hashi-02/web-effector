import React from "react";

interface DeviceSelectorProps {
  devices: MediaDeviceInfo[];
  selectedDevice: string | null;
  onChange: (deviceId: string) => void;
  label: string;
}

export const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  devices,
  selectedDevice,
  onChange,
  label,
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={label} className="block mb-2 font-semibold">
        {label}
      </label>
      <select
        id={label}
        className="border p-2 rounded w-full"
        value={selectedDevice || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        {devices.map((device, index) => (
          <option key={device.deviceId || index} value={device.deviceId}>
            {device.label || `Unnamed Device (${device.deviceId})`}
          </option>
        ))}
      </select>
    </div>
  );
};
