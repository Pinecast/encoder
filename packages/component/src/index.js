import React from 'react';
import ReactDOM from 'react-dom';

import Encoder from './component';


Array.from(document.querySelectorAll('[data-pinecoder]')).forEach(elem => {
    ReactDOM.render(
        <Encoder />,
        elem
    );
});
