#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

let inlineImages = async htmlPath => {
	const imgTagRegex = /<img (?:.* )?src="([\w.\-\/]+)".*>/;
	let html = await fs.readFile(htmlPath, 'utf8');
	let imgPromises = html
		.match(new RegExp(imgTagRegex, 'g'))
		.map(imgTag => imgTag.match(imgTagRegex)[1])
		.map(relImgPath => path.resolve(path.dirname(htmlPath), relImgPath))
		.map(imgPath => fs.readFile(imgPath));
	let i = 0;
	return Promise.all(imgPromises).then(images =>
		html.replace(/(<img (?:.* )?src=")([\w.\-\/]+)(".*>)/g, (_match, p1, p2, p3) =>
			`${p1}data:${getMimeType(p2.split('.').pop())};base64, ${images[i++].toString('base64')}${p3}`
		));
};

function getMimeType(ext) {
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
}

module.exports = inlineImages;
