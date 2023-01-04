const path = require('path')

module.exports = ((env, argv) => {
  return {
		entry: './src/index.ts',
		output: {
			path: path.resolve(__dirname, 'dist'),
			filename: 'bundle.js',
		},

		module: {
			rules: [
				{
					test: /\.ts?$/,
					use: 'ts-loader',
				},
				{
					test: /\.css?$/,
					use: 'css-loader',
				}
			]
		},
		resolve: {
			extensions: ['.ts', '.js']
		},

		mode: env?.production ? 'production' : 'development',
		devtool: 'source-map',
	}
})()