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
	let rootPath = path.posix.join(...path.dirname(jsPath).split(path.sep).slice(-maxUp));
	dependencies.forEach(dependency =>
		dependency.pathString = path.posix.join(rootPath, ...dependency.pathArray)
			.replace(/.js$/, ''));
	return rootPath;
};

let inlineJsRequires = async jsPath => {
	let dependencies = await getDependencies(jsPath);
	let rootPath = setDependencyPathStrings(jsPath, dependencies);

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

	let start = [rootPath, path.parse(jsPath).name];
	let startOut = `dependencies['${path.posix.join(...start)}'](fakeRequire.bind(null, [${start.map(a => `'${a}'`)}]));`;

	return dependenciesOut + fakeRequireOut + startOut;
};

module.exports = inlineJsRequires;
