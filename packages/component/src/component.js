import Dropzone from 'react-dropzone';
import React, {PureComponent} from 'react';

import Manager from './manager';
import FileInstance from './file-instance';


export default class Encoder extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            files: [],
        };

        this.onDrop = this.onDrop.bind(this);
    }

    onDrop(acceptedFiles) {
        this.setState({
            files: [
                ...acceptedFiles.map(file => {
                    const manager = new Manager(file, this);
                    return manager.getEntry();
                }),
                ...this.state.files,
            ],
        });
    }

    render() {
        const dropzoneStyle = {
            border: '2px dashed #fff',
            cursor: 'pointer',
            margin: '20px auto 0',
            maxWidth: 700,
            padding: '50px 0',
            textAlign: 'center',
            transform: 'scale(1)',
            transition: 'transform 0.2s',
            width: 'auto',
        };

        const {files} = this.state;
        return <div>
            {!files.length &&
                <section>
                    <p>
                        At Pinecast, we see the lack of high-quality MP3 encoders available
                        to podcasters. The ones that exist are confusing and don't follow best
                        practices. So we made our own, Pinecoder.
                    </p>
                    <p>
                        To encode an MP3 for your podcast, export your episode as WAV, FLAC, or
                        192kbps MP3 and drag it into the box below. We'll walk you through the
                        rest.
                    </p>
                </section>}
            <Dropzone
                accept='audio/flac, audio/wav, audio/mpeg, audio/mp3'
                activeStyle={
                    Object.assign({}, dropzoneStyle, {transform: 'scale(1.05)'})
                }
                onDrop={this.onDrop}
                style={dropzoneStyle}
            >
                Drop source audio here
                <br />
                or <a href='' onClick={e => e.preventDefault()}>click to browse</a>
            </Dropzone>
            <div style={{padding: '50px 0'}}>
                {files.map((file, i) => <FileInstance {...file} key={i} />)}
            </div>
        </div>;
    }
};

