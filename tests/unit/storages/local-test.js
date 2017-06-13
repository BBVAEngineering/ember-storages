/* eslint-disable func-style, no-undefined */
import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';

let storage;
let content;

function getLocalStorageKeys() {
	const localStorageKeys = [];

	if (window.localStorage) {
		for (let i = 0; i < window.localStorage.length; i++) {
			const key = window.localStorage.key(i);

			localStorageKeys.push(key);
		}
	}

	return localStorageKeys;
}

function unserialize(key) {
	return JSON.parse(window.localStorage.getItem(key));
}

moduleFor('storage:local', 'Unit | Storage | local', {
	afterEach() {
		Ember.run(() => {
			storage.clear();
		});
		window.localStorage.clear();
	}
});

test('it returns content', function(assert) {
	Ember.run(() => {
		storage = this.subject();
	});
	content = storage.get('content');

	assert.ok(content);
});

test('it dumps localStorage to memory on init', function(assert) {
	window.localStorage.setItem('local:foo', 'foo');
	window.localStorage.setItem('local:bar', 'bar');
	window.localStorage.setItem('local:foz', 'foz');
	window.localStorage.setItem('user:wow', 'wow');

	Ember.run(() => {
		storage = this.subject();
	});

	assert.equal(storage.get('foo'), 'foo');
	assert.equal(storage.get('bar'), 'bar');
	assert.equal(storage.get('foz'), 'foz');
	assert.notOk(storage.get('wow'));
});

test('it gets item', function(assert) {
	Ember.run(() => {
		storage = this.subject();
	});

	Ember.run(() => {
		storage.set('foo', 'bar');
	});

	assert.equal(storage.get('foo'), 'bar');
	assert.equal(window.localStorage.getItem('local:foo'), 'bar');
});

test('it does not gets item from local when memory does not has it', function(assert) {
	Ember.run(() => {
		storage = this.subject();
	});

	assert.notOk(storage.get('foo'));

	window.localStorage.setItem('local:foo', 'bar');

	assert.notOk(storage.get('foo'));
});

test('it gets complex item', function(assert) {
	Ember.run(() => {
		storage = this.subject();
	});

	Ember.run(() => {
		storage.set('foo', { bar: { foz: 'wow' } });
	});

	assert.equal(storage.get('foo.bar.foz'), 'wow');
	assert.equal(unserialize('local:foo').bar.foz, 'wow');
});

test('it gets array item', function(assert) {
	Ember.run(() => {
		storage = this.subject();
	});

	Ember.run(() => {
		storage.set('foo', Ember.A(['wow', 'yo']));
	});

	assert.equal(storage.get('foo.0'), 'wow');
	assert.equal(unserialize('local:foo')[0], 'wow');
});

test('it updates item', function(assert) {
	Ember.run(() => {
		storage = this.subject();
	});

	Ember.run(() => {
		storage.set('foo', 'bar');
		storage.set('foo', 'wow');
	});

	assert.equal(storage.get('foo'), 'wow');
	assert.equal(window.localStorage.getItem('local:foo'), 'wow');
});

test('it updates complex item', function(assert) {
	Ember.run(() => {
		storage = this.subject();
	});

	Ember.run(() => {
		storage.set('foo', { bar: { foz: 'wow' } });
		storage.set('foo.bar.foz', 'yo');
	});

	assert.equal(storage.get('foo.bar.foz'), 'yo');
	assert.equal(unserialize('local:foo').bar.foz, 'yo');
});

test('it updates array item', function(assert) {
	Ember.run(() => {
		storage = this.subject();
	});

	Ember.run(() => {
		storage.set('foo', Ember.A());
		storage.get('foo').pushObject('wow');
		storage.get('foo').addObject('yo');
	});

	assert.deepEqual(storage.get('foo'), ['wow', 'yo']);
	assert.deepEqual(unserialize('local:foo'), ['wow', 'yo']);
});

test('it returns the correct value for the same Ember run loop', function(assert) {
	Ember.run(() => {
		storage = this.subject();
	});

	Ember.run(() => {
		storage.set('foo', 'bar');

		assert.equal(storage.get('foo'), 'bar');
		assert.notOk(window.localStorage.getItem('local:foo'));

		storage.set('foo');

		assert.notOk(storage.get('foo'));
		assert.notOk(window.localStorage.getItem('local:foo'));

		storage.set('foo', 'foz');

		assert.equal(storage.get('foo'), 'foz');
		assert.notOk(window.localStorage.getItem('local:foo'));
	});

	Ember.run(() => {
		assert.equal(window.localStorage.getItem('local:foo'), 'foz');
	});
});

