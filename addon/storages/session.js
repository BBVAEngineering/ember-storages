/* eslint-disable consistent-return */

import { computed } from '@ember/object';

import LocalStorage from 'ember-storages/storages/local';

/**
 * Implementation of memory storage on local storage.
 *
 * @extends LocalStorage
 * @uses StorageMixin
 */
export default LocalStorage.extend({

	/**
	 * Storage adapter.
	 *
	 * @property adapter
	 * @type {Object}
	 * @default window.localStorage
	 */
	// "ember/no-arrow-function-computed-properties" conflicts with "prefer-arrow-callback"
	// eslint-disable-next-line ember/no-arrow-function-computed-properties
	adapter: computed(() => window.sessionStorage),

	/**
	 * Namespace to serialize keys.
	 *
	 * @property namespace
	 * @type String
	 * @default 'session'
	 */
	namespace: 'session'

});
