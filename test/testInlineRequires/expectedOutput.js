let dependencies = {
	'./main': (require, module) => {
		let math = require('./math');
		console.log('magic of 10 is 50?', math.magic(10));
	},

	'./mathHelper': (require, module) => {
		module.exports = {
			square: a => a * a,
			add: (a, b) => a + b,
			double: a => a * 2,
			increment: a => a++,
		};
	},

	'./math': (require, module) => {
		let mathHelper = require('./mathHelper');
		module.exports = {
			magic: a => mathHelper.add(mathHelper.double(mathHelper.double(a)), 10),
		};
	},
};

let fakeRequire = dependencyPath => {
	let module = {};
	dependencies[dependencyPath](fakeRequire, module);
	return module.exports;
};

dependencies['./main'](fakeRequire);


// todo nesteed dependencies - done?
// todo relative path resolveer and optional .js
// todo naming main.js