test('it does not gets updated when item from content changes', function(assert) {
	Ember.run(() => {
		storage = this.subject();
	});
	content = storage.get('content');

	Ember.run(() => {
		storage.set('foo', 'bar');
	});

	Ember.run(() => {
		content.set('local:foo', 'wow');
	});

	assert.equal(storage.get('foo'), 'wow');
	assert.equal(window.localStorage.getItem('local:foo'), 'bar');
	assert.notEqual(window.localStorage.getItem('local:foo'), 'wow');
});

test('it does not gets updated when complex item from content changes', function(assert) {
	Ember.run(() => {
		storage = this.subject();
	});
	content = storage.get('content');

	Ember.run(() => {
		storage.set('foo', { bar: { foz: 'wow' } });
	});

	Ember.run(() => {
		content.set('local:foo.bar.foz', 'yo');
	});

	assert.equal(storage.get('foo.bar.foz'), 'yo');
	assert.equal(unserialize('local:foo').bar.foz, 'wow');
	assert.notEqual(unserialize('local:foo').bar.foz, 'yo');
});

test('it does not gets updated when array item from content changes', function(assert) {
	Ember.run(() => {
		storage = this.subject();
	});
	content = storage.get('content');

	Ember.run(() => {
		storage.set('foo', Ember.A([]));
	});

	Ember.run(() => {
		content.get('local:foo').addObject('wow');
		content.get('local:foo').pushObject('yo');
	});

	assert.deepEqual(storage.get('foo'), ['wow', 'yo']);
	assert.deepEqual(unserialize('local:foo'), []);
	assert.notEqual(unserialize('local:foo'), ['wow', 'yo']);
});

test('it deletes item', function(assert) {
	Ember.run(() => {
		storage = this.subject();
	});

	Ember.run(() => {
		storage.set('foo', 'foo');
		storage.set('bar', 'bar');
		storage.set('wow', 'wow');
	});

	assert.equal(storage.get('foo'), 'foo');
	assert.equal(storage.get('bar'), 'bar');
	assert.equal(storage.get('wow'), 'wow');

	Ember.run(() => {
		storage.set('foo', null);
		storage.set('bar', undefined);
		storage.set('wow');
	});

	assert.equal(window.localStorage.getItem('local:foo'), undefined);
	assert.equal(window.localStorage.getItem('local:bar'), undefined);
	assert.equal(window.localStorage.getItem('local:wow'), undefined);
});

test('it deletes item from localStorage when item is deleted', function(assert) {
	Ember.run(() => {
		window.localStorage.setItem('local:foo', 'foo');
		window.localStorage.setItem('local:bar', 'bar');
		window.localStorage.setItem('local:wow', 'wow');
	});

	Ember.run(() => {
		storage = this.subject();
	});

	Ember.run(() => {
		storage.set('foo', null);
		storage.set('bar', undefined);
		storage.set('wow');
	});

	assert.equal(storage.get('foo'), undefined);
	assert.equal(storage.get('bar'), undefined);
	assert.equal(storage.get('wow'), undefined);
	assert.equal(window.localStorage.getItem('local:foo'), undefined);
	assert.equal(window.localStorage.getItem('local:bar'), undefined);
	assert.equal(window.localStorage.getItem('local:wow'), undefined);
});

test('it notifies property change when content item changes', function(assert) {
	Ember.run(() => {
		storage = this.subject();
	});
	content = storage.get('content');

	const object = Ember.Object.extend({
		storage,
		foo: Ember.computed.alias('storage.foo')
	}).create();

	Ember.run(() => {
		storage.set('foo', 'bar');
	});

	assert.equal(object.get('foo'), 'bar');

	Ember.run(() => {
		content.set('local:foo', 'wow');
	});

	assert.equal(object.get('foo'), 'wow');

	Ember.run(object, 'destroy');
});

test('it does not notifies property change when localStorage item changes', function(assert) {
	Ember.run(() => {
		storage = this.subject();
	});

	const object = Ember.Object.extend({
		storage,
		foo: Ember.computed.alias('storage.foo')
	}).create();

	Ember.run(() => {
		storage.set('foo', 'bar');
	});

	assert.equal(object.get('foo'), 'bar');

	Ember.run(() => {
		window.localStorage.setItem('local:foo', 'wow');
	});

	assert.notEqual(object.get('foo'), 'wow');
	assert.equal(object.get('foo'), 'bar');

	Ember.run(object, 'destroy');
});

