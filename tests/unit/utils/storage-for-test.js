import { run } from '@ember/runloop';
import EmberObject from '@ember/object';
import { setOwner } from '@ember/application';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import LocalStorage from 'ember-storages/storages/local';
import MemoryStorage from 'ember-storages/storages/memory';
import storageFor, { LOCAL, MEMORY } from 'ember-storages/utils/storage-for';

let ContainerObject;

module('Unit | Util | storage-for', (hooks) => {
	setupTest(hooks);

	hooks.beforeEach(function() {
		this.owner.register(`storage:${LOCAL}`, LocalStorage.create(), { instantiate: false });
		this.owner.register(`storage:${MEMORY}`, MemoryStorage.create(), { instantiate: false });

		const { owner } = this;

		ContainerObject = EmberObject.extend({
			init() {
				this._super();
				setOwner(this, owner);
			}
		});
	});

	test('it returns local storage as default', (assert) => {
		const object = ContainerObject.extend({
			storage: storageFor()
		}).create();

		assert.ok(LocalStorage.detectInstance(object.get('storage')));

		run(object, 'destroy');
	});

	test('it returns storage passed in arguments', (assert) => {
		const local = ContainerObject.extend({
			storage: storageFor(LOCAL)
		}).create();
		const memory = ContainerObject.extend({
			storage: storageFor(MEMORY)
		}).create();

		assert.ok(LocalStorage.detectInstance(local.get('storage')));
		assert.ok(MemoryStorage.detectInstance(memory.get('storage')));

		run(local, 'destroy');
		run(memory, 'destroy');
	});

	test('it throws an error if storage was not found', (assert) => {
		const object = ContainerObject.extend({
			storage: storageFor('foo')
		}).create();

		assert.throws(() => {
			object.get('storage');
		});

		run(object, 'destroy');
	});
});
