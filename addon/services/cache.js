/* eslint-disable prefer-spread, no-implicit-coercion */
import Ember from 'ember';
import moment from 'moment';
import storageFor from 'ember-storages/utils/storage-for';

const {
	aliasMethod,
	assign,
	get,
	isEmpty,
	isNone,
	isPresent,
	typeOf,
	Service,
	set
} = Ember;

/**
 * Check if a cache block is valid.
 *
 * @method checkBlock
 * @param  {Object} block
 * @return Boolean
 */
export const checkBlock = (block) => {
	const now = +moment();
	const expire = get(block, 'meta.expire');

	// Si no ha expirado
	return isEmpty(expire) || expire > now;
};

/**
 * Check if a meta value or block is valid.
 *
 * @method checkMeta
 * @param  {Mixed} meta
 * @return {Object}
 */
function checkMeta(meta) {
	// If meta is not an object, set it as expire time.
	if (meta.constructor.name !== 'Object') {
		meta = {
			expire: meta
		};
	}

	// Convert moment expire time to timestamp.
	if (typeOf(meta.expire) === 'object') {
		meta.expire = +meta.expire;
	}

	// Do not store block if meta has expired.
	if (!checkBlock({ meta })) {
		return null;
	}

	return meta;
}

/**
 * Wrap value and meta in a object.
 *
 * @method wrap
 * @param  {Mixed} data
 * @param  {Object} meta
 * @return Object
 */
export const wrap = (data, meta = {}) => {
	const block = { data, meta };

	block.meta.updated = +moment();

	return block;
};

/**
 * Servicio de cache de propiedades.
 *
 * ## Funcionamiento general
 *
 * Este Service es una caché genérica que guarda cualquier tipo de dato, sincronizándolos tanto en memoria como en localStorage.
 * Ejemplo de llamada:
 *
 * ```javascript
 * this.get('cache').set('foo', 'bar');
 *
 * this.get('cache').get('foo'); // bar
 * ```
 *
 * Puede utilizarse desde cualquier sitio donde se haya inyectado este Service (por defecto en todas las rutas y controladores).
 *
 * ## Validez de los datos
 *
 * Por defecto se establece un tiempo de validez de los datos de 10 minutos.
 * Puede especificarse una validez distinta indicando el número de minutos, o bien el objeto de metadata completo:
 *
 * ```javascript
 * this.get('cache').set('foo', 'bar', moment().add(10, 'minutes'));  // 10 min
 *
 * this.get('cache').set('foo', 'bar', {
 *     expire: moment().add(10, 'minutes'),   // 10 min
 * });
 * ```
 *
 * ## Ciclo de ejecución
 *
 * Tanto en lectura como en escritura, MemoryStorage tiene prioridad sobre LocalStorage.
 *
 * En la lectura, cuando se detecta que el dato ha caducado, se elimina.
 *
 * ## Estructura de datos
 *
 * Los datos se guardan siguiendo la siguiente estructura:
 *
 * ```
 * foo: {
 *     meta: {
 *         updated: 1429806124,     << last updated time
 *         expire: 1429806124       << time of expiration
 *     },
 *     data: "bar"
 * }
 * ```
 *
 * 'meta.expire' es el timestamp en el cual la información se considera caducada.
 * 'data' contiene el dato almacenado.
 *
 * ## Bindings
 *
 * Es posible establecer un binding entre una propiedad de un controlador y un elemento de la caché. Ejemplo:
 *
 * ```javascript
 * export default Ember.Controller.extend({
 *     foo: Ember.computed.alias('this.cache.foo'),
 *
 *     actions: {
 *         changeFoo() {
 *             this.set('foo', 'bar2');
 *         },
 *     }
 *     ...
 * }
 * ```
 *
 * @extends Ember.Service
 */