test('it notifies property change when content complex item changes', function(assert) {
	Ember.run(() => {
		storage = this.subject();
	});
	content = storage.get('content');

	const object = Ember.Object.extend({
		storage,
		foo: Ember.computed.alias('storage.foo.bar.foz')
	}).create();

	Ember.run(() => {
		storage.set('foo', { bar: { foz: 'wow' } });
	});

	assert.equal(object.get('foo'), 'wow');

	Ember.run(() => {
		content.set('local:foo.bar.foz', 'yo');
	});

	assert.equal(object.get('foo'), 'yo');

	Ember.run(object, 'destroy');
});

test('it notifies property change when content array item changes', function(assert) {
	Ember.run(() => {
		storage = this.subject();
	});
	content = storage.get('content');

	const object = Ember.Object.extend({
		storage,
		foo: Ember.computed.alias('storage.foo.0')
	}).create();

	Ember.run(() => {
		storage.set('foo', Ember.A());
	});

	assert.equal(object.get('foo'), undefined);

	Ember.run(() => {
		content.get('local:foo').addObject('wow');
	});

	assert.equal(object.get('foo'), 'wow');

	Ember.run(object, 'destroy');
});

test('it does not notifies property change when localStorage complex item changes', function(assert) {
	Ember.run(() => {
		storage = this.subject();
	});

	const object = Ember.Object.extend({
		storage,
		foo: Ember.computed.alias('storage.foo.bar.foz')
	}).create();

	Ember.run(() => {
		storage.set('foo', { bar: { foz: 'wow' } });
	});

	assert.equal(object.get('foo'), 'wow');

	Ember.run(() => {
		window.localStorage.setItem('local:foo', JSON.stringify({ bar: { foz: 'yo' } }));
	});

	assert.notEqual(object.get('foo'), 'yo');
	assert.equal(object.get('foo'), 'wow');

	Ember.run(object, 'destroy');
});

test('it does not notifies property change when localStorage array item changes', function(assert) {
	Ember.run(() => {
		storage = this.subject();
	});

	const object = Ember.Object.extend({
		storage,
		foo: Ember.computed.alias('storage.foo.0')
	}).create();

	Ember.run(() => {
		storage.set('foo', Ember.A(['wow']));
	});

	assert.equal(object.get('foo'), 'wow');

	Ember.run(() => {
		window.localStorage.setItem('local:foo', JSON.stringify(['yo']));
	});

	assert.notEqual(object.get('foo'), 'yo');
	assert.deepEqual(object.get('foo'), 'wow');

	Ember.run(object, 'destroy');
});

test('it notifies property change when content item is deleted', function(assert) {
	Ember.run(() => {
		storage = this.subject();
	});
	content = storage.get('content');

	const object = Ember.Object.extend({
		storage,
		foo: Ember.computed.alias('storage.foo')
	}).create();

	Ember.run(() => {
		storage.set('foo', 'bar');
	});

	assert.equal(object.get('foo'), 'bar');

	Ember.run(() => {
		content.set('local:foo', null);
	});

	assert.equal(object.get('foo'), undefined);

	Ember.run(object, 'destroy');
});

test('it does not notifies property change when localStorage item is deleted', function(assert) {
	Ember.run(() => {
		storage = this.subject();
	});

	const object = Ember.Object.extend({
		storage,
		foo: Ember.computed.alias('storage.foo')
	}).create();

	Ember.run(() => {
		storage.set('foo', 'bar');
	});

	assert.equal(object.get('foo'), 'bar');

	Ember.run(() => {
		window.localStorage.removeItem('local:foo');
	});

	assert.notEqual(object.get('foo'), undefined);
	assert.equal(object.get('foo'), 'bar');

	Ember.run(object, 'destroy');
});

test('it notifies property change when content complex item is deleted', function(assert) {
	Ember.run(() => {
		storage = this.subject();
	});
	content = storage.get('content');

	const object = Ember.Object.extend({
		storage,
		foo: Ember.computed.alias('storage.foo.bar.foz')
	}).create();

	Ember.run(() => {
		storage.set('foo', { bar: { foz: 'wow' } });
	});

	assert.equal(object.get('foo'), 'wow');

	Ember.run(() => {
		content.set('local:foo.bar.foz', null);
	});

	assert.equal(object.get('foo'), undefined);

	Ember.run(object, 'destroy');
});

