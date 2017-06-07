const Worker = require('worker-loader!./worker.js');


export default function(buffer, onProgress = () => {}) {
  return new Promise((resolve, reject) => {
    const w = new Worker();
    w.addEventListener('message', e => {
      switch (typeof e.data) {
        case 'number':
          onProgress(e.data);
          break;
        case 'object':
          resolve(e.data); // final output
          break;
      }
    });

    const reader = new FileReader();
    reader.onload = e => {
      const ctx = new AudioContext();
      ctx.decodeAudioData(e.target.result).then(
        decoded => {
          const newData = decoded.getChannelData(0);
          w.postMessage(decoded.sampleRate);
          w.postMessage(newData.buffer, [newData.buffer]);
        },
        reject
      );
    };
    reader.onerror = err => {
      reject(err);
    };
    reader.readAsArrayBuffer(buffer);

  });
}
