#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

let inlineImages = async htmlPath => {
	const imgTagRegex = /<img (.* )?src="?([\w.\-\/]+)"?(.*)>/;
	let html = await fs.readFile(htmlPath, 'utf8');
	let matches = html.match(new RegExp(imgTagRegex, 'g'));
	if (!matches)
		return html;
	let imgPromises = matches
		.map(imgTag => imgTag.match(imgTagRegex)[2])
		.map(relImgPath => path.resolve(path.dirname(htmlPath), relImgPath))
		.map(imgPath => fs.readFile(imgPath));
	let i = 0;
	return Promise.all(imgPromises).then(images =>
		html.replace(new RegExp(imgTagRegex, 'g'), (_match, p1, p2, p3) =>
			`<img ${p1 || ''}src="data:${getMimeType(p2.split('.').pop())};base64, ${images[i++].toString('base64')}"${p3}>`
		));
};

let getMimeType = ext => {
	switch (ext) {
		case 'jpg':
		case 'jpeg':
			return 'image/jpeg';
		case 'svg':
			return 'image/svg+xml';
		case 'gif':
		case 'png':
		case 'webp':
			return `image/${ext}`;
		default:
			return 'application/octet-stream';
	}
};

module.exports = inlineImages;
