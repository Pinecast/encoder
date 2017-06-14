import Dropzone from 'react-dropzone';
import ID3Writer from 'browser-id3-writer';
import React, {PureComponent} from 'react';

import encode from '@pinecast/encoder-worker';

import FileInstance from './file-instance';


class Manager {
    constructor(file, component) {
        this.file = file;
        this.component = component;
        this.progress = 0;
        this.error = null;

        this.blob = null;
        this.url = null;

        this.quality = null;
        this.id3Written = false;
    }

    setQuality(quality) {
        this.quality = quality;
        this.doEncode();
    }

    doEncode() {
        encode(
            this.file,
            this.quality,
            progress => {
                this.progress = progress;
                this.update();
            }
        ).then(
            encodedData => {
                this.progress = 100;
                this.encodedData = encodedData;

                this.update();
            },
            err => {
                this.error = err;
                this.update();
            },
        );
    }
    writeID3(metadata) {
        if (!metadata) {
            this.id3Written = true;
            this.blob = new Blob([this.encodedData], {type: 'audio/mp3'});
            this.url = URL.createObjectURL(this.blob);
            this.update();
            return;
        }

        const writer = new ID3Writer(this.encodedData);
        if (metadata.title) writer.setFrame('TIT2', String(metadata.title));
        if (metadata.author) {
            writer.setFrame('TPE1', [String(metadata.author)]);
            writer.setFrame('TPE2', String(metadata.author));
        }
        if (metadata.podcast) writer.setFrame('TALB', String(metadata.podcast));
        writer.setFrame('TCON', ['Podcast']);
        writer.addTag();

        this.id3Written = true;
        this.blob = writer.getBlob();
        this.url = URL.createObjectURL(this.blob);
        this.update();
    }

    getName() {
        return this.file.name;
    }
    update() {
        this.component.setState({
            files: this.component.state.files.map(file => file.inst.getEntry()),
        });
    }
    getEntry() {
        return {
            id3Written: this.id3Written,
            inst: this,
            progress: this.progress,
            quality: this.quality,
        };
    }
}


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
        return <div>
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
                or <a href=''>click to browse</a>
            </Dropzone>
            <div style={{padding: '50px 0'}}>
                {this.state.files.map((file, i) => <FileInstance {...file} key={i} />)}
            </div>
        </div>;
    }
};

