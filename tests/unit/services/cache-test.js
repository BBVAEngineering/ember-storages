/* eslint-disable func-style, no-implicit-coercion */
import Ember from 'ember';
import moment from 'moment';
import { moduleFor, test } from 'ember-qunit';
import { wrap } from 'ember-storages/services/cache';

let service;

moduleFor('service:cache', 'Unit | Service | cache', {
	needs: ['storage:cache'],

	afterEach() {
		// Clear local storage
		window.localStorage.clear();
	}
});

const deserialize = (key) => JSON.parse(window.localStorage.getItem(key));

test('it clears expired properties at init', function(assert) {
	const meta = { expire: +moment('2000-01-01') };

	window.localStorage.setItem('cache:foo', JSON.stringify(wrap('bar', meta)));

	Ember.run(() => {
		service = this.container.lookup('service:cache');
	});

	assert.notOk(deserialize('cache:foo'));
});

test('it writes property to storage when it does not has it', function(assert) {
	service = this.container.lookup('service:cache');

	Ember.run(() => {
		service.set('foo', 'bar');
	});

	assert.equal(service.get('foo'), 'bar');
	assert.equal(deserialize('cache:foo').data, 'bar');
});

test('it writes complex property to storage when it does not has it', function(assert) {
	service = this.container.lookup('service:cache');

	Ember.run(() => {
		service.set('foo', { bar: { foz: 'wow' } });
		service.set('foo.bar.foz', 'yo');
	});

	assert.equal(service.get('foo').bar.foz, 'yo');
	assert.equal(service.get('foo.bar.foz'), 'yo');
	assert.deepEqual(deserialize('cache:foo').data.bar.foz, 'yo');
});

test('it updates property in storage when it already has it', function(assert) {
	window.localStorage.setItem('cache:foo', JSON.stringify(wrap('bar')));

	service = this.container.lookup('service:cache');

	assert.equal(service.get('foo'), 'bar');

	Ember.run(() => {
		service.set('foo', 'wow');
	});

	assert.equal(service.get('foo'), 'wow');
	assert.deepEqual(deserialize('cache:foo').data, 'wow');
});

test('it reads property from memory storage', function(assert) {
	service = this.container.lookup('service:cache');

	Ember.run(() => {
		service.set('foo', 'bar');
	});

	window.localStorage.setItem('cache:foo', JSON.stringify(wrap('wow')));

	assert.equal(service.get('foo'), 'bar');
});

test('it does not reads property from local when memory does not have it', function(assert) {
	service = this.container.lookup('service:cache');

	window.localStorage.setItem('cache:foo', JSON.stringify(wrap('bar')));

	assert.notOk(service.get('foo'));
});

test('it returns the correct value for the same Ember run loop', function(assert) {
	service = this.container.lookup('service:cache');

	Ember.run(() => {
		service.set('foo', 'bar');

		assert.equal(service.get('foo'), 'bar');
		assert.notOk(deserialize('cache:foo'));

		service.set('foo');

		assert.notOk(service.get('foo'));
		assert.notOk(deserialize('cache:foo'));

		service.set('foo', 'foz');

		assert.equal(service.get('foo'), 'foz');
		assert.notOk(deserialize('cache:foo'));
	});

	Ember.run(() => {
		assert.equal(deserialize('cache:foo').data, 'foz');
	});
});

test('it does not replicates expired property from local to memory', function(assert) {
	const meta = { expire: +moment('2000-01-01') };

	window.localStorage.setItem('cache:foo', JSON.stringify(wrap('bar', meta)));

	Ember.run(() => {
		service = this.container.lookup('service:cache');
	});

	window.localStorage.setItem('cache:foz', JSON.stringify(wrap('wow', meta)));

	assert.notOk(service.get('foo'));
	assert.notOk(service.get('foz'));
});

test('it clears all items stored in storage', function(assert) {
	service = this.container.lookup('service:cache');

	Ember.run(() => {
		service.set('foo', wrap('bar'));
		service.set('foz', wrap('wow'));
	});

	Ember.run(() => {
		service.clear();
	});

	assert.notOk(service.get('foo'));
	assert.notOk(service.get('foz'));
	assert.notOk(window.localStorage.getItem('cache:foo'));
	assert.notOk(window.localStorage.getItem('cache:foz'));
});

