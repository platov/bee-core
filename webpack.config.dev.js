let path = require('path');

module.exports = {
    context: path.resolve('src'),

    devtool: 'source-map',

    entry: ['./mediator.polyfill', './index'],

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