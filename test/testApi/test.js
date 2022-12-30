const fs = require('fs/promises');
const {inlineEnvironmentVariables, inlineScriptTags, inlineStylesheets, inlineImages} = require('../../src/index');

fs.readFile('./testfiles/main.js', { encoding: 'utf8' })
.then (jsString => inlineEnvironmentVariables({ jsPath: './testfiles/myScript.js', jsString }))
.then (jsString => console.log('process.env.PORT should have been replaced:', jsString));

inlineScriptTags('./testfiles/index.html')
.then (htmlString => inlineStylesheets({ htmlPath: './testfiles/index.html', htmlString }))
.then (htmlString => inlineImages({ htmlPath: './testfiles/index.html', htmlString }))
.then (htmlString => console.log(htmlString))
