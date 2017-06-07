const audioDecode = require('audio-decode');
const lame = require('lamejs');


self.addEventListener('message', e => {
  //
});


function send(type, message) {
  self.sendMessage({type, message});
}