test('it notifies property change when content array item is deleted', function(assert) {
	Ember.run(() => {
		storage = this.subject();
	});
	content = storage.get('content');

	const object = Ember.Object.extend({
		storage,
		foo: Ember.computed.alias('storage.foo.0')
	}).create();

	Ember.run(() => {
		storage.set('foo', Ember.A(['wow']));
	});

	assert.deepEqual(object.get('foo'), 'wow');

	Ember.run(() => {
		content.set('local:foo', null);
	});

	assert.equal(object.get('foo'), undefined);

	Ember.run(object, 'destroy');
});

test('it does not notifies property change when localStorage complex item is deleted', function(assert) {
	Ember.run(() => {
		storage = this.subject();
	});

	const object = Ember.Object.extend({
		storage,
		foo: Ember.computed.alias('storage.foo.bar.foz')
	}).create();

	Ember.run(() => {
		storage.set('foo', { bar: { foz: 'wow' } });
	});

	assert.equal(object.get('foo'), 'wow');

	Ember.run(() => {
		window.localStorage.setItem('local:foo', { bar: {} });
	});

	assert.notEqual(object.get('foo'), undefined);
	assert.equal(object.get('foo'), 'wow');

	Ember.run(object, 'destroy');
});

test('it does not notifies property change when localStorage array item is deleted', function(assert) {
	Ember.run(() => {
		storage = this.subject();
	});

	const object = Ember.Object.extend({
		storage,
		foo: Ember.computed.alias('storage.foo.0')
	}).create();

	Ember.run(() => {
		storage.set('foo', Ember.A(['wow']));
	});

	assert.equal(object.get('foo'), 'wow');

	Ember.run(() => {
		window.localStorage.setItem('local:foo', []);
	});

	assert.notEqual(object.get('foo'), undefined);
	assert.equal(object.get('foo'), 'wow');

	Ember.run(object, 'destroy');
});

test('it changes content item when computed property changes', function(assert) {
	Ember.run(() => {
		storage = this.subject();
	});

	const object = Ember.Object.extend({
		storage,
		foo: Ember.computed.alias('storage.foo')
	}).create();

	Ember.run(() => {
		storage.set('foo', 'bar');
	});

	assert.equal(storage.get('foo'), 'bar');
	assert.equal(window.localStorage.getItem('local:foo'), 'bar');

	Ember.run(() => {
		object.set('foo', 'wow');
	});

	assert.equal(storage.get('foo'), 'wow');
	assert.equal(window.localStorage.getItem('local:foo'), 'wow');

	Ember.run(object, 'destroy');
});

test('it does not changes content complex item when computed property changes', function(assert) {
	Ember.run(() => {
		storage = this.subject();
	});

	const object = Ember.Object.extend({
		storage,
		foo: Ember.computed.alias('storage.foo.bar.foz')
	}).create();

	Ember.run(() => {
		storage.set('foo', { bar: { foz: 'wow' } });
	});

	assert.equal(storage.get('foo.bar.foz'), 'wow');
	assert.equal(unserialize('local:foo').bar.foz, 'wow');

	Ember.run(() => {
		object.set('foo', 'yo');
	});

	assert.equal(storage.get('foo.bar.foz'), 'yo');
	// Can't update localStorage. A complex property change will no be notified.
	assert.notEqual(unserialize('local:foo').bar.foz, 'yo');

	Ember.run(object, 'destroy');
});

test('it does not changes content array item when computed property changes', function(assert) {
	Ember.run(() => {
		storage = this.subject();
	});

	const object = Ember.Object.extend({
		storage,
		foo: Ember.computed.alias('storage.foo')
	}).create();

	Ember.run(() => {
		storage.set('foo', Ember.A([]));
	});

	assert.equal(storage.get('foo.0'), undefined);
	assert.equal(unserialize('local:foo')[0], undefined);

	Ember.run(() => {
		object.get('foo').pushObject('wow');
	});

	assert.equal(storage.get('foo.0'), 'wow');
	// Can't update localStorage. A complex property change will no be notified.
	assert.notEqual(unserialize('local:foo')[0], 'wow');

	Ember.run(object, 'destroy');
});

test('it deletes content item when computed property is deleted', function(assert) {
	Ember.run(() => {
		storage = this.subject();
	});

	const object = Ember.Object.extend({
		storage,
		foo: Ember.computed.alias('storage.foo')
	}).create();

	Ember.run(() => {
		storage.set('foo', 'bar');
	});

	assert.equal(storage.get('foo'), 'bar');
	assert.equal(window.localStorage.getItem('local:foo'), 'bar');

	Ember.run(() => {
		object.set('foo', null);
	});

	assert.equal(storage.get('foo'), undefined);
	assert.equal(window.localStorage.getItem('local:foo'), undefined);

	Ember.run(object, 'destroy');
});