test('it clears keys passed by arguments', function(assert) {
	service = this.container.lookup('service:cache');

	Ember.run(() => {
		service.set('foo', 'bar');
		service.set('bar', 'bar');
		service.set('wow', 'bar');
	});

	Ember.run(() => {
		service.clear('foo', 'bar');
	});

	assert.notOk(service.get('foo'));
	assert.notOk(service.get('bar'));
	assert.equal(service.get('wow'), 'bar');
	assert.notOk(window.localStorage.getItem('cache:foo'));
	assert.notOk(window.localStorage.getItem('cache:bar'));
	assert.equal(deserialize('cache:wow').data, 'bar');
});

test('it clears keys passed by array and arguments', function(assert) {
	service = this.container.lookup('service:cache');

	Ember.run(() => {
		service.set('foo', 'foo');
		service.set('bar', 'bar');
		service.set('foz', 'foz');
		service.set('wow', 'wow');
	});

	Ember.run(() => {
		service.clear(['foo', 'bar'], 'foz');
	});

	assert.notOk(service.get('foo'));
	assert.notOk(service.get('bar'));
	assert.notOk(service.get('foz'));
	assert.ok(service.get('wow'));
	assert.notOk(window.localStorage.getItem('cache:foo'));
	assert.notOk(window.localStorage.getItem('cache:bar'));
	assert.notOk(window.localStorage.getItem('cache:foz'));
	assert.equal(deserialize('cache:wow').data, 'wow');
});

test('it does not get property when it does not exist in storage', function(assert) {
	service = this.container.lookup('service:cache');

	assert.notOk(service.get('foo'));
});

test('it does not get property when expire time is expired', function(assert) {
	service = this.container.lookup('service:cache');

	Ember.run(() => {
		service.set('foo', wrap('bar'), { expire: +moment('2000-01-01') });
	});

	assert.notOk(service.get('foo'));
});

test('it does not set property key when expire time is expired', function(assert) {
	service = this.container.lookup('service:cache');

	Ember.run(() => {
		service.set('foo', wrap('bar'), { expire: +moment('2000-01-01') });
	});

	assert.notOk(service.get('foo'));
});

test('it does not get property key when expire time is expired', function(assert) {
	service = this.container.lookup('service:cache');

	Ember.run(() => {
		service.set('foo', wrap('bar'), { expire: +moment('2000-01-01') });
	});

	assert.notDeepEqual(service.keys(), ['foo']);
});

test('it writes options to storages when writes a property', function(assert) {
	service = this.container.lookup('service:cache');

	const time = +moment('2020-01-01');

	Ember.run(() => {
		service.set('foo', 'bar', { expire: time });
	});

	const localData = JSON.parse(window.localStorage.getItem('cache:foo'));

	assert.equal(localData.meta.expire, time);
});

test('it accepts moment object as expire time', function(assert) {
	service = this.container.lookup('service:cache');

	const time = moment('2020-01-01');

	Ember.run(() => {
		service.set('foo', 'bar', { expire: time });
	});

	let localData = JSON.parse(window.localStorage.getItem('cache:foo'));

	assert.equal(localData.meta.expire, +time);

	Ember.run(() => {
		service.set('foo', 'bar', time);
	});

	localData = JSON.parse(window.localStorage.getItem('cache:foo'));

	assert.equal(localData.meta.expire, +time);
});

test('it merges options to storages when updates a property', function(assert) {
	service = this.container.lookup('service:cache');

	const time = +moment('2020-01-01');

	Ember.run(() => {
		service.set('foo', 'bar', { expire: time });
		service.set('foo', 'wow', { foz: 'baz' });
	});

	const localData = JSON.parse(window.localStorage.getItem('cache:foo'));

	assert.equal(localData.data, 'wow');
	assert.equal(localData.meta.expire, time);
	assert.equal(localData.meta.foz, 'baz');
});

