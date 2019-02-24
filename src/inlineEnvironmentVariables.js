#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

let inlineJsEnvVars = async jsPath => {
	let file = await fs.readFile(jsPath, 'utf8');
	const envVarRegex = /process\.env\.(\w+)/;
	let envVarValues = file
		.match(new RegExp(envVarRegex, 'g'))
		.map(envVarRef => envVarRef.match(envVarRegex)[1])
		.map(envVarName => process.env[envVarName])
		.map(envVarValue => `'${envVarValue.replace("'", "\\'")}'`);
	let i = 0;
	return file.replace(new RegExp(envVarRegex, 'g'), () => envVarValues[i++]);
};

let main = async () => {
	if (process.argv.length !== 4)
		return console.error('Expected 2 parameters: entry JS path and write JS path.');
	let jsPath = process.argv[2];
	let jsOutPath = process.argv[3];

	let inlinedJs = await inlineJsEnvVars(jsPath);
	await fs.mkdir(path.dirname(jsOutPath), {recursive: true});
	fs.writeFile(jsOutPath, inlinedJs);
};

main();
