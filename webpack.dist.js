'use strict';

var webpack = require('webpack');
var config = require('./webpack.config');

config.output.filename = 'build/respoke.min.js';
config.output.sourceMapFilename = 'build/respoke.min.map';
config.devtool = 'source-map';

config.plugins.push(new webpack.BannerPlugin(
    'Copyright (c) 2014, Digium, Inc. All Rights Reserved. MIT Licensed.' +
    'For details and documentation visit https://www.respoke.io'
));
// run the bundle through UglifyJS2
config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    mangle: false,
    compress: false
}));

module.exports = config;
