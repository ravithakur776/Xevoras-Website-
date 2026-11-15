/* Email and password sign-in / account creation using Firebase Auth (compat SDK). */
(function (X) {
  "use strict";

  var root = document.getElementById("login-root");
  var mode = "signin";

  function byId(id) {
    return document.getElementById(id);
  }

  function setError(id, message) {
    var node = byId(id);
    if (!node) return;
    node.textContent = message || "";
    node.hidden = !message;
  }

  function setBusy(button, busy, label) {
    if (!button) return;
    button.disabled = busy;
    if (label) button.innerHTML = busy ? "Please wait…" : label;
  }

  function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
  }

  function renderSignedIn() {
    root.innerHTML =
      '<div class="auth-card"><p class="eyebrow">Your account</p><h1>You’re already signed in.</h1>' +
      '<p class="auth-copy">Continue to your account to view orders and saved details.</p>' +
      '<a href="account.html" class="button button-primary full">Go to account ' + X.icon("arrow", 16) + "</a></div>";
  }

  function renderForms() {
    if (X.state.user) return renderSignedIn();

    root.innerHTML =
      '<div class="auth-card"><p class="eyebrow">Your account</p>' +
      '<h1 id="login-title">Welcome back.</h1>' +
      '<p class="auth-copy" id="login-copy">Sign in with your email address and password.</p>' +

      '<div class="auth-tabs" role="tablist" aria-label="Sign in or create an account">' +
      '<button type="button" class="auth-tab active" id="tab-signin" data-auth-mode="signin" role="tab" aria-selected="true">Sign in</button>' +
      '<button type="button" class="auth-tab" id="tab-signup" data-auth-mode="signup" role="tab" aria-selected="false">Create account</button></div>' +

      '<form class="auth-form" id="signin-form" novalidate>' +
      '<label class="field"><span>Email</span>' +
      '<input type="email" id="signin-email" autocomplete="email" placeholder="you@example.com" aria-label="Email address"></label>' +
      '<label class="field"><span>Password</span>' +
      '<input type="password" id="signin-password" autocomplete="current-password" placeholder="Your password" aria-label="Password"></label>' +
      '<p class="form-error" id="signin-error" hidden></p>' +
      '<button type="submit" class="button button-primary full" id="signin-submit">Sign in ' + X.icon("arrow", 16) + "</button>" +
      '<button type="button" class="text-link centered" id="forgot-password">Forgot password?</button></form>' +

      '<form class="auth-form" id="signup-form" hidden novalidate>' +
      '<label class="field"><span>Full name</span>' +
      '<input type="text" id="signup-name" autocomplete="name" placeholder="Your name" aria-label="Full name"></label>' +
      '<label class="field"><span>Email</span>' +
      '<input type="email" id="signup-email" autocomplete="email" placeholder="you@example.com" aria-label="Email address"></label>' +
      '<label class="field"><span>Password</span>' +
      '<input type="password" id="signup-password" autocomplete="new-password" placeholder="At least 6 characters" aria-label="Password"></label>' +
      '<label class="field"><span>Confirm password</span>' +
      '<input type="password" id="signup-confirm" autocomplete="new-password" placeholder="Repeat your password" aria-label="Confirm password"></label>' +
      '<p class="form-error" id="signup-error" hidden></p>' +
      '<button type="submit" class="button button-primary full" id="signup-submit">Create account ' + X.icon("arrow", 16) + "</button></form>" +

      '<p class="auth-legal">By continuing you agree to our <a href="terms.html">Terms</a> and <a href="privacy.html">Privacy Policy</a>.</p></div>' +

      '<div class="auth-benefits">' +
      "<div>" + X.icon("shield", 19) + "<h3>Secure by design</h3><p>Firebase email and password authentication. Your password is never stored on this site.</p></div>" +
      "<div>" + X.icon("truck", 19) + "<h3>Order updates</h3><p>Track your orders and view delivery details from your account.</p></div>" +
      "<div>" + X.icon("lock", 19) + "<h3>Your data, your control</h3><p>We collect only what is needed to process your order.</p></div></div>";

    wireForms();
    setMode(mode);
  }

  function setMode(nextMode) {
    mode = nextMode === "signup" ? "signup" : "signin";
    var signinForm = byId("signin-form");
    var signupForm = byId("signup-form");
    var signinTab = byId("tab-signin");
    var signupTab = byId("tab-signup");
    var title = byId("login-title");
    var copy = byId("login-copy");
    if (!signinForm || !signupForm) return;

    signinForm.hidden = mode !== "signin";
    signupForm.hidden = mode !== "signup";
    signinTab.classList.toggle("active", mode === "signin");
    signupTab.classList.toggle("active", mode === "signup");
    signinTab.setAttribute("aria-selected", String(mode === "signin"));
    signupTab.setAttribute("aria-selected", String(mode === "signup"));

    if (title) title.textContent = mode === "signup" ? "Create your account." : "Welcome back.";
    if (copy) {
      copy.textContent = mode === "signup"
        ? "One account for your bag, wishlist and orders."
        : "Sign in with your email address and password.";
    }

    setError("signin-error", "");
    setError("signup-error", "");

    if (mode === "signup") {
      var signupEmail = byId("signup-email");
      var signinEmail = byId("signin-email");
      if (signupEmail && !signupEmail.value && signinEmail) signupEmail.value = signinEmail.value.trim();
      var name = byId("signup-name");
      if (name) name.focus();
    } else {
      var signinField = byId("signin-email");
      if (signinField) signinField.focus();
    }
  }

  function saveProfileName(user, name) {
    if (!X.db || !user || !name) return Promise.resolve();
    var ref = X.db.collection("users").doc(user.uid);
    return ref.get().then(function (snapshot) {
      if (snapshot.exists) {
        return ref.update({
          fullName: name,
          updatedAt: X.serverTimestamp(),
        });
      }
      return ref.set({
        fullName: name,
        email: user.email || "",
        role: "customer",
        createdAt: X.serverTimestamp(),
        updatedAt: X.serverTimestamp(),
      });
    }).catch(function (error) {
      // Auth still works if the profile write fails (for example, rules not deployed).
      console.warn("[Xevoras] Could not save the profile name.", error);
    });
  }

  async function signIn(email, password, button, errorId) {
    setBusy(button, true);
    try {
      await X.auth.signInWithEmailAndPassword(email, password);
      X.toast("Signed in successfully.", "success");
      window.location.href = X.safeNext(X.query("next"));
    } catch (error) {
      setError(errorId, X.friendlyFirebaseError(error).message);
      setBusy(button, false, "Sign in " + X.icon("arrow", 16));
    }
  }

  async function signUp(name, email, password, button, errorId) {
    setBusy(button, true);
    var credential;
    try {
      credential = await X.auth.createUserWithEmailAndPassword(email, password);
      if (credential.user) {
        try {
          await credential.user.updateProfile({ displayName: name });
        } catch (error) {
          console.warn("[Xevoras] Could not update the display name.", error);
        }
        await saveProfileName(credential.user, name);
      }
      X.toast("Account created. Welcome to Xevoras.", "success");
      window.location.href = X.safeNext(X.query("next"));
    } catch (error) {
      setError(errorId, X.friendlyFirebaseError(error).message);
      setBusy(button, false, "Create account " + X.icon("arrow", 16));
    }
  }

  function wireForms() {
    document.querySelectorAll("[data-auth-mode]").forEach(function (button) {
      button.addEventListener("click", function () {
        setMode(button.getAttribute("data-auth-mode"));
      });
    });

    var signinForm = byId("signin-form");
    signinForm.addEventListener("submit", function (event) {
      event.preventDefault();
      setError("signin-error", "");
      var email = byId("signin-email").value.trim();
      var password = byId("signin-password").value;
      if (!isEmail(email)) return setError("signin-error", "Enter a valid email address.");
      if (!password) return setError("signin-error", "Enter your password.");
      if (!X.firebaseReady) return setError("signin-error", "Firebase is not available. Check the browser console.");
      signIn(email, password, byId("signin-submit"), "signin-error");
    });

    var signupForm = byId("signup-form");
    signupForm.addEventListener("submit", function (event) {
      event.preventDefault();
      setError("signup-error", "");
      var name = byId("signup-name").value.trim();
      var email = byId("signup-email").value.trim();
      var password = byId("signup-password").value;
      var confirm = byId("signup-confirm").value;
      if (name.length < 2) return setError("signup-error", "Enter your full name.");
      if (!isEmail(email)) return setError("signup-error", "Enter a valid email address.");
      if (password.length < 6) return setError("signup-error", "Use at least 6 characters for your password.");
      if (password !== confirm) return setError("signup-error", "The passwords do not match.");
      if (!X.firebaseReady) return setError("signup-error", "Firebase is not available. Check the browser console.");
      signUp(name, email, password, byId("signup-submit"), "signup-error");
    });

    byId("forgot-password").addEventListener("click", async function () {
      setError("signin-error", "");
      var email = byId("signin-email").value.trim();
      if (!isEmail(email)) return setError("signin-error", "Enter your email address first, then request a reset link.");
      if (!X.firebaseReady) return setError("signin-error", "Firebase is not available. Check the browser console.");
      try {
        await X.auth.sendPasswordResetEmail(email);
        X.toast("Password reset link sent. Check your inbox.", "success");
      } catch (error) {
        setError("signin-error", X.friendlyFirebaseError(error).message);
      }
    });
  }

  function boot() {
    if (!root) return;
    X.authReady.then(function () {
      if (X.state.user) renderSignedIn();
      else renderForms();
    });
    document.addEventListener("xevora:auth", function () {
      if (X.state.user) renderSignedIn();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window.XEVORA);
