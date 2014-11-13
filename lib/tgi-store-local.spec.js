/**---------------------------------------------------------------------------------------------------------------------
 * tgi-store-local/lib/tgi-store-local.spec.js
 */
/**
 * Doc Intro
 */
spec.test('lib/tgi-store-local.spec.js', 'LOCALSTORAGE', '', function (callback) {
  var coreTests = spec.mute(false);
  spec.heading('LocalStore', function () {
    spec.paragraph('The LocalStore handles data storage via MongoDB.');
    spec.paragraph('Core tests run: ' + JSON.stringify(coreTests));
    spec.heading('CONSTRUCTOR', function () {
      spec.heading('Store Constructor tests are applied', function () {
        spec.runnerStoreConstructor(LocalStore,true);
      });
      spec.example('objects created should be an instance of LocalStore', true, function () {
        return new LocalStore() instanceof LocalStore;
      });
    });
    spec.heading('Store tests are applied', function () {
      spec.runnerStoreMethods(LocalStore,true);
      spec.runnerListStoreIntegration(LocalStore);
    });
  });
});
