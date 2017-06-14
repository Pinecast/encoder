import ID3Writer from 'browser-id3-writer';

import encode from '@pinecast/encoder-worker';


export default class Manager {
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
        if (metadata.art) {
            writer.setFrame(
                'APIC',
                {
                    type: 3,
                    data: metadata.art,
                    description: 'Episode Artwork',
                }
            );
        }
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
};
