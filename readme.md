# Inline Scripts

`inline-script-tags` bundles files referenced by `<script>` tags into an output HTML.

`inline-requires` bundles `require` dependencies inside a single output JS.


# Installation

`npm i --save-dev inline-scripts`

# Example

## `inline-script-tags`

```html
<!-- src/index.html -->
<p>Welcome</p>
<script src="main.js"></script>
```

```js
// src/main.js
console.log('Welcome');
```

`$ inline-scripts src/index.html out/index.html`
 
```html
<!-- out/index.html -->
<p>Welcome</p>
<script>console.log('Welcome');</script>
```

## `inline-requires`

```js
// src/main.js
let math = require('./mathHelper');
console.log('10 ^ 2 =', math.square(10));
```

```js
// src/mathHelper.js
module.exports = {
	square: a => a * a,
	add: (a, b) => a + b,
	double: a => a * 2,
	increment: a => a++,
};

```

`$ inline-requires src/main.js out/main.js`
 
```js
// out/main.js
let dependencies = {
	'main': (require, module) => {
		let math = require('./mathHelper');
		console.log('10 ^ 2 =', math.square(10));
	},
	'mathHelper': (require, module) => {
		module.exports = {
			square: a => a * a,
			add: (a, b) => a + b,
			double: a => a * 2,
			increment: a => a++,
		};
	}
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
```
