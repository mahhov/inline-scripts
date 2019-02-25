#!/usr/bin/env node

const wrapper = require('./wrapper');
const script = require('../inlineRequires');

wrapper(script);
