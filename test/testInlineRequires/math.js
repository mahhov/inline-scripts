let mathHelper = require('./mathHelper');
module.exports = {
	magic: a => mathHelper.add(mathHelper.double(mathHelper.double(a)), 10),
};
