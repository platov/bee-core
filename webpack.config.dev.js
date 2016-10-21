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
        jquery: 'jQuery',
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
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
        })
    ]
};