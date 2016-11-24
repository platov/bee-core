let path = require('path');

module.exports = {
    context: path.resolve('src'),

    entry: ['./index'],

    output: {
        path         : path.resolve('dist'),
        filename     : 'bee-core.js',
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
    }
};