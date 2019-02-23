#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

let getDependencies = async jsPath => {
	const requireRegex = /require\([`'"]([\w\/.]*)[`'"]\)/;

	let added = [];
	let pending = [path.resolve(jsPath)];

	let dependencies = [];
	while (pending.length) {
		let curPath = pending.pop();
		if (added.includes(curPath))
			continue;
		added.push(curPath);

		let file = await fs.readFile(curPath, 'utf8');
		let requires = file.match(new RegExp(requireRegex, 'g'));
		if (requires)
			requires
				.map(require => require.match(requireRegex)[1])
				.map(path => path.match(/\.\w*$/) ? path : path + '.js')
				.map(pathI => path.resolve(path.dirname(curPath), pathI))
				.forEach(path => pending.push(path));
		let pathString = path
			.relative(path.dirname(jsPath), curPath)
			.split(path.sep)
			.toString()
			.replace(/.js$/, '');
		dependencies.push({pathString, file});
	}

	return dependencies;
};

let inlineJsRequires = async jsPath => {
	let dependencies = await getDependencies(jsPath);
	let dependenciesOutInner = dependencies
		.map(({pathString, file}) => `'${pathString}': (require, module) => {${file}}`)
		.join();
	let dependenciesOut = `let dependencies = {${dependenciesOutInner}};`;

	let fakeRequire = (currentPath, dependencyPath) => {
		currentPath.pop();
		dependencyPath
			.replace(/.js$/, '')
			.split('/')
			.filter(a => a !== '.')
			.forEach(pathFragment => {
				if (pathFragment === '..')
					currentPath.pop();
				else
					currentPath.push(pathFragment);
			});

		let module = {};
		dependencies[currentPath.toString()](fakeRequire.bind(null, currentPath), module);
		return module.exports;
	};
	let fakeRequireOut = `let fakeRequire = ${fakeRequire.toString()};`;

	let start = path.parse(jsPath).name;
	let startOut = `dependencies['${start}'](fakeRequire.bind(null, ['${start}']));`;

	return dependenciesOut + fakeRequireOut + startOut;
};

let main = async () => {
	if (process.argv.length !== 4)
		return console.error('Expected 2 parameters: entry JS path and write JS path.');
	let jsPath = process.argv[2];
	let jsOutPath = process.argv[3];

	let inlinedJs = await inlineJsRequires(jsPath);
	await fs.mkdir(path.dirname(jsOutPath), {recursive: true});
	fs.writeFile(jsOutPath, inlinedJs);
};

main();
