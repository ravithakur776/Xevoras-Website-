/* Firebase compat SDK bootstrap. The SDK is loaded from the CDN in each page
   before this file, matching the no-build setup used by the other projects. */
window.XEVORA = window.XEVORA || {};

(function (X) {
  "use strict";

  X.auth = null;
  X.db = null;
  X.firebaseReady = false;

  if (!window.firebase) {
    console.warn("[Xevoras] Firebase SDK did not load. The storefront will use its bundled catalogue and local cart.");
    return;
  }

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(X.firebaseConfig);
    }
    X.auth = firebase.auth();
    X.db = firebase.firestore();
    X.firebaseReady = true;
  } catch (error) {
    console.error("[Xevoras] Firebase initialization failed.", error);
    return;
  }

  /* Small wrappers keep page scripts readable and make the compat API easy to
     replace if the site is ever moved to the modular SDK. */
  X.serverTimestamp = function () {
    return firebase.firestore.FieldValue.serverTimestamp();
  };

  X.increment = function (value) {
    return firebase.firestore.FieldValue.increment(value);
  };

  X.docData = function (snapshot) {
    if (!snapshot || !snapshot.exists) return null;
    return Object.assign({ id: snapshot.id }, snapshot.data());
  };

  X.snapshotRows = function (snapshot) {
    return snapshot.docs.map(function (item) {
      return Object.assign({ id: item.id }, item.data());
    });
  };

  X.friendlyFirebaseError = function (error) {
    var code = error && error.code ? String(error.code) : "";
    var messages = {
      "auth/invalid-email": "Enter a valid email address.",
      "auth/missing-email": "Enter your email address.",
      "auth/user-not-found": "Email or password is incorrect.",
      "auth/wrong-password": "Email or password is incorrect.",
      "auth/invalid-credential": "Email or password is incorrect.",
      "auth/invalid-login-credentials": "Email or password is incorrect.",
      "auth/user-disabled": "This account has been disabled.",
      "auth/email-already-in-use": "An account with this email already exists. Sign in instead.",
      "auth/weak-password": "Use at least 6 characters for your password.",
      "auth/operation-not-allowed": "Email and password sign-in is not enabled in Firebase yet.",
      "auth/requires-recent-login": "Please sign in again before making this change.",
      "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
      "auth/unauthorized-domain": "This domain is not authorised for Firebase sign-in yet.",
      "auth/network-request-failed": "Network error. Check your connection and try again.",
      "permission-denied": "Firebase permissions do not allow this action. Check that the included rules are deployed.",
      unavailable: "Firebase is unavailable right now. Check your connection and try again.",
    };
    if (messages[code]) return new Error(messages[code]);
    return error instanceof Error ? error : new Error("Something went wrong.");
  };
})(window.XEVORA);
