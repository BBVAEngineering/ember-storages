/* eslint-disable func-style, no-undefined */
import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';

let storage;
let content;

moduleFor('storage:memory', 'Unit | Storage | memory', {
	beforeEach() {
		storage = this.subject();
		content = storage.get('content');
	},
	afterEach() {
		Ember.run(() => {
			storage.clear();
		});
	}
});

test('it returns content', (assert) => {
	assert.ok(content);
});

test('it gets item', (assert) => {
	Ember.run(() => {
		storage.set('foo', 'bar');
	});

	assert.equal(storage.get('foo'), 'bar');
	assert.equal(content.get('memory:foo'), 'bar');
});

test('it gets complex item', (assert) => {
	Ember.run(() => {
		storage.set('foo', { bar: { foz: 'wow' } });
	});

	assert.equal(storage.get('foo.bar.foz'), 'wow');
	assert.equal(content.get('memory:foo.bar.foz'), 'wow');
});

test('it gets array item', (assert) => {
	Ember.run(() => {
		storage.set('foo', Ember.A(['wow']));
	});

	assert.equal(storage.get('foo.0'), 'wow');
	assert.equal(content.get('memory:foo.0'), 'wow');
});

test('it updates item', (assert) => {
	Ember.run(() => {
		storage.set('foo', 'bar');
		storage.set('foo', 'wow');
	});

	assert.equal(storage.get('foo'), 'wow');
	assert.equal(content.get('memory:foo'), 'wow');
});

test('it updates complex item', (assert) => {
	Ember.run(() => {
		storage.set('foo', { bar: { foz: 'wow' } });
		storage.set('foo.bar.foz', 'yo');
	});

	assert.equal(storage.get('foo.bar.foz'), 'yo');
	assert.equal(content.get('memory:foo.bar.foz'), 'yo');
});

test('it updates array item', (assert) => {
	Ember.run(() => {
		storage.set('foo', Ember.A(['wow']));
		storage.set('foo.0', 'yo');
	});

	assert.equal(storage.get('foo.0'), 'yo');
	assert.equal(content.get('memory:foo.0'), 'yo');
});

test('it gets updated when item from content changes', (assert) => {
	Ember.run(() => {
		storage.set('foo', 'bar');
	});

	Ember.run(() => {
		content.set('memory:foo', 'wow');
	});

	assert.equal(storage.get('foo'), 'wow');
	assert.equal(content.get('memory:foo'), 'wow');
});

test('it gets updated complex item when content changes', (assert) => {
	Ember.run(() => {
		storage.set('foo', { bar: { foz: 'wow' } });
	});

	Ember.run(() => {
		content.set('memory:foo.bar.foz', 'yo');
	});

	assert.equal(storage.get('foo.bar.foz'), 'yo');
	assert.equal(content.get('memory:foo.bar.foz'), 'yo');
});

test('it gets updated array item when content changes', (assert) => {
	Ember.run(() => {
		storage.set('foo', Ember.A(['wow']));
	});

	Ember.run(() => {
		content.set('memory:foo.0', 'yo');
	});

	assert.equal(storage.get('foo.0'), 'yo');
	assert.equal(content.get('memory:foo.0'), 'yo');
});

test('it deletes item', (assert) => {
	Ember.run(() => {
		storage.set('foo', 'foo');
		storage.set('bar', 'bar');
		storage.set('wow', 'wow');
	});

	Ember.run(() => {
		storage.set('foo', null);
		storage.set('bar', undefined);
		storage.set('wow');
	});

	assert.equal(content.get('memory:foo'), undefined);
	assert.equal(content.get('memory:bar'), undefined);
	assert.equal(content.get('memory:wow'), undefined);
});

test('it deletes item from content when item is deleted', (assert) => {
	Ember.run(() => {
		content.set('memory:foo', 'foo');
		content.set('memory:bar', 'bar');
		content.set('memory:wow', 'wow');
	});

	Ember.run(() => {
		storage.set('foo', null);
		storage.set('bar', undefined);
		storage.set('wow');
	});

	assert.equal(storage.get('foo'), undefined);
	assert.equal(storage.get('bar'), undefined);
	assert.equal(storage.get('wow'), undefined);
	assert.equal(content.get('memory:foo'), undefined);
	assert.equal(content.get('memory:bar'), undefined);
	assert.equal(content.get('memory:wow'), undefined);
});

