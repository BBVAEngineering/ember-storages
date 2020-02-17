/* eslint-disable consistent-return */

import { A } from '@ember/array';

import EmberObject, { computed } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import { schedule } from '@ember/runloop';
import { typeOf, isPresent } from '@ember/utils';
import StorageMixin from 'ember-storages/mixins/storage';

/**
 * Implementation of memory storage on local storage.
 *
 * @extends Ember.ObjectProxy
 * @uses StorageMixin
 */
export default ObjectProxy.extend(StorageMixin, {

	/**
	 * Storage adapter.
	 *
	 * @property adapter
	 * @type {Object}
	 * @default window.localStorage
	 */
	// "ember/no-arrow-function-computed-properties" conflicts with "prefer-arrow-callback"
	// eslint-disable-next-line ember/no-arrow-function-computed-properties
	adapter: computed(() => window.localStorage),

	/**
	 * Initial content.
	 *
	 * @property initialContent
	 * @type {Object}
	 * @default Ember.Object
	 */
	initialContent: computed(function() {
		const content = EmberObject.create();
		const adapter = this.get('adapter');

		if (!adapter) {
			return content;
		}

		// Loop localStorage keys.
		for (let i = 0; i < adapter.length; i++) {
			const key = adapter.key(i);
			const keyData = this.deserializeKey(key);

			// Set data if key namespace matches with the storage one.
			if (this.get('namespace') === keyData.namespace) {
				const value = this.deserialize(adapter.getItem(key));

				// Sync memory.
				if (isPresent(value)) {
					content.set(key, value);
				}
			}
		}

		return content;
	}),

	/**
	 * Namespace to serialize keys.
	 *
	 * @property namespace
	 * @type String
	 * @default 'local'
	 */
	namespace: 'local',

	/**
	 * Clear all properties on adapter.
	 *
	 * @method clear
	 */
	clear() {
		this.keys().forEach((key) => {
			key = this.serializeKey(key);
			this._delete(key);
		});
	},

	/**
	 * Returns all keys from adapter;
	 *
	 * @method keys
	 * @return Array
	 */
	keys() {
		const adapter = this.get('adapter');
		const keys = this._super();

		if (adapter) {
			for (let i = 0; i < adapter.length; i++) {
				const key = adapter.key(i);
				const keyData = this.deserializeKey(key);

				// Set data if key namespace matches with the storage one.
				if (this.get('namespace') === keyData.namespace) {
					keys.addObject(keyData.key);
				}
			}
		}

		return keys;
	},

	/**
	 * Setter of unknown properties.
	 *
	 * @method _save
	 * @param {String} key
	 * @param {Mixed} value
	 */
	_save(key) {
		// Save to memory.
		this._super(...arguments);

		if (!this.get('adapter')) {
			return;
		}

		// Defer localStorage call.
		schedule('actions', this, () => {
			const keyParts = key.split('.');
			const isNestedProperty = keyParts.length > 1;

			if (isNestedProperty) {
				// Update root value
				key = keyParts[0];
			}

			// Retrieve value from memory storage.
			const value = this.get(`content.${key}`);

			if (value) {
				const serializedValue = this.serialize(value);

				if (serializedValue) {
					this._saveToAdapter(key, serializedValue);
				}
			}
		});
	},

	/**
	 * Error control for localstorage setItem.
	 *
	 * @method _saveToAdapter
	 * @param {String} key
	 * @param {Mixed} serializedValue
	 */
	_saveToAdapter(key, serializedValue) {
		try {
			this.get('adapter').setItem(key, serializedValue);
		} catch (e) {
			// Sometimes we can't set data to the localStorage, for example
			// in some browsers incognito mode.
			return false;
		}
	},

	/**
	 * Callback executed to delete a property from content.
	 *
	 * @method _delete
	 * @param {String} key
	 */
	_delete(key) {
		// Delete from memory.
		this._super(...arguments);

		if (this.get('adapter')) {
			// Defer localStorage deletion.
			schedule('actions', this, '_deleteFromAdapter', key);
		}
	},

	/**
	 * Error control for localstorage removeItem.
	 *
	 * @method _deleteFromAdapter
	 * @param {String} key
	 */
	_deleteFromAdapter(key) {
		try {
			this.get('adapter').removeItem(key);
		} catch (e) {
			// Sometimes we can't remove data to the localStorage, for example
			// in some browsers incognito mode.
			return false;
		}
	},

	/**
	 * Serialize value to store it in the adapter.
	 *
	 * @method serialize
	 * @param {Mixed} value
	 * @return String
	 * @private
	 */
	serialize(value) {
		if (typeOf(value) === 'object' || Array.isArray(value)) {
			try {
				value = JSON.stringify(value);
			} catch (e) {
				// Sometimes we can't stringify due to circular refs
				// in complex objects, so we won't bother storing then.
				return false;
			}
		}

		return value.toString();
	},

	/**
	 * Deserealize value from the adapter.
	 *
	 * @method deserialize
	 * @param {String} value
	 * @return Mixed
	 * @private
	 */
	deserialize(value) {
		try {
			value = JSON.parse(value);
			// Wrap array.
			if (Array.isArray(value)) {
				value = A(value);
			}
		} catch (error) { //eslint-disable-line
			// Value is not a jsonable object.
		}

		return value;
	},

	/**
	 * Notifies when a property has been changed through storage event.
	 *
	 * @method _handleStorageEvent
	 * @param {Object} event
	 * @private
	 */
	handleStorageEvent(event) {
		const adapter = this.get('adapter');

		if (!adapter || !event.key) {
			return;
		}

		if (adapter === event.storageArea) {
			this.notifyPropertyChange(this.deserializeKey(event.key));
		}
	}

});
