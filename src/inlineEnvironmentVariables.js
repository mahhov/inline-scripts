#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const wrapper = require('./wrapper');

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

wrapper(inlineJsEnvVars);
