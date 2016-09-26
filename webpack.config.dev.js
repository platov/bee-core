let path = require('path');

module.exports = {
    context: path.resolve('src'),

    devtool: 'inline-source-map',

    entry: ['./index'],

    output: {
        path         : path.resolve('dist'),
        filename     : 'bee-core.js',
        library      : 'beeCore',
        libraryTarget: 'umd'
    },

    module: {
        loaders: [
            {
                test   : /\.js$/,
                include: [path.resolve('src')],
                loader : 'babel'
            }
        ]
    }
};