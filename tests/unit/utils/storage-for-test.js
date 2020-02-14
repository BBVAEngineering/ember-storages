import ComputedProperty from '@ember/object/computed';
import { run } from '@ember/runloop';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import LocalStorage from 'ember-storages/storages/local';
import MemoryStorage from 'ember-storages/storages/memory';
import storageFor, { LOCAL, MEMORY } from 'ember-storages/utils/storage-for';
import sinon from 'sinon';

let stub;

module('Unit | Util | storage-for', function(hooks) {
  hooks.beforeEach(function() {
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
  });

  hooks.afterEach(function() {
      stub.restore();
  });

  test('it returns local storage as default', (assert) => {
      const object = EmberObject.extend({
          storage: storageFor()
      }).create();

      assert.ok(LocalStorage.detectInstance(object.get('storage')));

      run(object, 'destroy');
  });

  test('it returns storage passed in arguments', (assert) => {
      const local = EmberObject.extend({
          storage: storageFor(LOCAL)
      }).create();
      const memory = EmberObject.extend({
          storage: storageFor(MEMORY)
      }).create();

      assert.ok(LocalStorage.detectInstance(local.get('storage')));
      assert.ok(MemoryStorage.detectInstance(memory.get('storage')));

      run(local, 'destroy');
      run(memory, 'destroy');
  });

  test('it returns a computed property', (assert) => {
      const storage = storageFor('foo');

      assert.ok(storage instanceof ComputedProperty);
  });

  test('it throws an error if storage was not found', (assert) => {
      const object = EmberObject.extend({
          storage: storageFor('foo')
      }).create();

      assert.throws(() => {
          object.get('storage');
      });

      run(object, 'destroy');
  });
});
