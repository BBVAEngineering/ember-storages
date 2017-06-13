import LocalStorage from 'ember-storages/storages/local';

/**
 * Storage base to implement memory or local storage functionality.
 *
 * @extends LocalStorage
 */
export default LocalStorage.extend({

	/**
	 * Namespace to serialize keys.
	 *
	 * @property namespace
	 * @type String
	 * @default 'cache'
	 */
	namespace: 'cache'

});
