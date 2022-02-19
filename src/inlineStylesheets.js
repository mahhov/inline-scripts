#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

let inlineHtmlStyles = async htmlPath => {
	const linkTagRegex = /<link (?:[^>]* )?rel="stylesheet"(?:[^>]* )?href="([\w.\-\/]+)"[^>]*>|<link (?:[^>]* )?href="([\w.\-\/]+)"(?:[^>]* )?rel="stylesheet"[^>]*>/;
	let html = await fs.readFile(htmlPath, 'utf8');
	let matches = html.match(new RegExp(linkTagRegex, 'g'));
	if (!matches)
		return html;
	let stylesheetPromises = matches
		.map(linkTag => {
			let m = linkTag.match(linkTagRegex);
			return m[1] || m[2];
		})
		.map(relPath => path.resolve(path.dirname(htmlPath), relPath))
		.map(stylesheetPath => fs.readFile(stylesheetPath, 'utf8'));
	let i = 0;
	return Promise.all(stylesheetPromises).then(stylesheets =>
		html.replace(new RegExp(linkTagRegex, 'g'), () =>
			`<style>${stylesheets[i++]}</style>`));
};

module.exports = inlineHtmlStyles;
