/* eslint-disable ember/no-new-mixins */
import { A } from '@ember/array';
import { isNone } from '@ember/utils';
import Mixin from '@ember/object/mixin';
import { on } from '@ember/object/evented';
import { set } from '@ember/object';

const SEPARATOR = ':';

/**
 * Mixin that implements the basic functionality to store data in a memory container.
 *
 * @extends Ember.Mixin
 */
export default Mixin.create({

	/**
	 * Initialize content.
	 *
	 * @method init
	 * @private
	 */
	init() {
		this._super(...arguments);

		set(this, 'content', this.get('initialContent'));
	},

	/**
	 * Check if a key is already serialized with the namespace.
	 *
	 * @method isKeySerialized
	 * @param {String} key
	 * @return Boolean
	 */
	isKeySerialized(key) {
		return key.split(SEPARATOR).length > 1;
	},

	/**
	 * Serialize a key (concats the namespace).
	 *
	 * @method serializeKey
	 * @param {String} key
	 * @return String
	 */
	serializeKey(key) {
		const namespace = this.get('namespace');

		return this.isKeySerialized(key) ? key : `${namespace}${SEPARATOR}${key}`;
	},

	/**
	 * Deserialize a key (splits the namespace) and returns an object with the key and the namespace.
	 *
	 * @method deserializeKey
	 * @param {String} serializedKey
	 * @return {Object}
	 */
	deserializeKey(serializedKey) {
		const parts = serializedKey.split(SEPARATOR);
		const namespace = parts.length === 1 ? '' : parts[0];
		const key = parts.length === 2 ? parts[1] : parts[0];

		return {
			namespace,
			key
		};
	},

	/**
	 * Getter of unknown properties.
	 *
	 * @method unknownProperty
	 * @param {String} key
	 * @return Mixed
	 */
	unknownProperty(key) {
		key = this.serializeKey(key);

		return this._super(key);
	},

	/**
	 * Setter of unknown properties.
	 *
	 * @method setUnknownProperty
	 * @param {String} key
	 * @param {Mixed} value
	 */
	setUnknownProperty(key, value) {
		key = this.serializeKey(key);

		this._super(key, value);

		// Delete from memory if not exists.
		if (isNone(value)) {
			this._delete(key);
		} else {
			this._save(key);
		}
	},

	/**
	 * Setter of properties.
	 *
	 * @method set
	 * @param {String} key
	 * @param {Mixed} value
	 */
	set() {
		return this.setUnknownProperty(...arguments);
	},

	/**
	 * Setter of properties.
	 *
	 * @method setProperties
	 * @param {Object} properties
	 */
	setProperties(obj) {
		this.beginPropertyChanges();

		Object.keys(obj).forEach((key) => {
			const value = obj[key];

			key = this.serializeKey(key);
			this.setUnknownProperty(key, value);
		});

		this.endPropertyChanges();
	},

	/**
	 * Clear all properties on adapter.
	 *
	 * @method clear
	 */
	clear() {
		const content = this.get('content');

		Object.keys(content).forEach((key) => {
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
		const content = this.get('content');
		const keys = Object.keys(content).map((key) => {
			const keyData = this.deserializeKey(key);

			return keyData.key;
		});

		return A(keys);
	},

	/**
	 * Listen storage event on init.
	 *
	 * @method _addStorageListener
	 * @private
	 */
	_addStorageListener: on('init', function() {
		this._super();

		this._storageEventHandler = this.handleStorageEvent.bind(this);

		window.addEventListener('storage', this._storageEventHandler);
	}),

	/**
	 * Unbind storage events.
	 *
	 * @method willDestroy
	 * @private
	 */
	willDestroy() {
		if (this._storageEventHandler) {
			window.removeEventListener('storage', this._storageEventHandler, false);
		}

		this._super(...arguments);
	},

	/**
	 * Notifies when a property has been changed through storage event.
	 *
	 * @method handleStorageEvent
	 * @param {Object} event
	 * @private
	 */
	handleStorageEvent() {
		return this;
	},

	/**
	 * Callback executed to store a property in content.
	 *
	 * @method _save
	 * @param {String} key
	 */
	_save() {
		return this;
	},

	/**
	 * Callback executed to delete a property from content.
	 *
	 * @method setUnknownProperty
	 * @param {String} key
	 * @param {Mixed} value
	 */
	_delete(key) {
		delete this.content[key];
	}

});
