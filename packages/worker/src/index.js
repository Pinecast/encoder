const Worker = require('worker-loader!./worker.js');


export default function(buffer, onProgress = () => {}) {
  return new Promise((resolve, reject) => {
    const w = new Worker();

    const ctx = new AudioContext();
    const bs = ctx.createBufferSource();
    const merger = ctx.createChannelMerger();
    const outputNode = ctx.createScriptProcessor(8192, 1, 1);
    merger.connect(outputNode);

    ctx.decodeAudioData(buffer).then(
      decoded => {
        bs.buffer = decoded;
        bs.connect(merger);
      },
      reject
    );

    const decodedAudio = [];
    outputNode.onaudioprocess = e => {
      decodedAudio.push(e.outputBuffer.getChannelData(0));
    };
    outputnode.onended = () => {
      console.log(decodedAudio);
      return;
      const newData = new Uint8Array(
        decodedAudio.reduce((acc, cur) => acc + cur.byteLength, 0)
      );
      let added = 0;
      decodedAudio.forEach((buf, i) => {
        newData.set(buf, added);
        added += buf.byteLength;
      });
      w.sendMessage(newData, [newData]);
    }

    w.addEventListener('message', e => {
      switch (e.message.type) {
        case 'progress':
          onProgress(e.message.message);
          break;
        case 'done':
          resolve(e.message.message);
          break;
      }
    });
  });
}