test('it updates options when updates a property', function(assert) {
	service = this.container.lookup('service:cache');

	const time1 = +moment('2020-01-01');
	const time2 = +moment('2020-01-02');

	Ember.run(() => {
		service.set('foo', 'bar', { expire: time1 });
		service.set('foo', 'bar', { expire: time2 });
	});

	const localData = JSON.parse(window.localStorage.getItem('cache:foo'));

	assert.equal(localData.meta.expire, time2);
});

test('it updates options when updates a complex property', function(assert) {
	service = this.container.lookup('service:cache');

	const time1 = +moment('2020-01-01');
	const time2 = +moment('2020-01-02');

	Ember.run(() => {
		service.set('foo', { bar: { foz: 'wow' } }, { expire: time1 });
		service.set('foo.bar.foz', 'yo', { expire: time2 });
	});

	const localData = JSON.parse(window.localStorage.getItem('cache:foo'));

	assert.equal(localData.data.bar.foz, 'yo');
	assert.equal(localData.meta.expire, time2);
});

test('it writes meta updated when writes a property by default', function(assert) {
	service = this.container.lookup('service:cache');

	Ember.run(() => {
		service.set('foo', 'bar');
	});

	const localData = JSON.parse(window.localStorage.getItem('cache:foo'));

	assert.equal(localData.data, 'bar');
	assert.ok(localData.meta.updated);
});

test('it writes expire time property as default meta when is a number', function(assert) {
	service = this.container.lookup('service:cache');

	const time = +moment('2020-01-01');

	Ember.run(() => {
		service.set('foo', 'bar', time);
	});

	const localData = JSON.parse(window.localStorage.getItem('cache:foo'));

	assert.equal(localData.meta.expire, time);
});

test('it notifies property change when a property is created', function(assert) {
	service = this.container.lookup('service:cache');

	const object = Ember.Object.extend({
		service,
		foo: Ember.computed.alias('service.foo')
	}).create();

	Ember.run(() => {
		service.set('foo', 'bar');
	});

	assert.equal(object.get('foo'), 'bar');

	Ember.run(object, 'destroy');
});

test('it notifies property change when a complex property is created', function(assert) {
	service = this.container.lookup('service:cache');

	const object = Ember.Object.extend({
		service,
		foo: Ember.computed.alias('service.foo.bar.foz')
	}).create();

	Ember.run(() => {
		service.set('foo', { bar: { foz: 'wow' } });
	});

	assert.equal(object.get('foo'), 'wow');

	Ember.run(object, 'destroy');
});

test('it notifies property change when a property is updated', function(assert) {
	service = this.container.lookup('service:cache');

	Ember.run(() => {
		service.set('foo', 'bar');
	});

	const object = Ember.Object.extend({
		service,
		foo: Ember.computed.alias('service.foo')
	}).create();

	Ember.run(() => {
		service.set('foo', 'wow');
	});

	assert.equal(object.get('foo'), 'wow');

	Ember.run(object, 'destroy');
});

test('it does not notifies property change when a complex property is updated', function(assert) {
	service = this.container.lookup('service:cache');

	Ember.run(() => {
		service.set('foo', { bar: { foz: 'wow' } });
	});

	const object = Ember.Object.extend({
		service,
		foo: Ember.computed.alias('service.foo.bar.foz')
	}).create();

	Ember.run(() => {
		service.set('foo', 'yo');
	});

	// Can't update localStorage. A complex property change will no be notified.
	assert.notEqual(object.get('foo'), 'yo');

	Ember.run(object, 'destroy');
});

test('it fires observed property when property is observed and is created', function(assert) {
	assert.expect(1);

	service = this.container.lookup('service:cache');

	const object = Ember.Object.extend({
		service,
		observer: Ember.observer('service.foo', function() {
			assert.equal(this.get('service.foo'), 'bar');
		})
	}).create();

	Ember.run(() => {
		service.set('foo', 'bar');

		object.destroy();
	});
});

