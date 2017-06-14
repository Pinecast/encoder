import React from 'react';


export default (inputProps) =>
    <label>
        <span>{inputProps.title}</span>
        <input
            {...inputProps}
            type='text'
        />
    </label>;
