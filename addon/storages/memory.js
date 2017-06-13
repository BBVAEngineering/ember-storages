/* eslint-disable consistent-return */

import Ember from 'ember';
import StorageMixin from 'ember-storages/mixins/storage';

const {
	computed,
	ObjectProxy
} = Ember;

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
	initialContent: computed(() => Ember.Object.create()),

	/**
	 * Namespace to serialize keys.
	 *
	 * @property namespace
	 * @type String
	 * @default 'memory'
	 */
	namespace: 'memory'

});