test('it does not fires observed property when complex property is observed and is created', function(assert) {
	assert.expect(1);

	service = this.container.lookup('service:cache');

	const object = Ember.Object.extend({
		service,
		observer: Ember.observer('service.foo.bar.foz', function() {
			assert.notEqual(this.get('service.foo.foo.bar.foz'), 'wow');
		})
	}).create();

	Ember.run(() => {
		service.set('foo', { bar: { foz: 'wow' } });

		object.destroy();
	});
});

test('it fires observed property when property is observed and is updated', function(assert) {
	assert.expect(1);

	service = this.container.lookup('service:cache');

	Ember.run(() => {
		service.set('foo', 'bar');
	});

	const object = Ember.Object.extend({
		service,
		observer: Ember.observer('service.foo', function() {
			assert.equal(this.get('service.foo'), 'wow');
		})
	}).create();

	Ember.run(() => {
		service.set('foo', 'wow');

		object.destroy();
	});
});

test('it fires observed property when complex property is observed and is updated', function(assert) {
	assert.expect(1);

	service = this.container.lookup('service:cache');

	Ember.run(() => {
		service.set('foo', { bar: { foz: 'wow' } });
	});

	const object = Ember.Object.extend({
		service,
		observer: Ember.observer('service.foo.bar.foz', function() {
			assert.equal(this.get('service.foo.bar.foz'), 'yo');
		})
	}).create();

	Ember.run(() => {
		service.set('foo.bar.foz', 'yo');

		object.destroy();
	});
});

test('it does not fire observed property when property is already deleted in the storage', function(assert) {
	assert.expect(0);

	service = this.container.lookup('service:cache');

	Ember.run(() => {
		service.set('foo', 'bar');
		service.set('foo', null);
	});

	const object = Ember.Object.extend({
		service,
		observer: Ember.observer('service.foo', () => {
			assert.ok(false);
		})
	}).create();

	Ember.run(() => {
		service.set('foo', null);

		object.destroy();
	});
});

test('it does not reads full block even when is expired', function(assert) {
	service = this.container.lookup('service:cache');

	const time = +moment('2001-01-01');

	Ember.run(() => {
		service.set('foo', 'bar', time);
	});

	assert.notEqual(service.get('foo'), 'bar');
});

test('it filters properties by callback function', function(assert) {
	service = this.container.lookup('service:cache');

	Ember.run(() => {
		service.set('foo', 'bar', { foz: 'baz' });
		service.set('fou', 'bau', { foz: 'woz' });
	});

	const objects = service.filter((key, block) =>
		(Ember.get(block, 'meta.foz') === 'baz')
	);

	assert.equal(objects.length, 1);
	assert.equal(objects[0], 'foo');
});

test('it filters properties by meta property', function(assert) {
	service = this.container.lookup('service:cache');

	Ember.run(() => {
		service.set('foo', 'bar', { foz: true });
		service.set('fou', 'bau', { foz: false });
	});

	const objects = service.filterBy('foz');

	assert.equal(objects.length, 1);
	assert.equal(objects[0], 'foo');
});

test('it filters properties by meta property and value', function(assert) {
	service = this.container.lookup('service:cache');

	Ember.run(() => {
		service.set('foo', 'bar', { foz: 'baz' });
		service.set('fou', 'bau', { foz: 'woz' });
	});

	const objects = service.filterBy('foz', 'baz');

	assert.equal(objects.length, 1);
	assert.equal(objects[0], 'foo');
});

test('it blocks synchronization when property changes began', function(assert) {
	service = this.container.lookup('service:cache');

	Ember.run(() => {
		service.set('foo', 'foo');
		service.set('bar', 'bar');
		service.set('wow', 'wow');
		service.set('baz', 'baz');
	});

	const obj = Ember.Object.extend({
		service,
		observer: Ember.observer('service.foo', () => {
			// Force sync.
		})
	}).create();

	Ember.run(function() {
		service.clear();

		Ember.run.schedule('sync', this, () => {
			assert.notOk(service.get('baz'));
		});

		obj.destroy();
	});
});

test('it does not removes property when property is setted to false', function(assert) {
	Ember.run(() => {
		service = this.container.lookup('service:cache');
		service.setProperties({ foo: 'foo' });
	});

	Ember.run(service, 'set', 'foo', false);

	assert.equal(service.get('foo'), false);
});
