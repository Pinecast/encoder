import lame from 'lamejs';


function floatToInt(blob) {
  const converted = new Int16Array(blob.length);
  for (let i = 0; i < blob.length; i++) {
      const val = +Math.max(-1.0, +Math.min(1.0, +blob[i]));
      converted[i] = val < 0 ? val * 32768 : val * 32767;
  }
  return converted;
}


const SAMPLE_BLOCK_SIZE = 1152;

const gotData = [];
self.addEventListener('message', e => {
  gotData.push(e.data);
  if (gotData.length === 2) {
    hasAllData();
  }
});

function hasAllData() {
  const [sampleRate, data] = gotData;
  const converted = floatToInt(new Float32Array(data));

  const encoder = new lame.Mp3Encoder(1, sampleRate, 128);

  const mp3Data = [];
  for (let i = 0; i < converted.length; i += SAMPLE_BLOCK_SIZE) {
    const sampleChunk = converted.subarray(i, i + SAMPLE_BLOCK_SIZE);
    const mp3Chunk = encoder.encodeBuffer(sampleChunk);
    if (mp3Chunk.length) {
      mp3Data.push(mp3Chunk);
    }
    self.postMessage(i / converted.length * 100);
  }

  const finalOutput = encoder.flush();
  if (finalOutput.length) {
    mp3Data.push(finalOutput);
  }

  const final = new Uint8Array(
    mp3Data.reduce((acc, cur) => acc + cur.byteLength, 0)
  );
  let added = 0;
  mp3Data.forEach(chunk => {
    final.set(chunk, added);
    added += chunk.byteLength;
  });

  self.postMessage(final.buffer, [final.buffer]);
}


