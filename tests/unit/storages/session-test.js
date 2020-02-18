/* eslint-disable func-style, no-undefined */
import { alias } from '@ember/object/computed';

import EmberObject from '@ember/object';
import { A } from '@ember/array';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

let storage;
let content;

function getSessionStorageKeys() {
	const sessionStorageKeys = [];

	if (window.sessionStorage) {
		for (let i = 0; i < window.sessionStorage.length; i++) {
			const key = window.sessionStorage.key(i);

			sessionStorageKeys.push(key);
		}
	}

	return sessionStorageKeys;
}

function unserialize(key) {
	return JSON.parse(window.sessionStorage.getItem(key));
}

module('Unit | Storage | session', (hooks) => {
	setupTest(hooks);

	hooks.afterEach(() => {
		run(() => {
			storage.clear();
		});
		window.sessionStorage.clear();
	});

	test('it returns content', function(assert) {
		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		content = storage.get('content');

		assert.ok(content);
	});

	test('it dumps sessionStorage to memory on init', function(assert) {
		window.sessionStorage.setItem('session:foo', 'foo');
		window.sessionStorage.setItem('session:bar', 'bar');
		window.sessionStorage.setItem('session:foz', 'foz');
		window.sessionStorage.setItem('user:wow', 'wow');

		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		assert.equal(storage.get('foo'), 'foo');
		assert.equal(storage.get('bar'), 'bar');
		assert.equal(storage.get('foz'), 'foz');
		assert.notOk(storage.get('wow'));
	});

	test('it gets item', function(assert) {
		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		run(() => {
			storage.set('foo', 'bar');
		});

		assert.equal(storage.get('foo'), 'bar');
		assert.equal(window.sessionStorage.getItem('session:foo'), 'bar');
	});

	test('it does not gets item from session when memory does not has it', function(assert) {
		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		assert.notOk(storage.get('foo'));

		window.sessionStorage.setItem('session:foo', 'bar');

		assert.notOk(storage.get('foo'));
	});

	test('it gets complex item', function(assert) {
		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		run(() => {
			storage.set('foo', { bar: { foz: 'wow' } });
		});

		assert.equal(storage.get('foo.bar.foz'), 'wow');
		assert.equal(unserialize('session:foo').bar.foz, 'wow');
	});

	test('it gets array item', function(assert) {
		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		run(() => {
			storage.set('foo', A(['wow', 'yo']));
		});

		assert.equal(storage.get('foo.0'), 'wow');
		assert.equal(unserialize('session:foo')[0], 'wow');
	});

	test('it updates item', function(assert) {
		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		run(() => {
			storage.set('foo', 'bar');
			storage.set('foo', 'wow');
		});

		assert.equal(storage.get('foo'), 'wow');
		assert.equal(window.sessionStorage.getItem('session:foo'), 'wow');
	});

	test('it updates complex item', function(assert) {
		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		run(() => {
			storage.set('foo', { bar: { foz: 'wow' } });
			storage.set('foo.bar.foz', 'yo');
		});

		assert.equal(storage.get('foo.bar.foz'), 'yo');
		assert.equal(unserialize('session:foo').bar.foz, 'yo');
	});

	test('it updates array item', function(assert) {
		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		run(() => {
			storage.set('foo', A());
			storage.get('foo').pushObject('wow');
			storage.get('foo').addObject('yo');
		});

		assert.deepEqual(storage.get('foo'), ['wow', 'yo']);
		assert.deepEqual(unserialize('session:foo'), ['wow', 'yo']);
	});

	test('it returns the correct value for the same Ember run loop', function(assert) {
		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		run(() => {
			storage.set('foo', 'bar');

			assert.equal(storage.get('foo'), 'bar');
			assert.notOk(window.sessionStorage.getItem('session:foo'));

			storage.set('foo');

			assert.notOk(storage.get('foo'));
			assert.notOk(window.sessionStorage.getItem('session:foo'));

			storage.set('foo', 'foz');

			assert.equal(storage.get('foo'), 'foz');
			assert.notOk(window.sessionStorage.getItem('session:foo'));
		});

		run(() => {
			assert.equal(window.sessionStorage.getItem('session:foo'), 'foz');
		});
	});

	test('it does not gets updated when item from content changes', function(assert) {
		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		content = storage.get('content');

		run(() => {
			storage.set('foo', 'bar');
		});

		run(() => {
			content.set('session:foo', 'wow');
		});

		assert.equal(storage.get('foo'), 'wow');
		assert.equal(window.sessionStorage.getItem('session:foo'), 'bar');
		assert.notEqual(window.sessionStorage.getItem('session:foo'), 'wow');
	});

	test('it does not gets updated when complex item from content changes', function(assert) {
		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		content = storage.get('content');

		run(() => {
			storage.set('foo', { bar: { foz: 'wow' } });
		});

		run(() => {
			content.set('session:foo.bar.foz', 'yo');
		});

		assert.equal(storage.get('foo.bar.foz'), 'yo');
		assert.equal(unserialize('session:foo').bar.foz, 'wow');
		assert.notEqual(unserialize('session:foo').bar.foz, 'yo');
	});

	test('it does not gets updated when array item from content changes', function(assert) {
		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		content = storage.get('content');

		run(() => {
			storage.set('foo', A([]));
		});

		run(() => {
			content.get('session:foo').addObject('wow');
			content.get('session:foo').pushObject('yo');
		});

		assert.deepEqual(storage.get('foo'), ['wow', 'yo']);
		assert.deepEqual(unserialize('session:foo'), []);
		assert.notEqual(unserialize('session:foo'), ['wow', 'yo']);
	});

	test('it deletes item', function(assert) {
		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		run(() => {
			storage.set('foo', 'foo');
			storage.set('bar', 'bar');
			storage.set('wow', 'wow');
		});

		assert.equal(storage.get('foo'), 'foo');
		assert.equal(storage.get('bar'), 'bar');
		assert.equal(storage.get('wow'), 'wow');

		run(() => {
			storage.set('foo', null);
			storage.set('bar', undefined);
			storage.set('wow');
		});

		assert.equal(window.sessionStorage.getItem('session:foo'), undefined);
		assert.equal(window.sessionStorage.getItem('session:bar'), undefined);
		assert.equal(window.sessionStorage.getItem('session:wow'), undefined);
	});

	test('it deletes item from sessionStorage when item is deleted', function(assert) {
		run(() => {
			window.sessionStorage.setItem('session:foo', 'foo');
			window.sessionStorage.setItem('session:bar', 'bar');
			window.sessionStorage.setItem('session:wow', 'wow');
		});

		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		run(() => {
			storage.set('foo', null);
			storage.set('bar', undefined);
			storage.set('wow');
		});

		assert.equal(storage.get('foo'), undefined);
		assert.equal(storage.get('bar'), undefined);
		assert.equal(storage.get('wow'), undefined);
		assert.equal(window.sessionStorage.getItem('session:foo'), undefined);
		assert.equal(window.sessionStorage.getItem('session:bar'), undefined);
		assert.equal(window.sessionStorage.getItem('session:wow'), undefined);
	});

	test('it notifies property change when content item changes', function(assert) {
		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		content = storage.get('content');

		const object = EmberObject.extend({
			storage,
			foo: alias('storage.foo')
		}).create();

		run(() => {
			storage.set('foo', 'bar');
		});

		assert.equal(object.get('foo'), 'bar');

		run(() => {
			content.set('session:foo', 'wow');
		});

		assert.equal(object.get('foo'), 'wow');

		run(object, 'destroy');
	});

	test('it does not notifies property change when sessionStorage item changes', function(assert) {
		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		const object = EmberObject.extend({
			storage,
			foo: alias('storage.foo')
		}).create();

		run(() => {
			storage.set('foo', 'bar');
		});

		assert.equal(object.get('foo'), 'bar');

		run(() => {
			window.sessionStorage.setItem('session:foo', 'wow');
		});

		assert.notEqual(object.get('foo'), 'wow');
		assert.equal(object.get('foo'), 'bar');

		run(object, 'destroy');
	});

	test('it notifies property change when content complex item changes', function(assert) {
		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		content = storage.get('content');

		const object = EmberObject.extend({
			storage,
			foo: alias('storage.foo.bar.foz')
		}).create();

		run(() => {
			storage.set('foo', { bar: { foz: 'wow' } });
		});

		assert.equal(object.get('foo'), 'wow');

		run(() => {
			content.set('session:foo.bar.foz', 'yo');
		});

		assert.equal(object.get('foo'), 'yo');

		run(object, 'destroy');
	});

	test('it notifies property change when content array item changes', function(assert) {
		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		content = storage.get('content');

		const object = EmberObject.extend({
			storage,
			foo: alias('storage.foo.0')
		}).create();

		run(() => {
			storage.set('foo', A());
		});

		assert.equal(object.get('foo'), undefined);

		run(() => {
			content.get('session:foo').addObject('wow');
		});

		assert.equal(object.get('foo'), 'wow');

		run(object, 'destroy');
	});

	test('it does not notifies property change when sessionStorage complex item changes', function(assert) {
		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		const object = EmberObject.extend({
			storage,
			foo: alias('storage.foo.bar.foz')
		}).create();

		run(() => {
			storage.set('foo', { bar: { foz: 'wow' } });
		});

		assert.equal(object.get('foo'), 'wow');

		run(() => {
			window.sessionStorage.setItem('session:foo', JSON.stringify({ bar: { foz: 'yo' } }));
		});

		assert.notEqual(object.get('foo'), 'yo');
		assert.equal(object.get('foo'), 'wow');

		run(object, 'destroy');
	});

	test('it does not notifies property change when sessionStorage array item changes', function(assert) {
		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		const object = EmberObject.extend({
			storage,
			foo: alias('storage.foo.0')
		}).create();

		run(() => {
			storage.set('foo', A(['wow']));
		});

		assert.equal(object.get('foo'), 'wow');

		run(() => {
			window.sessionStorage.setItem('session:foo', JSON.stringify(['yo']));
		});

		assert.notEqual(object.get('foo'), 'yo');
		assert.deepEqual(object.get('foo'), 'wow');

		run(object, 'destroy');
	});

	test('it notifies property change when content item is deleted', function(assert) {
		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		content = storage.get('content');

		const object = EmberObject.extend({
			storage,
			foo: alias('storage.foo')
		}).create();

		run(() => {
			storage.set('foo', 'bar');
		});

		assert.equal(object.get('foo'), 'bar');

		run(() => {
			content.set('session:foo', null);
		});

		assert.equal(object.get('foo'), undefined);

		run(object, 'destroy');
	});

	test('it does not notifies property change when sessionStorage item is deleted', function(assert) {
		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		const object = EmberObject.extend({
			storage,
			foo: alias('storage.foo')
		}).create();

		run(() => {
			storage.set('foo', 'bar');
		});

		assert.equal(object.get('foo'), 'bar');

		run(() => {
			window.sessionStorage.removeItem('session:foo');
		});

		assert.notEqual(object.get('foo'), undefined);
		assert.equal(object.get('foo'), 'bar');

		run(object, 'destroy');
	});

	test('it notifies property change when content complex item is deleted', function(assert) {
		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		content = storage.get('content');

		const object = EmberObject.extend({
			storage,
			foo: alias('storage.foo.bar.foz')
		}).create();

		run(() => {
			storage.set('foo', { bar: { foz: 'wow' } });
		});

		assert.equal(object.get('foo'), 'wow');

		run(() => {
			content.set('session:foo.bar.foz', null);
		});

		assert.equal(object.get('foo'), undefined);

		run(object, 'destroy');
	});

	test('it notifies property change when content array item is deleted', function(assert) {
		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		content = storage.get('content');

		const object = EmberObject.extend({
			storage,
			foo: alias('storage.foo.0')
		}).create();

		run(() => {
			storage.set('foo', A(['wow']));
		});

		assert.deepEqual(object.get('foo'), 'wow');

		run(() => {
			content.set('session:foo', null);
		});

		assert.equal(object.get('foo'), undefined);

		run(object, 'destroy');
	});

	test('it does not notifies property change when sessionStorage complex item is deleted', function(assert) {
		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		const object = EmberObject.extend({
			storage,
			foo: alias('storage.foo.bar.foz')
		}).create();

		run(() => {
			storage.set('foo', { bar: { foz: 'wow' } });
		});

		assert.equal(object.get('foo'), 'wow');

		run(() => {
			window.sessionStorage.setItem('session:foo', { bar: {} });
		});

		assert.notEqual(object.get('foo'), undefined);
		assert.equal(object.get('foo'), 'wow');

		run(object, 'destroy');
	});

	test('it does not notifies property change when sessionStorage array item is deleted', function(assert) {
		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		const object = EmberObject.extend({
			storage,
			foo: alias('storage.foo.0')
		}).create();

		run(() => {
			storage.set('foo', A(['wow']));
		});

		assert.equal(object.get('foo'), 'wow');

		run(() => {
			window.sessionStorage.setItem('session:foo', []);
		});

		assert.notEqual(object.get('foo'), undefined);
		assert.equal(object.get('foo'), 'wow');

		run(object, 'destroy');
	});

	test('it changes content item when computed property changes', function(assert) {
		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		const object = EmberObject.extend({
			storage,
			foo: alias('storage.foo')
		}).create();

		run(() => {
			storage.set('foo', 'bar');
		});

		assert.equal(storage.get('foo'), 'bar');
		assert.equal(window.sessionStorage.getItem('session:foo'), 'bar');

		run(() => {
			object.set('foo', 'wow');
		});

		assert.equal(storage.get('foo'), 'wow');
		assert.equal(window.sessionStorage.getItem('session:foo'), 'wow');

		run(object, 'destroy');
	});

	test('it does not changes content complex item when computed property changes', function(assert) {
		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		const object = EmberObject.extend({
			storage,
			foo: alias('storage.foo.bar.foz')
		}).create();

		run(() => {
			storage.set('foo', { bar: { foz: 'wow' } });
		});

		assert.equal(storage.get('foo.bar.foz'), 'wow');
		assert.equal(unserialize('session:foo').bar.foz, 'wow');

		run(() => {
			object.set('foo', 'yo');
		});

		assert.equal(storage.get('foo.bar.foz'), 'yo');
		// Can't update sessionStorage. A complex property change will no be notified.
		assert.notEqual(unserialize('session:foo').bar.foz, 'yo');

		run(object, 'destroy');
	});

	test('it does not changes content array item when computed property changes', function(assert) {
		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		const object = EmberObject.extend({
			storage,
			foo: alias('storage.foo')
		}).create();

		run(() => {
			storage.set('foo', A([]));
		});

		assert.equal(storage.get('foo.0'), undefined);
		assert.equal(unserialize('session:foo')[0], undefined);

		run(() => {
			object.get('foo').pushObject('wow');
		});

		assert.equal(storage.get('foo.0'), 'wow');
		// Can't update sessionStorage. A complex property change will no be notified.
		assert.notEqual(unserialize('session:foo')[0], 'wow');

		run(object, 'destroy');
	});

	test('it deletes content item when computed property is deleted', function(assert) {
		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		const object = EmberObject.extend({
			storage,
			foo: alias('storage.foo')
		}).create();

		run(() => {
			storage.set('foo', 'bar');
		});

		assert.equal(storage.get('foo'), 'bar');
		assert.equal(window.sessionStorage.getItem('session:foo'), 'bar');

		run(() => {
			object.set('foo', null);
		});

		assert.equal(storage.get('foo'), undefined);
		assert.equal(window.sessionStorage.getItem('session:foo'), undefined);

		run(object, 'destroy');
	});

	test('it deletes content complex item when computed property is deleted', function(assert) {
		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		const object = EmberObject.extend({
			storage,
			foo: alias('storage.foo.bar.foz')
		}).create();

		run(() => {
			storage.set('foo', { bar: { foz: 'wow' } });
		});

		assert.equal(storage.get('foo.bar.foz'), 'wow');
		assert.equal(unserialize('session:foo').bar.foz, 'wow');

		run(() => {
			object.set('foo', null);
		});

		assert.equal(storage.get('foo.bar.foz'), undefined);
		// Can't update sessionStorage. A complex property change will no be notified.
		assert.notEqual(unserialize('session:foo').bar.foz, undefined);

		run(object, 'destroy');
	});

	test('it deletes content complex item when computed property is deleted', function(assert) {
		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		const object = EmberObject.extend({
			storage,
			foo: alias('storage.foo')
		}).create();

		run(() => {
			storage.set('foo', A(['wow']));
		});

		assert.equal(storage.get('foo.0'), 'wow');
		assert.equal(unserialize('session:foo')[0], 'wow');

		run(() => {
			object.get('foo').removeObject('wow');
		});

		assert.equal(storage.get('foo.0'), undefined);
		// Can't update sessionStorage. A complex property change will no be notified.
		assert.equal(unserialize('session:foo')[0], 'wow');

		run(object, 'destroy');
	});

	test('it serializes objects when stores in the content', function(assert) {
		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		const object = {
			test: 'bar'
		};

		run(() => {
			storage.set('foo', object);
		});

		assert.equal(window.sessionStorage.getItem('session:foo'), JSON.stringify(object));
	});

	test('it ignores storing complex object to sessionStorage', function(assert) {
		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		const object = {};
		const object2 = {};

		object.object2 = object2;
		object2.object = object;

		run(() => {
			storage.set('foo', object);
		});

		const sessionStorageKeys = getSessionStorageKeys();

		assert.notOk(window.sessionStorage.getItem('foo'));
		assert.equal(sessionStorageKeys.length, 0);
	});

	test('it clears all items stored in sessionStorage when clears itself', function(assert) {
		window.sessionStorage.setItem('session:yo', 'me');

		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		run(() => {
			storage.set('foo', 'bar');
			storage.set('foz', 'baz');
			storage.set('bad', 'wor');
		});

		run(() => {
			storage.clear();
		});

		const sessionStorageKeys = getSessionStorageKeys();

		assert.equal(storage.keys().length, 0);
		assert.equal(sessionStorageKeys.length, 0);
	});

	test('it returns all keys from initialContent', function(assert) {
		window.sessionStorage.setItem('session:foo', 'bar');
		window.sessionStorage.setItem('session:foz', 'wow');

		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		assert.equal(storage.keys()[0], 'foz');
		assert.equal(storage.keys()[1], 'foo');
	});

	test('it returns all keys from storage', function(assert) {
		run(() => {
			storage = this.owner.lookup('storage:session');
		});

		run(() => {
			storage.set('foo', 'bar');
			storage.set('foz', 'wor');
		});

		const sessionStorageKeys = getSessionStorageKeys();

		assert.deepEqual(storage.keys(), ['foo', 'foz']);
		assert.ok(sessionStorageKeys.includes('session:foz'));
		assert.ok(sessionStorageKeys.includes('session:foo'));
	});

	test('it does nothing when has no sessionStorage', function(assert) {
		run(() => {
			storage = this.owner.factoryFor('storage:session').create({
				content: null
			});
		});

		run(storage, 'set', 'foo', 'bar');
		run(storage, 'set', 'foo', null);

		assert.equal(storage.get('foo'), undefined);

		run(storage, 'keys');
		run(storage, 'clear');

		run(() => {
			storage.handleStorageEvent({
				key: 'foo',
				storageArea: {}
			});
		});
	});
});
