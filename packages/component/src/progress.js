import React from 'react';


const Progress = ({indeterminate = false, max, value}) =>
    <div className='progress-bar-wrapper'>
        <div className='progress-bar'>
            <div className={indeterminate ? 'indeterminate' : 'determinate'} style={{width: indeterminate ? null : `${value / max * 100}%`}}></div>
        </div>
        <span>{`${Math.round(value / max * 100)}%`}</span>
    </div>;

export default Progress;
