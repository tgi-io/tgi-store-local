/**---------------------------------------------------------------------------------------------------------------------
 * tgi-store-local/lib/tgi-store-local.lib.js
 */
TGI.STORE = TGI.STORE || {};
TGI.STORE.LOCALSTORAGE = function () {
  return {
    version: '0.0.4',
    LocalStore: LocalStore
  };
};

/**---------------------------------------------------------------------------------------------------------------------
 * tgi-store-local/lib/tgi-store-local.source.js
 */

// Constructor
var LocalStore = function (args) {
  if (false === (this instanceof LocalStore)) throw new Error('new operator required');
  args = args || {};
  this.storeType = args.storeType || "LocalStore";
  this.name = args.name || 'a ' + this.storeType;
  this.storeProperty = {
    isReady: true,
    canGetModel: true,
    canPutModel: true,
    canDeleteModel: true,
    canGetList: true
  };
  var unusedProperties = getInvalidProperties(args, ['name', 'storeType']);
  var errorList = [];
  for (var i = 0; i < unusedProperties.length; i++) errorList.push('invalid property: ' + unusedProperties[i]);
  if (errorList.length > 1) throw new Error('error creating Store: multiple errors');
  if (errorList.length) throw new Error('error creating Store: ' + errorList[0]);
};
LocalStore.prototype = Object.create(Store.prototype);
// Methods
LocalStore.prototype.onConnect = function (location, callback, options) {
  if (typeof location != 'string') throw new Error('argument must a url string');
  if (typeof callback != 'function') throw new Error('argument must a callback');
  if (options && options.vendor)
    LocalStore.localStorage = options.vendor;
  callback(this, undefined);
};
LocalStore.prototype.getModel = function (model, callback) {
  var i, a;
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getObjectStateErrors().length) throw new Error('model has validation errors');
  if (!model.attributes[0].value) throw new Error('ID not set');
  if (typeof callback != "function") throw new Error('callback required');
  this._getStore();
  // Find model in LocalStore, error out if can't find
  var modelIndex = -1;
  for (i = 0; i < this.data.length; i++) if (this.data[i][0] == model.modelType) modelIndex = i;
  if (modelIndex < 0) {
    callback(model, new Error('model not found in store'));
    return;
  }
  // Find the ID now and put in instanceIndex
  var id = model.get('id');
  var storedPair = this.data[modelIndex][1];
  var instanceIndex = -1;
  for (i = 0; instanceIndex < 0 && i < storedPair.length; i++) if (storedPair[i][0] == id) instanceIndex = i;
  if (instanceIndex < 0) {
    callback(model, new Error('id not found in store'));
    return;
  }
  // Copy values from store to ref model
  var storeValues = storedPair[instanceIndex][1];
  for (a in model.attributes) {
    model.attributes[a].value = storeValues[model.attributes[a].name];
  }
  callback(model, undefined);
};
LocalStore.prototype.putModel = function (model, callback) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getObjectStateErrors().length) throw new Error('model has validation errors');
  if (typeof callback != "function") throw new Error('callback required');
  this._getStore();
  var id = model.get('ID');
  if (id) {
    // Find model in LocalStore, error out if can't find
    var modelIndex = -1;
    for (var i = 0; i < this.data.length; i++) if (this.data[i][0] == model.modelType) modelIndex = i;
    if (modelIndex < 0) {
      callback(model, new Error('model not found in store'));
      return;
    }
    // Find the ID now
    var instanceIndex = -1;
    var id = model.get('id');
    var storedPair = this.data[modelIndex][1];
    for (var i = 0; instanceIndex < 0 && i < storedPair.length; i++) if (storedPair[i][0] == id) instanceIndex = i;
    if (instanceIndex < 0) {
      callback(model, new Error('id not found in store'));
      return;
    }
    // Copy from store
    var ModelValues = {};
    for (var a in model.attributes) {
      var theName = model.attributes[a].name;
      var theValue = model.attributes[a].value;
      ModelValues[theName] = theValue;
    }
    storedPair[instanceIndex][1] = ModelValues;
    this._putStore();
    callback(model, undefined);
  } else {
    // Find model in LocalStore, add if not found
    var modelIndex = -1;
    for (var i = 0; i < this.data.length; i++) if (this.data[i][0] == model.modelType) modelIndex = i;
    if (modelIndex < 0) {
      this.data.push([model.modelType, []]);
      modelIndex = this.data.length - 1;
    }
    // Add the id and model to memory store
    var newID = ++this.idCounter;
    model.set('id', newID);
    var ModelValues = {};
    for (var a in model.attributes) {
      var theName = model.attributes[a].name;
      var theValue = model.attributes[a].value;
      ModelValues[theName] = theValue;
    }
    this.data[modelIndex][1].push([newID, ModelValues]);
    this._putStore();
    callback(model, undefined);
  }

};
LocalStore.prototype.deleteModel = function (model, callback) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getObjectStateErrors().length) throw new Error('model has validation errors');
  if (typeof callback != "function") throw new Error('callback required');
  this._getStore();
  // Find model in LocalStore, error out if can't find
  var modelIndex = -1;
  for (var i = 0; i < this.data.length; i++) if (this.data[i][0] == model.modelType) modelIndex = i;
  if (modelIndex < 0) {
    callback(model, new Error('model not found in store'));
    return;
  }
  // Find the ID now
  var instanceIndex = -1;
  var id = model.get('id');
  var storedPair = this.data[modelIndex][1];
  for (var i = 0; instanceIndex < 0 && i < storedPair.length; i++) if (storedPair[i][0] == id) instanceIndex = i;
  if (instanceIndex < 0) {
    callback(model, new Error('id not found in store'));
    return;
  }
  // Splice out the stored values then prepare that Model for callback with ID stripped
  var storeValues = storedPair.splice(instanceIndex, 1)[0][1];
  for (var a in model.attributes) {
    if (model.attributes[a].name == 'id')
      model.attributes[a].value = undefined;
    else
      model.attributes[a].value = storeValues[model.attributes[a].name];
  }
  this._putStore();
  callback(model, undefined);
};
LocalStore.prototype.getList = function (list, filter, arg3, arg4) {
  var callback, order;
  if (typeof(arg4) == 'function') {
    callback = arg4;
    order = arg3;
  } else {
    callback = arg3;
  }
  if (!(list instanceof List)) throw new Error('argument must be a List');
  if (!(filter instanceof Object)) throw new Error('filter argument must be Object');
  if (typeof callback != "function") throw new Error('callback required');
  this._getStore();
  list.clear();
  // Find model in LocalStore, if no model - no data
  var modelIndex = -1;
  for (var i = 0; i < this.data.length; i++)
    if (this.data[i][0] == list.model.modelType)
      modelIndex = i;
  if (modelIndex < 0) {
    callback(list);
    return;
  }
  var storedPair = this.data[modelIndex][1];
  for (var i = 0; i < storedPair.length; i++) {
    var doIt = true;
    for (var prop in filter) {
      if (filter.hasOwnProperty(prop)) {
//        console.log(storedPair[i][1][prop]);
        if (filter[prop] instanceof RegExp) {
          if (!filter[prop].test(storedPair[i][1][prop])) doIt = false;
        } else {
          if (filter[prop] != storedPair[i][1][prop]) doIt = false;
        }
      }
    }
    if (doIt) {
      var dataPart = [];
      for (var j in storedPair[i][1]) {
        dataPart.push(storedPair[i][1][j]);
      }
      list._items.push(dataPart);
    }
  }
  list._itemIndex = list._items.length - 1;
  if (order) {
    list.sort(order);
  }
  callback(list);
};

LocalStore.prototype._getStore = function () {
  if (LocalStore.localStorage.tequilaData)
    this.data = JSON.parse(LocalStore.localStorage.tequilaData);
  else
    this.data = [];
  if (LocalStore.localStorage.tequilaIDCounter)
    this.idCounter = LocalStore.localStorage.tequilaIDCounter;
  else
    this.idCounter = 0;
};
LocalStore.prototype._putStore = function () {
  LocalStore.localStorage.tequilaData = JSON.stringify(this.data);
  LocalStore.localStorage.tequilaIDCounter = this.idCounter;
};
