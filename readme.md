# Inline Scripts

This package contains scripts that help build client code:

- `inline-script-tags` inlines files referenced by `<script>` tags into an output HTML.

- `inline-stylesheets` inlines stylesheets referenced by `<link>` tags into an output HTML.

- `inline-requires` bundles `require` dependencies inside a single output JS.

- `inline-environment-variables` replaces references to `process.env.<envVarName>` with their values in a JS file.

# Installation

`npm i --save-dev inline-scripts`

# CLI Examples

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

## `inline-stylesheets`

```html
<!-- src/index.html -->
<p>Welcome</p>
<link rel="stylesheet" href="style.css">
```

```css
/* src/style.css */
body {
	color: red;
}
```

`$ inline-stylesheets src/index.html out/index.html`

```html
<!-- out/index.html -->
<p>Welcome</p>
<style>body {
	color: red;
}</style>
```

## `inline-images`

```html
<!-- src/index.html -->
<p>Welcome</p>
<img src="red_dot.png">
```

`$ inline-images src/index.html out/index.html`

```html
<!-- out/index.html -->
<p>Welcome</p>
<img src="data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==">
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

## `inline-environment-variables`


```js
// src/main.js
console.log('server URL is' + process.env.SERVER_URL);
```

`$ inline-environment-variables src/main.js out/main.js`

```js
// out/main.js
console.log('server URL is' + 'https://api.github.com');
```

## Note on parameters

All scripts usually take 2 parameters: the input and output files.

`$ inline-scripts src/index.html out/index.html .`

For convenience, if the 2nd parameter is `.`, the output will replace the input file.

`$ inline-scripts out/index.html .`

# JS API

`const {inlineEnvironmentVariables, inlineRequires, inlineScriptTags, inlineStylesheets, inlineImages} = require('inline-scripts');`

Each of the functions take a string path to the entry file as their single parameter and returns a promise that resolves to the computed output.

To make it easy to perform multiple operations you can pass the output of each to the input for the next operation. Rather than pass a string path to `inlineScriptTag`, `inlineStylesheets` and `inlineImage` you can pass a hash with the file path and an html string. Both the path and string must be supplied. Rather than read the file it uses the supplied string as input. The path is required to resolve relative references to the css, js or image files.
```js
{ 
	htmlPath: '/path-to-file.html',
	htmlString: 'string-containing-html'
}
```
`inlineEnvironmentVariables` also takes either a string with the file path or a hash with either a path or a string (if both are present then the string is used and the path is ignored):
```js
{ 
	jsPath: '/path-to-file.js',
	jsString: 'string-containing-js'
}
```
An example of inlining scripts, stylesheets and images:
```js
inlineScriptTags('./index.html')
.then (htmlString => inlineStylesheets({ htmlPath: './index.html', htmlString }))
.then (htmlString => inlineImages({ htmlPath: './index.html', htmlString }))
.then (htmlString => fs.writeFileSync('./dist/index.html', htmlString));

```
