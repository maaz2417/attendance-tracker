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

let currentUser;

const funnyQuotes = [
  'Attendance is temporary. The group project screenshots are forever.',
  'One present mark a day keeps the debar list away.',
  'Your future self says thanks for showing up today.',
  'Showing up is 80% of life. The other 20% is figuring out why you woke up so early.',
  'Sleep is good, but 75% attendance is legendary.',
  'Bunk responsibly: calculate twice, cut once.',
  'You came, you saw, you got marked present.',
  'Degrees don’t come from proxies, but they sure help on rainy mornings.'
];

function initQuotes() {
  const quoteText = document.querySelector('#quote-text');
  const refreshButton = document.querySelector('#refresh-quote');
  if (!quoteText) return;

  let currentIndex = Math.floor(Math.random() * funnyQuotes.length);
  quoteText.textContent = funnyQuotes[currentIndex];

  if (refreshButton) {
    refreshButton.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % funnyQuotes.length;
      quoteText.textContent = funnyQuotes[currentIndex];
    });
  }
}

async function loadAuthenticatedApp(session) {
  currentUser = session?.user || null;
  if (!currentUser) return window.location.replace('index.html');
  try {
    const { data: profile, error: profileError } = await database
      .from('profiles')
      .select('username')
      .eq('id', currentUser.id)
      .maybeSingle();
    if (profileError) throw profileError;

    const displayName = profile?.username || currentUser.email.split('@')[0];
    const greetingEl = document.querySelector('#greeting');
    if (greetingEl) {
      greetingEl.textContent = `Yo, ${displayName} — time to lock in.`;
    }

    const avatarInitial = displayName ? displayName.trim()[0].toUpperCase() : 'U';
    if (profileMenuButton) profileMenuButton.textContent = avatarInitial;

    // Load lightweight overview stats
    const [{ data: teachers, error: tErr }, { data: attendance, error: aErr }, { data: tasks, error: taskErr }] = await Promise.all([
      database.from('teachers').select('id, semester_classes'),
      database.from('attendance').select('id, teacher_id, status'),
      database.from('tasks').select('id, completed, due')
    ]);

    if (!tErr && teachers) {
      const teacherCountEl = document.querySelector('#stat-teachers');
      if (teacherCountEl) teacherCountEl.textContent = teachers.length;

      const totalRecorded = attendance ? attendance.length : 0;
      const totalPresent = attendance ? attendance.filter(a => a.status === 'present').length : 0;
      const attRateEl = document.querySelector('#stat-attendance-rate');
      if (attRateEl) {
        attRateEl.textContent = totalRecorded > 0 ? `${Math.round((totalPresent / totalRecorded) * 100)}%` : '100%';
      }
    }

    if (!taskErr && tasks) {
      const pendingTasks = tasks.filter(t => !t.completed).length;
      const taskCountEl = document.querySelector('#stat-pending-tasks');
      if (taskCountEl) taskCountEl.textContent = pendingTasks;
    }
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}

const profileMenuButton = document.querySelector('#profile-menu-button');
const profileMenu = document.querySelector('#profile-menu');
const themeToggle = document.querySelector('#theme-toggle');
const darkModeStorageKey = 'bunkbalance-dark-mode';

function setDarkMode(enabled) {
  document.body.classList.toggle('dark-mode', enabled);
  if (themeToggle) {
    themeToggle.textContent = enabled ? 'Turn off dark mode' : 'Turn on dark mode';
    themeToggle.setAttribute('aria-pressed', String(enabled));
  }
}

setDarkMode(localStorage.getItem(darkModeStorageKey) === 'true');

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const enabled = !document.body.classList.contains('dark-mode');
    localStorage.setItem(darkModeStorageKey, String(enabled));
    setDarkMode(enabled);
  });
}

function closeProfileMenu() {
  if (!profileMenu) return;
  profileMenu.hidden = true;
  if (profileMenuButton) profileMenuButton.setAttribute('aria-expanded', 'false');
}

if (profileMenuButton) {
  profileMenuButton.addEventListener('click', () => {
    profileMenu.hidden = !profileMenu.hidden;
    profileMenuButton.setAttribute('aria-expanded', String(!profileMenu.hidden));
  });
}

document.addEventListener('click', event => {
  if (!event.target.closest('.profile-menu')) closeProfileMenu();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeProfileMenu();
});

const logoutButton = document.querySelector('#logout-button');
if (logoutButton) {
  logoutButton.addEventListener('click', async () => {
    if (database) await database.auth.signOut();
    window.location.replace('index.html');
  });
}

initQuotes();

if (!database) {
  window.location.replace('index.html');
} else {
  database.auth.getSession().then(({ data }) => loadAuthenticatedApp(data?.session));
}
