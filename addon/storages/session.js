/* eslint-disable consistent-return */

import Ember from 'ember';
import LocalStorage from 'ember-storages/storages/local';

const { computed } = Ember;

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
