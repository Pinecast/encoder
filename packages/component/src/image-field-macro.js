import Dropzone from 'react-dropzone';
import React from 'react';



class ImageField extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            file: null,
            decoded: null,
        };

        this.onDrop = this.onDrop.bind(this);
    }

    onDrop(acceptedFiles) {
        if (!acceptedFiles.length) {
            return;
        }

        const file = acceptedFiles[0];
        this.setState({file, decoded: null});

        const fr = new FileReader();
        fr.onload = e => {
            this.props.decoder(e.target.result, file.type).then(
                decoded => this.setState({decoded}, () => this.props.onDrop()),
                err => {
                    console.error(err);
                    this.setState({file: null});
                }
            );
        };
        fr.onerror = () => {
            this.setState({file: null});
        };
        fr.readAsArrayBuffer(file);
    }

    get value() {
        return this.state.decoded || null;
    }
    render() {
        const dropzoneStyle = {
            border: '2px dashed #aaa',
            flex: '1 1',
            padding: 15,
            textAlign: 'center',
            transform: 'scale(1)',
            transition: 'transform 0.2s',
        };
        const {
            props: {preview},
            state: {decoded},
        } = this;
        const restProps = Object.assign({}, this.props, {decoder: undefined, preview: undefined});
        return <div
            style={{
                display: 'flex',
            }}
        >
            {decoded && preview(decoded)}
            <Dropzone
                {...restProps}
                activeStyle={Object.assign({}, dropzoneStyle, {transform: 'scale(1.05)'})}
                onDrop={this.onDrop}
                style={dropzoneStyle}
            />
        </div>;
    }
}


export default (inputProps) =>
    <label>
        <span>{inputProps.title}</span>
        <ImageField {...inputProps} />
    </label>;
