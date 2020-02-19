# ember-storages

[![Build Status](https://travis-ci.com/BBVAEngineering/ember-storages.svg?branch=master)](https://travis-ci.com/BBVAEngineering/ember-storages)
[![GitHub version](https://badge.fury.io/gh/BBVAEngineering%2Fember-storages.svg)](https://badge.fury.io/gh/BBVAEngineering%2Fember-storages)
[![NPM version](https://badge.fury.io/js/ember-storages.svg)](https://badge.fury.io/js/ember-storages)
[![Dependency Status](https://david-dm.org/BBVAEngineering/ember-storages.svg)](https://david-dm.org/BBVAEngineering/ember-storages)
[![codecov](https://codecov.io/gh/BBVAEngineering/ember-storages/branch/master/graph/badge.svg)](https://codecov.io/gh/BBVAEngineering/ember-storages)
[![Greenkeeper badge](https://badges.greenkeeper.io/BBVAEngineering/ember-storages.svg)](https://greenkeeper.io/)
[![Ember Observer Score](https://emberobserver.com/badges/ember-storages.svg)](https://emberobserver.com/addons/ember-storages)

An [ember-cli addon](http://www.ember-cli.com/) to store data in storages (cache, local, memory, session).

## Information

[![NPM](https://nodei.co/npm/ember-storages.png?downloads=true&downloadRank=true)](https://nodei.co/npm/ember-storages/)

## Install in ember-cli application

In your application's directory:

  ember install ember-storages

## Usage

This service is an overall cache which saves any type of data, by synchronizing them in memory and in localStorage.
In both reading and writing, MemoryStorage takes precedence over LocalStorage.
In the reading, when it is detected that the data has expired, it is deleted.

Example:

```javascript

this.get('cache').set('foo', 'bar');
this.get('cache').get('foo'); // bar

```

It can be used from any file where this service is injected (by default in every routes and controllers).

### Data validity

By default, the validity time of these data is 10 minutes.
We can change this time by passing the amount of minutes or by passing the metadata object:

```javascript

this.get('cache').set('foo', 'bar', moment().add(10, 'minutes'));  // 10 min
this.get('cache').set('foo', 'bar', {
  expire: moment().add(10, 'minutes'),   // 10 min
});

```

### Data structure

The data is saved with the follow structure:

```javascript

foo: {
  meta: {
       updated: 1429806124,     << last updated time
        expire: 1429806124       << time of expiration
    },
    data: "bar"
}

```

'meta.expire' is the timestamp in which time the data will be expired.
'data' is the storaged value.

### Bindings

We can bind a property of controller and a value in cache.
Example:

```javascript

export default Ember.Controller.extend({
    foo: Ember.computed.alias('this.cache.foo'),
     actions: {
        changeFoo() {
            this.set('foo', 'bar2');
        },
    }
    ...
}

```

## Contribute

If you want to contribute to this addon, please read the [CONTRIBUTING.md](CONTRIBUTING.md).

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/BBVAEngineering/ember-storages/tags).

## Authors

See the list of [contributors](https://github.com/BBVAEngineering/ember-storages/graphs/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