test('it deletes content complex item when computed property is deleted', function(assert) {
	Ember.run(() => {
		storage = this.subject();
	});

	const object = Ember.Object.extend({
		storage,
		foo: Ember.computed.alias('storage.foo.bar.foz')
	}).create();

	Ember.run(() => {
		storage.set('foo', { bar: { foz: 'wow' } });
	});

	assert.equal(storage.get('foo.bar.foz'), 'wow');
	assert.equal(unserialize('local:foo').bar.foz, 'wow');

	Ember.run(() => {
		object.set('foo', null);
	});

	assert.equal(storage.get('foo.bar.foz'), undefined);
	// Can't update localStorage. A complex property change will no be notified.
	assert.notEqual(unserialize('local:foo').bar.foz, undefined);

	Ember.run(object, 'destroy');
});

test('it deletes content complex item when computed property is deleted', function(assert) {
	Ember.run(() => {
		storage = this.subject();
	});

	const object = Ember.Object.extend({
		storage,
		foo: Ember.computed.alias('storage.foo')
	}).create();

	Ember.run(() => {
		storage.set('foo', Ember.A(['wow']));
	});

	assert.equal(storage.get('foo.0'), 'wow');
	assert.equal(unserialize('local:foo')[0], 'wow');

	Ember.run(() => {
		object.get('foo').removeObject('wow');
	});

	assert.equal(storage.get('foo.0'), undefined);
	// Can't update localStorage. A complex property change will no be notified.
	assert.equal(unserialize('local:foo')[0], 'wow');

	Ember.run(object, 'destroy');
});

test('it serializes objects when stores in the content', function(assert) {
	Ember.run(() => {
		storage = this.subject();
	});

	const object = {
		test: 'bar'
	};

	Ember.run(() => {
		storage.set('foo', object);
	});

	assert.equal(window.localStorage.getItem('local:foo'), JSON.stringify(object));
});

test('it ignores storing complex object to localStorage', function(assert) {
	Ember.run(() => {
		storage = this.subject();
	});

	const object = {};
	const object2 = {};

	object.object2 = object2;
	object2.object = object;

	Ember.run(() => {
		storage.set('foo', object);
	});

	const localStorageKeys = getLocalStorageKeys();

	assert.notOk(window.localStorage.getItem('foo'));
	assert.equal(localStorageKeys.length, 0);
});

test('it clears all items stored in localStorage when clears itself', function(assert) {
	window.localStorage.setItem('local:yo', 'me');

	Ember.run(() => {
		storage = this.subject();
	});

	Ember.run(() => {
		storage.set('foo', 'bar');
		storage.set('foz', 'baz');
		storage.set('bad', 'wor');
	});

	Ember.run(() => {
		storage.clear();
	});

	const localStorageKeys = getLocalStorageKeys();

	assert.equal(storage.keys().length, 0);
	assert.equal(localStorageKeys.length, 0);
});

test('it returns all keys from initialContent', function(assert) {
	window.localStorage.setItem('local:foo', 'bar');
	window.localStorage.setItem('local:foz', 'wow');

	Ember.run(() => {
		storage = this.subject();
	});

	assert.deepEqual(storage.keys(), ['foo', 'foz']);
});

test('it returns all keys from storage', function(assert) {
	Ember.run(() => {
		storage = this.subject();
	});

	Ember.run(() => {
		storage.set('foo', 'bar');
		storage.set('foz', 'wor');
	});

	const localStorageKeys = getLocalStorageKeys();

	assert.deepEqual(storage.keys(), ['foo', 'foz']);
	assert.deepEqual(localStorageKeys, ['local:foo', 'local:foz']);
});

test('it does nothing when has no localStorage', function(assert) {
	Ember.run(() => {
		storage = this.subject({
			content: null
		});
	});

	Ember.run(storage, 'set', 'foo', 'bar');
	Ember.run(storage, 'set', 'foo', null);

	assert.equal(storage.get('foo'), undefined);

	Ember.run(storage, 'keys');
	Ember.run(storage, 'clear');

	Ember.run(() => {
		storage.handleStorageEvent({
			key: 'foo',
			storageArea: {}
		});
	});
});
