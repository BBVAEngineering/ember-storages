/* eslint-env node */
'use strict';

module.exports = {
	name: 'ember-storages',

	included: function included(app, parentAddon) {
		const target = (parentAddon || app);

		app.import('vendor/vendor-exports.js');

		return this._super.included(target);
	}
};
