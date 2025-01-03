class GuitarProcessor extends AudioWorkletProcessor {
  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];

    if (input && output) {
      for (let channel = 0; channel < input.length; channel++) {
        const inputData = input[channel];
        const outputData = output[channel];
        for (let i = 0; i < inputData.length; i++) {
          outputData[i] = inputData[i]; // 入力をそのまま出力
        }
      }
    }

    return true; // 次のフレームに継続
  }
}

registerProcessor("guitar-processor", GuitarProcessor);
