/* =============================================
   EMI — login-script.js
   Login page: form submit, API auth,
   token storage, redirect to dashboard.
============================================= */

/* =============================================
   LANGUAGE SWITCHER
============================================= */
function setLang(lang) {
  localStorage.setItem('emi_lang', lang);
  var btnEn = document.getElementById('lang-en');
  var btnFr = document.getElementById('lang-fr');
  if (btnEn) btnEn.classList.toggle('active', lang === 'en');
  if (btnFr) btnFr.classList.toggle('active', lang === 'fr');
  document.querySelectorAll('[data-en]').forEach(function(el) {
    var text = el.getAttribute('data-' + lang);
    if (text === null) return;
    if (text.indexOf('<') !== -1) el.innerHTML = text;
    else el.textContent = text;
  });
  document.querySelectorAll('[data-placeholder-en]').forEach(function(el) {
    var ph = el.getAttribute('data-placeholder-' + lang);
    if (ph) el.placeholder = ph;
  });
  document.documentElement.lang = lang;
}
(function() { setLang(localStorage.getItem('emi_lang') || 'en'); })();


/* =============================================
   AUTO-REDIRECT
   If a valid token already exists, skip login.

   ── PRODUCTION TIP ──────────────────────────
   Right now this only checks if the token EXISTS.
   For stricter security, validate it with the
   backend before redirecting:

     fetch(API_BASE + '/auth/me', { headers: getHeaders() })
       .then(function(res) {
         if (res.ok) window.location.href = 'dashboard.html';
         else localStorage.removeItem('emi_token');
       });

   You'll need to create GET /auth/me on the backend
   that returns the logged-in user from the JWT.
============================================= */
(function() {
  var token = localStorage.getItem('emi_token');
  if (token) {
    window.location.href = 'dashboard.html';
  }
})();


/* =============================================
   API CONFIGURATION
   ✅ CONNECTED — points to your Express server
============================================= */
var API_BASE = 'http://localhost:5000/api';

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Accept':       'application/json'
  };
}


/* =============================================
   PASSWORD TOGGLE
============================================= */
var togglePwd = document.getElementById('toggle-pwd');
var pwdField  = document.getElementById('password');

togglePwd.addEventListener('click', function() {
  var isText = pwdField.type === 'text';
  pwdField.type = isText ? 'password' : 'text';
  togglePwd.querySelector('i').className = isText ? 'fa fa-eye' : 'fa fa-eye-slash';
});


/* =============================================
   ERROR DISPLAY HELPERS
============================================= */
function showError(msg) {
  var lang    = localStorage.getItem('emi_lang') || 'en';
  var errEl   = document.getElementById('login-error');
  var errMsg  = document.getElementById('login-error-msg');
  var emailEl = document.getElementById('email');
  var pwdEl   = document.getElementById('password');

  if (msg) {
    errMsg.textContent = msg;
  } else {
    errMsg.textContent = lang === 'fr'
      ? 'Email ou mot de passe incorrect. Veuillez réessayer.'
      : 'Invalid email or password. Please try again.';
  }
  errEl.classList.add('show');
  emailEl.classList.add('is-invalid');
  pwdEl.classList.add('is-invalid');
}

function clearError() {
  document.getElementById('login-error').classList.remove('show');
  document.getElementById('email').classList.remove('is-invalid');
  document.getElementById('password').classList.remove('is-invalid');
}


/* =============================================
   FORGOT PASSWORD
============================================= */
document.getElementById('forgot-link').addEventListener('click', function(e) {
  e.preventDefault();
  var lang = localStorage.getItem('emi_lang') || 'en';
  /*
  ── TODO: Password reset flow ────────────────
  OPTION A — Redirect to a reset page:
    window.location.href = 'forgot-password.html';

  OPTION B — Send reset email via API:
    var email = document.getElementById('email').value.trim();
    if (!email) { alert('Enter your email first.'); return; }
    fetch(API_BASE + '/auth/reset-password', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email: email })
    }).then(function(res) { return res.json(); })
      .then(function() {
        alert('Reset link sent to ' + email);
      });
  ─────────────────────────────────────────────
  */
  alert(lang === 'fr'
    ? 'Contactez votre administrateur système pour réinitialiser votre mot de passe.'
    : 'Contact your system administrator to reset your password.');
});


