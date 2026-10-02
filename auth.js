const database = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_PUBLISHABLE_KEY);
const authForm = document.querySelector('#auth-form');
const authMessage = document.querySelector('#auth-message');
const authTitle = document.querySelector('#auth-title');
const authIntro = document.querySelector('#auth-intro');
const authSubmit = document.querySelector('#auth-submit');
const authToggle = document.querySelector('#auth-toggle');
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
  setAuthMessage('');
}

function isConfigured() {
  return !window.SUPABASE_URL.includes('YOUR-PROJECT') && !window.SUPABASE_PUBLISHABLE_KEY.includes('YOUR-PUBLISHABLE');
}

authToggle.addEventListener('click', () => {
  authMode = authMode === 'signin' ? 'signup' : 'signin';
  updateAuthMode();
});

authForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (!isConfigured()) return setAuthMessage('Add your Supabase URL and publishable key in supabase-config.js.');
  authSubmit.disabled = true;
  authSubmit.textContent = authMode === 'signin' ? 'Signing in...' : 'Creating account...';
  const data = new FormData(event.target);
  const request = authMode === 'signin'
    ? database.auth.signInWithPassword({ email: data.get('email'), password: data.get('password') })
    : database.auth.signUp({ email: data.get('email'), password: data.get('password') });
  const { data: result, error } = await request;
  authSubmit.disabled = false;
  if (error) {
    updateAuthMode();
    return setAuthMessage(error.message);
  }
  if (authMode === 'signup' && !result.session) return setAuthMessage('Account created. Check your email to confirm your account.', true);
  window.location.replace('dashboard.html');
});

database.auth.getSession().then(({ data }) => {
  if (data.session) window.location.replace('dashboard.html');
});

updateAuthMode();
