#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

let inlineHtmlStyles = async htmlPath => {
	const linkTagRegex = /<link.+href="([\w.\-\/]+)css".*>/;
	let html = await fs.readFile(htmlPath, 'utf8');
	let stylesheetPromises = html
		.match(new RegExp(linkTagRegex, 'g'))
		.map(linkTag => linkTag.match(linkTagRegex)[1])
		.map(relPath => path.resolve(path.dirname(htmlPath), relPath + 'css'))
		.map(stylesheetPath => fs.readFile(stylesheetPath, 'utf8'));
	let i = 0;
	return Promise.all(stylesheetPromises).then(stylesheets =>
		html.replace(new RegExp(linkTagRegex, 'g'), () =>
			`<style>${stylesheets[i++]}</style>`));
};

module.exports = inlineHtmlStyles;
