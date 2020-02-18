/* eslint-disable consistent-return */

import EmberObject, { computed } from '@ember/object';

import ObjectProxy from '@ember/object/proxy';
import StorageMixin from 'ember-storages/mixins/storage';

/**
 * Storage base to implement memory or local storage functionality.
 *
 * @extends Ember.ObjectProxy
 * @uses StorageMixin
 */
export default ObjectProxy.extend(StorageMixin, {

	/**
	 * Initial content.
	 *
	 * @property initialContent
	 * @type {Object}
	 * @default Ember.Object
	 */
	// "ember/no-arrow-function-computed-properties" conflicts with "prefer-arrow-callback"
	// eslint-disable-next-line ember/no-arrow-function-computed-properties
	initialContent: computed(() => EmberObject.create()),

	/**
	 * Namespace to serialize keys.
	 *
	 * @property namespace
	 * @type String
	 * @default 'memory'
	 */
	namespace: 'memory'

});
