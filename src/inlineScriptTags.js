#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

let inlineHtmlScripts = async options => {
	const scriptTagRegex = /<script (?:.* )?src="([\w.\-\/]+)".*><\/script>/;
	let htmlString, htmlPath = (typeof options === 'string') ? options : '';
	if (typeof options === 'object') ({ htmlString, htmlPath } = options);
	const html = htmlString || await fs.readFile(htmlPath, 'utf8');
	let matches = html.match(new RegExp(scriptTagRegex, 'g'));
	if (!matches)
		return html;
	let scriptPromises = matches
		.map(scriptTag => scriptTag.match(scriptTagRegex)[1])
		.map(relScriptPath => path.resolve(path.dirname(htmlPath), relScriptPath))
		.map(scriptPath => fs.readFile(scriptPath, 'utf8'));
	let i = 0;
	return Promise.all(scriptPromises).then(scripts =>
		html.replace(new RegExp(scriptTagRegex, 'g'), () =>
			`<script>${scripts[i++].replace(/<\/script>/g, '<\\/script>')}</script>`));
};

module.exports = inlineHtmlScripts;
