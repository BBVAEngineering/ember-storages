import Ember from 'ember';
import { module, test } from 'qunit';
import LocalStorage from 'ember-storages/storages/local';
import MemoryStorage from 'ember-storages/storages/memory';
import storageFor, { LOCAL, MEMORY } from 'ember-storages/utils/storage-for';
import sinon from 'sinon';

let stub;

module('Unit | Util | storage-for', {
	beforeEach() {
		stub = sinon.stub(Ember, 'getOwner', () => ({
			lookup(type) { // eslint-disable-line consistent-return
				if (type.match(LOCAL)) {
					return LocalStorage.create();
				}
				if (type.match(MEMORY)) {
					return MemoryStorage.create();
				}
			}
		}));
	},
	afterEach() {
		stub.restore();
	}
});

test('it returns local storage as default', (assert) => {
	const object = Ember.Object.extend({
		storage: storageFor()
	}).create();

	assert.ok(LocalStorage.detectInstance(object.get('storage')));

	Ember.run(object, 'destroy');
});

test('it returns storage passed in arguments', (assert) => {
	const local = Ember.Object.extend({
		storage: storageFor(LOCAL)
	}).create();
	const memory = Ember.Object.extend({
		storage: storageFor(MEMORY)
	}).create();

	assert.ok(LocalStorage.detectInstance(local.get('storage')));
	assert.ok(MemoryStorage.detectInstance(memory.get('storage')));

	Ember.run(local, 'destroy');
	Ember.run(memory, 'destroy');
});

test('it returns a computed property', (assert) => {
	const storage = storageFor('foo');

	assert.ok(storage instanceof Ember.ComputedProperty);
});

test('it throws an error if storage was not found', (assert) => {
	const object = Ember.Object.extend({
		storage: storageFor('foo')
	}).create();

	assert.throws(() => {
		object.get('storage');
	});

	Ember.run(object, 'destroy');
});
