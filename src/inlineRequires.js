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
		let pathArray = path
			.relative(path.dirname(jsPath), curPath)
			.split(path.sep);
		dependencies.push({pathArray, file});
	}

	return dependencies;
};

let setDependencyPathStrings = (jsPath, dependencies) => {
	let maxUp = Math.max(...dependencies
		.map(({pathArray}) => pathArray.filter(a => a === '..').length));
	let rootPathArray = path.dirname(jsPath).split('/').slice(-maxUp);
	let rootPathString = path.posix.join(...rootPathArray);
	dependencies.forEach(dependency =>
		dependency.pathString = path.posix.join(rootPathString, ...dependency.pathArray)
			.replace(/.js$/, ''));
	return rootPathArray;
};

let inlineJsRequires = async jsPath => {
	let dependencies = await getDependencies(jsPath);
	let rootPathArray = setDependencyPathStrings(jsPath, dependencies);

	let dependenciesOutInner = dependencies
		.map(({pathString, file}) => `'${pathString}': (require, module) => {${file}}`)
		.join();
	let dependenciesOut = `let dependencies = {${dependenciesOutInner}};`;

	let fakeRequire = (currentPath, dependencyPath) => {
		currentPath = currentPath.slice(0, -1);
		dependencyPath
			.replace(/.js$/, '')
			.split('/')
			.filter(a => a !== '.')
			.forEach(pathFragment => {
				if (pathFragment === '..' && currentPath.length && currentPath[currentPath.length - 1] !== '..')
					currentPath.pop();
				else
					currentPath.push(pathFragment);
			});
		let module = {};
		dependencies[currentPath.join('/')](fakeRequire.bind(null, currentPath), module);
		return module.exports;
	};
	let fakeRequireOut = `let fakeRequire = ${fakeRequire.toString()};`;

	let startPathArray = [...rootPathArray, path.parse(jsPath).name];
	let startOut = `dependencies['${path.posix.join(...startPathArray)}'](fakeRequire.bind(null, [${startPathArray.map(a => `'${a}'`)}]));`;

	return dependenciesOut + fakeRequireOut + startOut;
};

module.exports = inlineJsRequires;
