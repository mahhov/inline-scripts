const fs = require('fs').promises;
const path = require('path');

let wrapper = async handler => {
	if (process.argv.length < 3)
		return console.error('Expected at least 1 parameters: entry HTML path and write HTML path if different than entry.');
	let entryPath = process.argv[2];
	let outputPath = process.argv[3] || entryPath;

	let output = await handler(entryPath);
	await fs.mkdir(path.dirname(outputPath), {recursive: true});
	fs.writeFile(outputPath, output);
};

module.exports = wrapper;
