// 🎤 Microphone

// Note: This currently assumes a stereo input using only the first channel, then
//       outputs to all other channels.
//
//       💡 It's preconfigured for a Focusrite with 1/2 active channels.

// TODO: Add effects that can be toggled or controlled live from a disk.
//       Bitcrusher: https://github.com/jaz303/bitcrusher

class Microphone extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    if (inputs[0].length === 2) {
      const micChannel = inputs[0][0];
      for (let s = 0; s < micChannel.length; s += 1) {
        outputs[0][0][s] = micChannel[s];
        outputs[0][1][s] = micChannel[s];
      }
    }
    return true;
  }
}

registerProcessor("microphone", Microphone);
