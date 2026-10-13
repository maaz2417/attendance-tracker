function isConfigured() {
  return typeof window.SUPABASE_URL === 'string' &&
    typeof window.SUPABASE_PUBLISHABLE_KEY === 'string' &&
    window.SUPABASE_URL.startsWith('https://') &&
    !window.SUPABASE_URL.includes('YOUR-PROJECT') &&
    !window.SUPABASE_PUBLISHABLE_KEY.includes('YOUR-PUBLISHABLE');
}

const database = isConfigured() && window.supabase
  ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_PUBLISHABLE_KEY)
  : null;

const authForm = document.querySelector('#auth-form');
const authMessage = document.querySelector('#auth-message');
const authTitle = document.querySelector('#auth-title');
const authIntro = document.querySelector('#auth-intro');
const authSubmit = document.querySelector('#auth-submit');
const authToggle = document.querySelector('#auth-toggle');
const emailField = document.querySelector('#email-field');
const usernameField = document.querySelector('#username-field');
const emailLabel = document.querySelector('#email-label');
let authMode = 'signin';

function setAuthMessage(message, success = false) {
  authMessage.textContent = message;
  authMessage.classList.toggle('success', success);
}

function updateAuthMode() {
  const signingIn = authMode === 'signin';
  authTitle.textContent = signingIn ? 'Welcome back.' : 'Start your semester.';
  authIntro.textContent = signingIn ? 'Sign in to keep your attendance and assignments synced.' : 'Create an account to keep your attendance and assignments synced.';
  authSubmit.textContent = signingIn ? 'Sign in' : 'Create account';
  authToggle.textContent = signingIn ? 'Create an account' : 'I already have an account';
  emailField.hidden = false;
  emailField.querySelector('input').required = true;
  emailLabel.textContent = 'Email';
  usernameField.hidden = signingIn;
  usernameField.querySelector('input').required = !signingIn;
  const emailInput = emailField.querySelector('input');
  emailInput.name = 'email';
  emailInput.type = 'email';
  emailInput.autocomplete = 'email';
  emailInput.placeholder = 'you@example.com';

  if (!isConfigured()) {
    setAuthMessage('Supabase setup required: Copy supabase-config.example.js to supabase-config.js and set your project credentials.');
  } else {
    setAuthMessage('');
  }
}

authToggle.addEventListener('click', () => {
  authMode = authMode === 'signin' ? 'signup' : 'signin';
  updateAuthMode();
});

authForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (!isConfigured() || !database) {
    return setAuthMessage('Supabase setup required: Copy supabase-config.example.js to supabase-config.js and set your project credentials.');
  }
  authSubmit.disabled = true;
  authSubmit.textContent = authMode === 'signin' ? 'Signing in...' : 'Creating account...';
  const data = new FormData(event.target);
  let request;
  if (authMode === 'signin') {
    const email = data.get('email').trim();
    request = database.auth.signInWithPassword({ email, password: data.get('password') });
  } else {
    request = database.auth.signUp({
      email: data.get('email').trim(),
      password: data.get('password'),
      options: { data: { username: data.get('username').trim() } }
    });
  }
  const { data: result, error } = await request;
  authSubmit.disabled = false;
  if (error) {
    updateAuthMode();
    return setAuthMessage(error.message);
  }
  if (authMode === 'signup' && !result.session) return setAuthMessage('Account created. Check your email to confirm your account.', true);
  window.location.replace('dashboard.html');
});

if (database) {
  database.auth.getSession().then(({ data }) => {
    if (data?.session) window.location.replace('dashboard.html');
  });
}

updateAuthMode();