export default Service.extend({

	/**
	 * Content storage.
	 *
	 * @property storage
	 * @type {Object}
	 */
	storage: storageFor('cache'),

	/**
	 * Clear expired keys.
	 *
	 * @method init
	 * @private
	 */
	init() {
		const storage = this.get('storage');

		this._super(...arguments);

		// Clear expired keys
		Object.keys(storage.get('content')).forEach((key) => {
			// Do not change to complex getter 'this.get(`storage.${key}`)', it will
			// not work because the storage getter sets the namesmace to the key
			const block = storage.get(key);

			if (!block || !checkBlock(block)) {
				storage.set(key);
			}
		});
	},

	/**
	 * Alias of _set method.
	 *
	 * @method set
	 */
	set: aliasMethod('_set'),

	/**
	 * Alias of _get method.
	 *
	 * @method unknownProperty
	 */
	unknownProperty: aliasMethod('_get'),

	/**
	 * Alias of _set method.
	 *
	 * @method setUnknownProperty
	 */
	setUnknownProperty: aliasMethod('_set'),

	/**
	 * Get keys from all storages.
	 *
	 * @method keys
	 * @return Array
	 */
	keys() {
		return this.get('storage').keys().filter((key) => {
			const block = this.getBlock(key);

			// Check block expiration date.
			return block && checkBlock(block);
		});
	},

	/**
	 * Get all cached data for key (data & meta properties).
	 *
	 * @method getBlock
	 * @param {String} key
	 * @private
	 */
	getBlock(key) {
		return this.get('storage').get(key);
	},

	/**
	 * Clear properties stored from all storages.
	 *
	 * @method clear
	 */
	clear(...keys) {
		if (keys.length === 0) {
			keys = this.keys();
		} else {
			// Flatten keys
			keys = [].concat(...keys);
		}
		// Do not change for this.get('storage').set(key), it will not fire
		// bindings and check for an empty value..
		keys.forEach((key) => {
			this.set(key, null);
		});
	},

	/**
	 * Returns an array with all of the items in the enumeration that the passed
	 * function returns true for. This method corresponds to `filter()` defined in
	 * JavaScript 1.6.
	 *
	 * @method filter
	 * @param {Function} callback
	 * @param {Object} target
	 * @return Array
	 */
	filter(callback, target) {
		const ret = [];

		this.keys().forEach((key, index, enumerable) => {
			const block = this.getBlock(key);

			if (callback.call(target, key, block, index, enumerable)) {
				ret.push(key);
			}
		});

		return ret;
	},

	/**
	 * Returns an array with just the items with the matched property. You
	 * can pass an optional second argument with the target value. Otherwise
	 * this will match any property that evaluates to `true`.
	 *
	 * @method filterBy
	 * @param {String} key
	 * @param {String} value
	 * @return Array
	 */
	filterBy() {
		return this.filter(this._iter.apply(this, arguments));
	},

	/**
	 * Iteration method to filter by a property.
	 *
	 * @method _iter
	 * @param {String} key
	 * @param {String} value
	 * @return Mixed
	 * @private
	 */
	_iter(key, value) {
		const valueProvided = (arguments.length === 2);

		return (k, block) => {
			const cur = get(block, `meta.${key}`);

			return valueProvided ? value === cur : Boolean(cur);
		};
	},

	/**
	 * Get full block and return data.
	 *
	 * @method _get
	 * @param {String} key
	 * @return Mixed
	 * @private
	 */
	_get(key) {
		const block = this.getBlock(key);

		// Check block expiration date.
		if (block && checkBlock(block)) {
			return get(block, 'data');
		}

		return null;
	},

	/**
	 * Updates or creates a new block to be stored.
	 *
	 * @method _makeBlock
	 * @param {Object} oldBlock
	 * @param {String} dataKey
	 * @param {Mixed} value
	 * @param {Object|Number} meta
	 * @private
	 */
	_makeBlock(oldBlock, dataKey, value, meta) {
		let block;
		const isNestedProperty = isPresent(dataKey);

		// Build the block for complex properties.
		if (oldBlock && isNestedProperty) {
			const valueData = get(oldBlock, 'data');

			// Update the complex key in the old object.
			set(valueData, dataKey, value);
			value = valueData;
		}

		// If we have value, is a store or update for a property.
		if (isPresent(value)) {
			if (meta) {
				meta = checkMeta(meta);

				// Do not store block if meta has expired.
				if (!meta) {
					return [false, false];
				}
			}

			// Make the object that is going to be stored.
			block = wrap(value, meta);

			// Merge both meta if old exists.
			if (oldBlock && oldBlock.meta) {
				block.meta = assign({}, oldBlock.meta, block.meta);
			}
		}

		return [block, value];
	},

	/**
	 * Stores value and meta to storages.
	 *
	 * @method _set
	 * @param {String} key
	 * @param {Mixed} value
	 * @param {Object|Number} meta
	 * @private
	 */
	_set(key, value, meta) {
		let rootKey = key;
		let dataKey = '';

		// Update value from root node.
		const keyParts = key.split('.');
		const isNestedProperty = keyParts.length > 1;

		// Check for a complex property set.
		if (isNestedProperty) {
			rootKey = keyParts[0];
			dataKey = keyParts.slice(1).join('.');
		}

		// Get old block to get the meta property.
		const oldBlock = this.getBlock(rootKey);

		// Build the block for complex properties.
		const [block, outputValue] = this._makeBlock(oldBlock, dataKey, value, meta);

		// Do not store anything if block is not valid.
		if (block === false && outputValue === false) {
			return this;
		}

		this.get('storage').set(rootKey, block);

		if (!isNone(outputValue) || (isNone(outputValue) && oldBlock)) {
			this.notifyPropertyChange(key);
		}

		return this;
	}

});
