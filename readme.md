# Inline Scripts

Bundles files referenced by script tags int an output HTML. 

# Installation

`npm i --save-dev inline-scripts`

# Usage

`$ inline-scripts <path-to-entry-HTML> <path-to-output-HTML>`

# Example

Given `src/index.html`:

```html
<p>Welcome</p>

<script src="main.js"></script>
```

And `src/main.js`:

```js
console.log('Welcome');
```

Then `$ inline-scripts src/index.html out/index.html` will create `out/index.html`:

```html
<p>Welcome</p>

<script>console.log('Welcome');</script>
```