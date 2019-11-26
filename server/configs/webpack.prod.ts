/* eslint-disable global-require, @typescript-eslint/no-var-requires */
import { resolve } from 'path';
import { argv } from 'yargs';
import { Plugin, HashedModuleIdsPlugin } from 'webpack';
import merge from 'webpack-merge';
import CopyPlugin from 'copy-webpack-plugin';
import SpeedMeasurePlugin from 'speed-measure-webpack-plugin';
import { BundleAnalyzerPlugin as TempBundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import CompressionPlugin from 'compression-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import SizePlugin from 'size-plugin';
import HardSourceWebpackPlugin from 'hard-source-webpack-plugin';
import commonConfig from './webpack.common';

const projectRoot = resolve(__dirname, '../../');

const plugins: Plugin[] = [
    new CopyPlugin([
        {
            from: resolve(projectRoot, 'public'),
            ignore: ['*.html'],
        },
        {
            from: resolve(projectRoot, 'src/manifest.prod.json'),
            to: 'manifest.json',
        },
    ]),
    new CompressionPlugin({
        test: /\.(js|css|html|svg)$/,
        algorithm: 'gzip',
        cache: true,
        threshold: 10240,
        minRatio: 0.9,
    }),
    new HashedModuleIdsPlugin({
        hashFunction: 'sha256',
        hashDigest: 'hex',
        hashDigestLength: 20,
    }),
    new SizePlugin({ writeFile: false }),
    new HardSourceWebpackPlugin({
        info: { mode: 'none', level: 'error' },
    }),
];

if (argv.analyze) {
    // eslint-disable-next-line prefer-destructuring
    const BundleAnalyzerPlugin: typeof TempBundleAnalyzerPlugin = require('webpack-bundle-analyzer')
        .BundleAnalyzerPlugin;
    plugins.push(new BundleAnalyzerPlugin({ openAnalyzer: true }));
}

const mergedConfig = merge(commonConfig, {
    mode: 'production',
    plugins,
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                cache: true,
                parallel: true,
                sourceMap: true,
                extractComments: false,
                terserOptions: {
                    output: {
                        comments: false,
                    },
                },
            }),
        ],
    },
});

const smp = new SpeedMeasurePlugin();
const devConfig = smp.wrap(mergedConfig);

export default devConfig;