/* =============================================
   FORM SUBMIT — LOGIN
   ✅ CONNECTED TO: POST /api/auth/login

   Your backend returns:
   {
     token: "eyJ...",
     user: {
       id:         "...",
       first_name: "Jean",
       last_name:  "Dupont",
       email:      "jean@emi.cm"
     }
   }

   We build `name` and `initials` from
   first_name + last_name for the dashboard navbar.
============================================= */
var loginForm     = document.getElementById('login-form');
var loginBtn      = document.getElementById('login-btn');
var loginBtnLabel = document.getElementById('login-btn-label');

loginForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  clearError();

  var lang     = localStorage.getItem('emi_lang') || 'en';
  var email    = document.getElementById('email').value.trim();
  var password = document.getElementById('password').value;
  var remember = document.getElementById('remember-me').checked;

  /* ── Client-side validation ── */
  if (!email || !password) {
    showError(lang === 'fr'
      ? 'Veuillez remplir tous les champs.'
      : 'Please fill in all fields.');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError(lang === 'fr'
      ? 'Adresse email invalide.'
      : 'Invalid email address.');
    return;
  }

  /* ── Loading state ── */
  loginBtn.disabled = true;
  loginBtnLabel.textContent = lang === 'fr' ? 'Connexion…' : 'Signing in…';

  try {
    var response = await fetch(API_BASE + '/auth/login', {
      method:  'POST',
      headers: getHeaders(),
      body:    JSON.stringify({ email: email, password: password })
    });

    var data = await response.json();

    if (response.ok && data.token) {
      /* ── ✅ LOGIN SUCCESS ── */

      // 1. Save JWT token for all dashboard API calls
      localStorage.setItem('emi_token', data.token);

      // 2. Build user object for the dashboard navbar
      //    Your backend sends first_name + last_name (not a combined "name")
      //    so we build it here and store it.
      if (data.user) {
        var firstName = data.user.first_name || '';
        var lastName  = data.user.last_name  || '';
        var fullName  = (firstName + ' ' + lastName).trim();
        var initials  = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();

        localStorage.setItem('emi_admin_user', JSON.stringify({
          id:        data.user.id,
          name:      fullName  || data.user.email,
          initials:  initials  || 'A',
          email:     data.user.email,
          photo_url: data.user.photo_url || null
        }));
      }

      // 3. Remember email if checked
      if (remember) {
        localStorage.setItem('emi_remember_email', email);
      } else {
        localStorage.removeItem('emi_remember_email');
      }

      // 4. Go to dashboard
      window.location.href = 'dashboard.html';

    } else {
      /* ── LOGIN FAILURE ── */
      // Backend sends: { message: "Invalid credentials" }
      var msg = data.message || null;
      showError(msg || null);
    }

  } catch (err) {
    /* Network / server unreachable */
    showError(lang === 'fr'
      ? 'Impossible de joindre le serveur. Vérifiez votre connexion.'
      : 'Cannot reach the server. Please check your connection.');
  }

  /* Restore button */
  loginBtn.disabled = false;
  loginBtnLabel.textContent = lang === 'fr' ? 'Se Connecter' : 'Sign In';
});


/* =============================================
   REMEMBER ME — pre-fill email on page load
============================================= */
(function() {
  var saved = localStorage.getItem('emi_remember_email');
  if (saved) {
    document.getElementById('email').value         = saved;
    document.getElementById('remember-me').checked = true;
  }
})();


/* =============================================
   CLEAR ERRORS on input
============================================= */
document.getElementById('email').addEventListener('input',    clearError);
document.getElementById('password').addEventListener('input', clearError);


/*
  =============================================
  BACKEND INTEGRATION SUMMARY — login-script.js
  =============================================

  ✅ CONNECTED:
    POST /api/auth/login
    Body:    { email, password }
    Returns: { token, user: { id, first_name, last_name, email } }

  📦 STORED IN localStorage:
    'emi_token'      → JWT used by all dashboard fetch calls
    'emi_admin_user' → { id, name, initials, email, photo_url }
                       name     = first_name + " " + last_name
                       initials = first letter of each

  🔒 SECURITY NOTE:
    The auto-redirect at the top only checks if
    the token EXISTS, not if it's still valid.
    To validate properly, create GET /auth/me:
      Returns user info if token is valid (200)
      Returns 401 if token expired/invalid

  =============================================
*/