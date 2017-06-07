const path = require('path');

const webpack = require('webpack');


module.exports = {
    devtool: 'source-maps',
    entry: {
        app: ['./src/index.js']
    },
    resolve: {
        mainFields: [
            'jsnext:main',
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
        // new webpack.DefinePlugin({
        //     'process.env.NODE_ENV': '"production"',
        // }),
        // new webpack.optimize.UglifyJsPlugin({
        //     compress: {warnings: false},
        //     mangle: {},
        //     sourceMap: false,
        // }),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
        }),
    ],
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            },
        ],
    },
};
