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
