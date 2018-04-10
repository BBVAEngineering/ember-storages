/* eslint-env node */
const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
	const app = new EmberAddon(defaults, {
		// Add options here
	});


	/*
	  This build file specifies the options for the dummy test app of this
	  addon, located in `/tests/dummy`
	  This build file does *not* influence how the addon or the app using it
	  behave. You most likely want to be modifying `./index.js` or app's build file
	*/

	app.import({
		development: 'bower_components/moment/moment.js',
		production: 'bower_components/moment/min/moment.min.js'
	});

	app.import('bower_components/moment/locale/es.js');
	app.import('bower_components/moment/locale/en-gb.js');
	app.import('bower_components/moment/locale/ca.js');
	app.import('bower_components/moment/locale/eu.js');
	app.import('bower_components/moment/locale/gl.js');

	return app.toTree();
};
