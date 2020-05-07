#!/usr/bin/env node

const wrapper = require('./wrapper');
const script = require('../inlineEnvironmentVariables');

wrapper(script);
