#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

let inlineHtmlScripts = async htmlPath => {
	const scriptTagRegex = /<script src="([\w.\/]+)"><\/script>/;
	let html = await fs.readFile(htmlPath, 'utf8');
	let scriptPromises = html
		.match(new RegExp(scriptTagRegex, 'g'))
		.map(scriptTag => scriptTag.match(scriptTagRegex)[1])
		.map(relScriptPath => path.resolve(path.dirname(htmlPath), relScriptPath))
		.map(scriptPath => fs.readFile(scriptPath, 'utf8'));
	let i = 0;
	return Promise.all(scriptPromises).then(scripts =>
		html.replace(new RegExp(scriptTagRegex, 'g'), () =>
			`<script>${scripts[i++]}</script>`));
};

module.exports = inlineHtmlScripts;
