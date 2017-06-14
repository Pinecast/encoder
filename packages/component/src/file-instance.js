import React from 'react';

import Progress from './progress';
import textInput from './text-field-macro';


const metadataFields = ['title', 'author', 'podcast'];

export default class FileInstance extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasMetadata: false,
        };

        this.onMetadataInput = () => this.setState({hasMetadata: metadataFields.some(f => this.refs[f].value)});
    }
    render() {
        const {id3Written, inst, progress, quality} = this.props;
        const {hasMetadata} = this.state;

        return <div className='instance-progress'>
            <div>{inst.getName()}</div>
            {quality === null ?
                <div className='quality-choice-wrapper panel'>
                    <p>What quality do you wish to encode this file at?</p>
                    <div className='quality-choice'>
                        <button type='button' onClick={() => inst.setQuality('low')}>
                            Good <span>(Small File)</span>
                        </button>
                        <button type='button' onClick={() => inst.setQuality('medium')}>
                            Quite Good <span>(Medium File)</span>
                        </button>
                    </div>
                </div> :
                <Progress indeterminate={progress === 0} value={progress} max={100} />}
            {inst.encodedData && !id3Written &&
                <form
                    action='#'
                    className='panel'
                    onSubmit={e => {
                        e.preventDefault();
                        if (!hasMetadata) {
                            inst.writeID3(null);
                        } else {
                            inst.writeID3(metadataFields.reduce((acc, cur) => {
                                acc[cur] = this.refs[cur].value || null;
                                return acc;
                            }, {}));
                        }
                    }}
                    style={{
                        margin: '15px auto 0',
                        maxWidth: 400,
                    }}
                >
                    <p>Add metadata?</p>
                    {textInput({ref: 'title', title: 'Title', onInput: this.onMetadataInput})}
                    {textInput({ref: 'author', title: 'Author', onInput: this.onMetadataInput})}
                    {textInput({ref: 'podcast', title: 'Podcast Name', onInput: this.onMetadataInput})}

                    <div>
                        <button type='submit'>
                            {hasMetadata ? 'Add Metadata' : 'Skip'}
                        </button>
                    </div>
                </form>}
            {inst.encodedData && id3Written &&
                <a download={inst.getName().replace(/\.\w+$/, '') + '.mp3'} href={inst.url}>
                    Download MP3
                </a>}
        </div>;
    }
};
