import Ember from 'ember';

const {
	assert,
	computed
} = Ember;

export const MEMORY = 'memory';
export const LOCAL = 'local';

/**
 * Returns an storage.
 *
 * @method storageFor
 * @return Ember.Computed
 * @param {String} type
 * @for Core.Utils
 */
export default function storageFor(type = LOCAL) {
	assert('A type must be provided', type);

	return computed(function() {
		const owner = Ember.getOwner(this);
		const storage = owner.lookup(`storage:${type}`);

		assert(`A storage was not found for type ${type}`, storage);

		return storage;
	});
}
