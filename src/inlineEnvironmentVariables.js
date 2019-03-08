const fs = require('fs').promises;
const path = require('path');

let inlineJsEnvVars = async jsPath => {
	let file = await fs.readFile(jsPath, 'utf8');
	const envVarRegex = /process\.env\.(\w+)/;
	let envVarMatches = file.match(new RegExp(envVarRegex, 'g'));
	if (!envVarMatches)
		return file;
	let envVarValues = envVarMatches
		.map(envVarRef => envVarRef.match(envVarRegex)[1])
		.map(envVarName => process.env[envVarName])
		.map(envVarValue => envVarValue ? `'${envVarValue.replace("'", "\\'")}'` : '');
	let i = 0;
	return file.replace(new RegExp(envVarRegex, 'g'), () => envVarValues[i++]);
};

module.exports = inlineJsEnvVars;
