let dependencies = {
	'main': (require, module) => {
		let math = require('./math');
		console.log('magic of 10 is 50?', math.magic(10));
	},

	'nested,mathHelper': (require, module) => {
		module.exports = {
			square: a => a * a,
			add: (a, b) => a + b,
			double: a => a * 2,
			increment: a => a++,
		};
	},

	'math': (require, module) => {
		let mathHelper = require('./nested/mathHelper');
		module.exports = {
			magic: a => mathHelper.add(mathHelper.double(mathHelper.double(a)), 10),
		};
	},
};

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

dependencies['main'](fakeRequire.bind(null, ['main']));
