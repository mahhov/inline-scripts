const fs = require('fs').promises;
const path = require('path');

let wrapper = async handler => {
	if (process.argv.length !== 4)
		return console.error('Expected 2 parameters: entry HTML path and write HTML path. If they are the same, you may use `.` as teh 2nd parameter.');
	let entryPath = process.argv[2];
	let outputPath = process.argv[3] === '.' ? entryPath : process.argv[3];

	let output = await handler(entryPath);
	await fs.mkdir(path.dirname(outputPath), {recursive: true});
	fs.writeFile(outputPath, output);
};

module.exports = wrapper;