test('it notifies property change when content item changes', (assert) => {
	const object = Ember.Object.extend({
		storage,
		foo: Ember.computed.alias('storage.foo')
	}).create();

	Ember.run(() => {
		storage.set('foo', 'bar');
	});

	assert.equal(object.get('foo'), 'bar');

	Ember.run(() => {
		content.set('memory:foo', 'wow');
	});

	assert.equal(object.get('foo'), 'wow');

	Ember.run(object, 'destroy');
});

test('it notifies property change when content complex item changes', (assert) => {
	const object = Ember.Object.extend({
		storage,
		foo: Ember.computed.alias('storage.foo.bar.foz')
	}).create();

	Ember.run(() => {
		storage.set('foo', { bar: { foz: 'wow' } });
	});

	assert.equal(object.get('foo'), 'wow');

	Ember.run(() => {
		content.set('memory:foo.bar.foz', 'yo');
	});

	assert.equal(object.get('foo'), 'yo');

	Ember.run(object, 'destroy');
});

test('it notifies property change when content array item changes', (assert) => {
	const object = Ember.Object.extend({
		storage,
		foo: Ember.computed.alias('storage.foo.0')
	}).create();

	Ember.run(() => {
		storage.set('foo', Ember.A(['wow']));
	});

	assert.equal(object.get('foo'), 'wow');

	Ember.run(() => {
		content.set('memory:foo.0', 'yo');
	});

	assert.equal(object.get('foo'), 'yo');

	Ember.run(object, 'destroy');
});

test('it notifies property change when content item is deleted', (assert) => {
	const object = Ember.Object.extend({
		storage,
		foo: Ember.computed.alias('storage.foo')
	}).create();

	Ember.run(() => {
		storage.set('foo', 'bar');
	});

	assert.equal(object.get('foo'), 'bar');

	Ember.run(() => {
		content.set('memory:foo', null);
	});

	assert.equal(object.get('foo'), undefined);

	Ember.run(object, 'destroy');
});

test('it notifies property change when content complex item is deleted', (assert) => {
	const object = Ember.Object.extend({
		storage,
		foo: Ember.computed.alias('storage.foo.bar.foz')
	}).create();

	Ember.run(() => {
		storage.set('foo', { bar: { foz: 'wow' } });
	});

	assert.equal(object.get('foo'), 'wow');

	Ember.run(() => {
		content.set('memory:foo.bar.foz', null);
	});

	assert.equal(object.get('foo'), undefined);

	Ember.run(object, 'destroy');
});

test('it notifies property change when content array item is deleted', (assert) => {
	const object = Ember.Object.extend({
		storage,
		foo: Ember.computed.alias('storage.foo.0')
	}).create();

	Ember.run(() => {
		storage.set('foo', Ember.A(['wow']));
	});

	assert.equal(object.get('foo'), 'wow');

	Ember.run(() => {
		content.set('memory:foo.0', null);
	});

	assert.equal(object.get('foo'), undefined);

	Ember.run(object, 'destroy');
});

test('it changes content item when computed property changes', (assert) => {
	const object = Ember.Object.extend({
		storage,
		foo: Ember.computed.alias('storage.foo')
	}).create();

	Ember.run(() => {
		storage.set('foo', 'bar');
	});

	assert.equal(storage.get('foo'), 'bar');
	assert.equal(content.get('memory:foo'), 'bar');

	Ember.run(() => {
		object.set('foo', 'wow');
	});

	assert.equal(storage.get('foo'), 'wow');
	assert.equal(content.get('memory:foo'), 'wow');

	Ember.run(object, 'destroy');
});

test('it changes content complex item when computed property changes', (assert) => {
	const object = Ember.Object.extend({
		storage,
		foo: Ember.computed.alias('storage.foo.bar.foz')
	}).create();

	Ember.run(() => {
		storage.set('foo', { bar: { foz: 'wow' } });
	});

	assert.equal(storage.get('foo.bar.foz'), 'wow');
	assert.equal(content.get('memory:foo.bar.foz'), 'wow');

	Ember.run(() => {
		object.set('foo', 'yo');
	});

	assert.equal(storage.get('foo.bar.foz'), 'yo');
	assert.equal(content.get('memory:foo.bar.foz'), 'yo');

	Ember.run(object, 'destroy');
});

