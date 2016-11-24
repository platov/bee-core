let path = require('path'),
    webpack = require('webpack');

module.exports = {
    context: path.resolve('src'),

    entry: ['./index'],

    output: {
        path         : path.resolve('dist'),
        filename     : 'bee-core.min.js',
        library      : 'beeCore',
        libraryTarget: 'umd'
    },

    externals: {
        jquery: {
            amd      : 'jquery',
            commonjs : 'jquery',
            commonjs2: 'jquery',
            root     : '$',
        }
    },

    module: {
        loaders: [
            {
                test   : /\.js$/,
                include: [path.resolve('src')],
                loader : 'babel',
                query  : {
                    presets: ['es2015'],
                    plugins: ['transform-runtime']
                }
            }
        ]
    },

    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: false,
            compress : {
                warnings: false
            }
        })
    ]
};