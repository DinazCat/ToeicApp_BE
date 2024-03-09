const firebase = require('firebase-mock');

const mockauth = new firebase.MockAuthentication();
const mockfirestore = new firebase.MockFirestore();

const mockSdk = new firebase.MockFirebaseSdk(
  null,
  () => mockauth,
  () => mockfirestore
);
module.exports = mockSdk;