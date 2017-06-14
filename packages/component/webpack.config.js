const path = require('path');

const webpack = require('webpack');
const BabiliPlugin = require('babili-webpack-plugin');
const ExternalsPlugin = require("webpack/lib/ExternalsPlugin");


const externals = [
    function(context, request, callback) {
        if (request === 'fs') {
            return callback(null, '{}');
        }
        if (request === 'use-strict') {
            return callback(null, 'null');
        }
        return callback();
    }
];


// check out this sick monkeypatch
const workerLoader = require('@pinecast/encoder-worker/node_modules/worker-loader');
const origPitch = workerLoader.pitch;
workerLoader.pitch = function(request) {
    const options = this.options;
    const origCompiler = this._compilation;
    const newCompiler = Object.assign(
        {},
        origCompiler,
        {
            createChildCompiler: function(type, options) {
                const output = origCompiler.createChildCompiler(type, options);
                if (type !== 'worker') {
                    return output;
                }
                output.apply(new ExternalsPlugin(null, externals));

                return output;
            },
        }
    );
    this._compilation = newCompiler;
    const output = origPitch.apply(this, arguments);
    this._compilation = origCompiler;
    return output;
};


module.exports = {
    devtool: 'source-maps',
    entry: {
        app: ['./src/index.js']
    },
    resolve: {
        mainFields: [
            'jsnext:main',
            'module',
            'main',
        ],
    },
    cache: false,
    output: {
        path: path.resolve(__dirname, 'build'),
        publicPath: '/',
        filename: 'pinecoder.js',
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"',
        }),
        // new BabiliPlugin(),
        // new webpack.LoaderOptionsPlugin({
        //     minimize: true,
        // }),
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            },
        ],
    },
    externals,
};