test('it changes content array item when computed property changes', (assert) => {
	const object = Ember.Object.extend({
		storage,
		foo: Ember.computed.alias('storage.foo.0')
	}).create();

	Ember.run(() => {
		storage.set('foo', Ember.A(['wow']));
	});

	assert.equal(storage.get('foo.0'), 'wow');
	assert.equal(content.get('memory:foo.0'), 'wow');

	Ember.run(() => {
		object.set('foo', 'yo');
	});

	assert.equal(storage.get('foo.0'), 'yo');
	assert.equal(content.get('memory:foo.0'), 'yo');

	Ember.run(object, 'destroy');
});

test('it deletes content item when computed property is deleted', (assert) => {
	const object = Ember.Object.extend({
		storage,
		foo: Ember.computed.alias('storage.foo')
	}).create();

	Ember.run(() => {
		storage.set('foo', 'bar');
	});

	assert.equal(storage.get('foo'), 'bar');
	assert.equal(content.get('memory:foo'), 'bar');

	Ember.run(() => {
		object.set('foo', null);
	});

	assert.equal(storage.get('foo'), undefined);
	assert.equal(content.get('memory:foo'), undefined);

	Ember.run(object, 'destroy');
});

test('it deletes content complex item when computed property is deleted', (assert) => {
	const object = Ember.Object.extend({
		storage,
		foo: Ember.computed.alias('storage.foo.bar.foz')
	}).create();

	Ember.run(() => {
		storage.set('foo', { bar: { foz: 'wow' } });
	});

	assert.equal(storage.get('foo.bar.foz'), 'wow');
	assert.equal(content.get('memory:foo.bar.foz'), 'wow');

	Ember.run(() => {
		object.set('foo', null);
	});

	assert.equal(storage.get('foo.bar.foz'), undefined);
	assert.equal(content.get('memory:foo.bar.foz'), undefined);

	Ember.run(object, 'destroy');
});

test('it deletes content array item when computed property is deleted', (assert) => {
	const object = Ember.Object.extend({
		storage,
		foo: Ember.computed.alias('storage.foo.0')
	}).create();

	Ember.run(() => {
		storage.set('foo', Ember.A(['wow']));
	});

	assert.equal(storage.get('foo.0'), 'wow');
	assert.equal(content.get('memory:foo.0'), 'wow');

	Ember.run(() => {
		object.set('foo', null);
	});

	assert.equal(storage.get('foo.0'), undefined);
	assert.equal(content.get('memory:foo.0'), undefined);

	Ember.run(object, 'destroy');
});

test('it does not serializes objects when stores in the content', (assert) => {
	const object = {
		test: 'bar'
	};

	Ember.run(() => {
		storage.set('foo', object);
	});

	assert.equal(content.get('memory:foo'), object);
});

test('it ignores storing complex object to content', (assert) => {
	const object = {};
	const object2 = {};

	object.object2 = object2;
	object2.object = object;

	Ember.run(() => {
		storage.set('foo', object);
	});

	assert.notOk(content.get('foo'));
});

test('it clears all items stored in content when clears itself', (assert) => {
	Ember.run(() => {
		storage.set('foo', 'bar');
		storage.set('foz', 'baz');
		storage.set('bad', 'wor');
	});

	Ember.run(() => {
		storage.clear();
	});

	assert.equal(storage.keys().length, 0);
	assert.equal(Object.keys(content).length, 0);
});

test('it returns all keys from storage', (assert) => {
	Ember.run(() => {
		storage.set('foo', 'bar');
		storage.set('foz', 'wor');
	});

	assert.deepEqual(storage.keys(), ['foo', 'foz']);
	assert.deepEqual(Object.keys(content), ['memory:foo', 'memory:foz']);
});

/* test('it does nothing when has no content', function(assert) {
	storage = this.subject({
		content: null
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
}); */
