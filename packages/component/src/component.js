import Dropzone from 'react-dropzone';
import React, {PureComponent} from 'react';

import encode from '@pinecast/encoder-worker';

class Manager {
    constructor(file, component) {
        this.file = file;
        this.component = component;
        this.progress = 0;
        this.error = null;
        encode(
            file,
            progress => {
                this.progress = progress;
                this.update();
            }
        ).then(
            () => {
                this.progress = 100;
                this.update();
            },
            err => {
                this.error = err;
                this.update();
            },
        );
    }

    getName() {
        return this.file.name;
    }
    update() {
        this.component.setState({
            files: this.component.state.files.map(file => file.getEntry()),
        });
    }
    getEntry() {
        return {
            progress: this.progress,
            inst: this,
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
                ...this.state.files,
                ...acceptedFiles.map(file => {
                    const manager = new Manager(file, this);
                    return manager.getEntry();
                }),
            ],
        });
    }

    render() {
        return <div>
            <Dropzone onDrop={this.onDrop}>
                Drop audio files here
            </Dropzone>
            {this.state.files.map(file =>
                <div>
                    <div>{file.getName()}</div>
                    <div>
                        <progress value={file.progress} max={100} />
                    </div>
                </div>
            )}
        </div>;
    }
};

