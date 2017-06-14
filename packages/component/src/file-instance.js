import React from 'react';

import Progress from './progress';
import textInput from './text-field-macro';
import imageInput from './image-field-macro';


const metadataFields = ['title', 'author', 'podcast', 'art'];

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
                    {imageInput({
                        accept: 'image/png, image/jpeg, image/jpg',
                        decoder: (buffer, mime) => new Promise((resolve, reject) => {
                            const blob = new Blob([buffer], {type: mime});
                            const u = URL.createObjectURL(blob);
                            const img = new Image();
                            img.src = u;
                            img.onload = () => {
                                URL.revokeObjectURL(u);

                                const canvas = document.createElement('canvas');
                                const size = Math.min(img.height, img.width);
                                canvas.width = canvas.height = size;
                                const ctx = canvas.getContext('2d');
                                if (img.height < img.width) {
                                    ctx.drawImage(img, size / 2 - img.width / 2, 0);
                                } else {
                                    ctx.drawImage(img, 0, size / 2 - img.height / 2);
                                }
                                canvas.toBlob(
                                    resizedBlob => {
                                        const fr = new FileReader();
                                        fr.onload = e => resolve(e.target.result);
                                        fr.onerror = reject;
                                        fr.readAsArrayBuffer(resizedBlob);
                                    },
                                    'image/jpeg',
                                    0.6
                                );
                            };
                            img.onerror = err => {
                                reject(err);
                                URL.revokeObjectURL(u);
                            };
                        }),
                        children: <div>
                            Drop a PNG or JPEG here<br />
                            or <a href='' onClick={e => e.preventDefault()}>click to browse</a>
                        </div>,
                        onDrop: this.onMetadataInput,
                        preview: decoded => {
                            const targetSize = 68;
                            const size = targetSize * 3;
                            return <canvas
                                height={size}
                                ref={el => {
                                    if (!el) {
                                        return;
                                    }
                                    const ctx = el.getContext('2d');
                                    const img = new Image();
                                    const blob = new Blob([decoded], {type: 'image/jpeg'});
                                    const u = URL.createObjectURL(blob);
                                    img.onload = () => {
                                        ctx.drawImage(img, 0, 0, size, size);
                                        URL.revokeObjectURL(u);
                                    };
                                    img.src = u;
                                }}
                                style={{
                                    marginRight: 15,
                                    height: targetSize,
                                    width: targetSize,
                                }}
                                width={size}
                            />;
                        },
                        ref: 'art',
                        title: 'Episode Artwork',
                    })}

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
