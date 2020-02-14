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
