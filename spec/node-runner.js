/**---------------------------------------------------------------------------------------------------------------------
 * tgi-spec/spec/node-runner.js
 */
var Spec = require('tgi-spec/dist/tgi.spec.js');
var testSpec = require('../dist/tgi-store-local.spec.js');
var TGI = require('../dist/tgi-store-local.js');
var fs = require('fs');
var _package = require('../package');

if (_package.version != TGI.STORE.LOCALSTORAGE().version) {
  console.error('Library version %s does not match package.json %s',TGI.STORE.LOCALSTORAGE().version,_package.version);
  process.exit(1);
}
(function () {
  var spec = new Spec();
  testSpec(spec, TGI);
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./build');
  var ls = TGI.STORE.LOCALSTORAGE();
  var localStore = new ls.LocalStore({name: 'Local Test Store'});
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
