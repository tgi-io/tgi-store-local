/**---------------------------------------------------------------------------------------------------------------------
 * tgi-spec/spec/node-runner.js
 */
var Spec = require('tgi-spec/dist/tgi.spec.js');
var testSpec = require('../dist/tgi-store-local.spec.js');
var spec = new Spec();
var UTILITY = require('tgi-utility/dist/tgi.utility');
var CORE = require('../dist/tgi-store-local.js');

(function () {
  UTILITY().injectMethods(this);
  CORE().injectMethods(this);
  testSpec(spec, CORE);
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
  var localStore = new LocalStore({name: 'Host Test Store'});
  localStore.onConnect('http://localhost', function (store, err) {
    if (err) {
      console.log('localStore unavailable (' + err + ')');
      process.exit(1);
    } else {
      console.log('localStore connected');
      spec.runTests(function (msg) {
        if (msg.error) {
          console.log('UT OH: ' + msg.error);
          process.exit(1);
        } else if (msg.done) {
          console.log('Testing completed with  ...');
          console.log('testsCreated = ' + msg.testsCreated);
          console.log('testsPending = ' + msg.testsPending);
          console.log('testsFailed = ' + msg.testsFailed);
          if (msg.testsFailed || msg.testsPending)
            process.exit(1);
          else
            process.exit(0);
        } else if (msg.log) {
          console.log(msg.log);
        }
      });
    }
    console.log(localStore.name + ' ' + localStore.storeType);
  }, {vendor: localStorage, keepConnection: true});
}());
