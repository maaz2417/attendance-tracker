const SEMESTER_WEEKS = 16;
const CURRENT_WEEK = 4;
const database = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_PUBLISHABLE_KEY);
let currentUser;
let teachers = [];
let tasks = [];
let attendance = [];
let authMode = 'signin';

const teacherGrid = document.querySelector('#teacher-grid');
const taskList = document.querySelector('#task-list');
const toast = document.querySelector('#toast');
const authScreen = document.querySelector('#auth-screen');
const appShell = document.querySelector('.app-shell');
const authForm = document.querySelector('#auth-form');
const authMessage = document.querySelector('#auth-message');
const authTitle = document.querySelector('#auth-title');
const authIntro = document.querySelector('#auth-intro');
const authSubmit = document.querySelector('#auth-submit');
const authToggle = document.querySelector('#auth-toggle');

if (window.location.search) window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);

function isConfigured() {
  return !window.SUPABASE_URL.includes('YOUR-PROJECT') && !window.SUPABASE_PUBLISHABLE_KEY.includes('YOUR-PUBLISHABLE');
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function initials(name) {
  return name.split(' ').filter(word => word.length > 2).slice(0, 2).map(word => word[0]).join('');
}

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

function showApp() {
  authScreen.hidden = true;
  appShell.classList.add('ready');
}

function showAuth() {
  authScreen.hidden = false;
  appShell.classList.remove('ready');
}

function classProgress(teacher) {
  const total = teacher.weeklyClasses * SEMESTER_WEEKS;
  const done = teacher.weeklyClasses * CURRENT_WEEK;
  return { total, done, left: total - done, absent: teacher.absent };
}

function renderTeachers() {
  teacherGrid.innerHTML = teachers.map(teacher => {
    const progress = classProgress(teacher);
    return `<article class="teacher-card"><div class="teacher-top"><div><h4>${escapeHtml(teacher.name)}</h4><p class="teacher-subject">${escapeHtml(teacher.subject)}</p></div><span class="teacher-initial">${escapeHtml(initials(teacher.name))}</span></div><p class="teacher-room">⌖ ${escapeHtml(teacher.room)}</p><div class="class-counter" aria-label="Class progress"><div><strong>${progress.done}</strong><span>done</span></div><div><strong>${progress.left}</strong><span>left</span></div><div><strong>${progress.absent}</strong><span>absent</span></div></div><p class="semester-total">${progress.total} total classes · ${teacher.weeklyClasses} per week · week ${CURRENT_WEEK} of ${SEMESTER_WEEKS}</p><div class="teacher-actions"><button class="attendance-button present ${teacher.attendance === 'present' ? 'selected' : ''}" data-attendance="present" data-teacher="${teacher.id}" type="button">✓ Present</button><button class="attendance-button absent ${teacher.attendance === 'absent' ? 'selected' : ''}" data-attendance="absent" data-teacher="${teacher.id}" type="button">× Absent</button><button class="open-button" data-open-teacher="${teacher.id}" type="button">Open teacher</button></div><button class="remove-teacher" data-remove-teacher="${teacher.id}" type="button">Remove teacher</button></article>`;
  }).join('');
  document.querySelector('#teacher-count').textContent = `${teachers.length} teachers`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(`${date}T12:00:00`));
}

function renderTasks() {
  taskList.innerHTML = tasks.map(task => `<label class="task-row"><input class="task-check" type="checkbox" data-task="${task.id}" ${task.done ? 'checked' : ''} /><span><p class="task-title ${task.done ? 'done' : ''}">${escapeHtml(task.title)}</p><p class="task-meta"><strong>${escapeHtml(task.teacher)}</strong><span>${escapeHtml(task.subject)}</span></p></span><span class="task-due">Due ${formatDate(task.due)}</span></label>`).join('');
  document.querySelector('#task-count').textContent = `${tasks.filter(task => !task.done).length} remaining`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2400);
}

function openModal(id) {
  document.querySelector(id).hidden = false;
  document.querySelector(`${id} input`)?.focus();
}

function closeModals() {
  document.querySelectorAll('.modal-backdrop').forEach(modal => { modal.hidden = true; });
}

function openTeacherDetail(teacher) {
  if (!teacher) return;
  document.querySelector('#detail-name').textContent = teacher.name;
  document.querySelector('#detail-name').dataset.teacher = teacher.id;
  document.querySelector('#detail-subject').textContent = teacher.subject;
  document.querySelector('#detail-room').textContent = `⌖ ${teacher.room}`;
  document.querySelector('#detail-present').classList.toggle('selected', teacher.attendance === 'present');
  document.querySelector('#detail-absent').classList.toggle('selected', teacher.attendance === 'absent');
  document.querySelector('#teacher-detail-modal').hidden = false;
}

async function loadData() {
  const [{ data: teacherRows, error: teacherError }, { data: taskRows, error: taskError }, { data: attendanceRows, error: attendanceError }] = await Promise.all([
    database.from('teachers').select('*').order('created_at'),
    database.from('tasks').select('*, teachers(name, subject)').order('due'),
    database.from('attendance').select('*'),
  ]);
  if (teacherError || taskError || attendanceError) throw teacherError || taskError || attendanceError;
  attendance = attendanceRows || [];
  teachers = (teacherRows || []).map(teacher => ({
    ...teacher,
    weeklyClasses: teacher.weekly_classes,
    absent: attendance.filter(item => item.teacher_id === teacher.id && item.status === 'absent').length,
    attendance: attendance.find(item => item.teacher_id === teacher.id && item.class_date === today())?.status || null,
  }));
  tasks = (taskRows || []).map(task => ({ ...task, done: task.completed, teacher: task.teachers?.name || 'Unassigned', subject: task.teachers?.subject || '' }));
  renderTeachers();
  renderTasks();
}

async function setAttendance(teacher, status) {
  const previous = teacher.attendance;
  if (previous === status) return;
  const { error } = await database.from('attendance').upsert({ user_id: currentUser.id, teacher_id: teacher.id, class_date: today(), status }, { onConflict: 'teacher_id,class_date' });
  if (error) return showToast(error.message);
  teacher.attendance = status;
  if (previous === 'absent') teacher.absent -= 1;
  if (status === 'absent') teacher.absent += 1;
  renderTeachers();
  showToast(`${teacher.name}: marked ${status}.`);
}

async function removeTeacher(teacher) {
  if (!teacher || !window.confirm(`Remove ${teacher.name} from your teacher list?`)) return;
  const { error } = await database.from('teachers').delete().eq('id', teacher.id);
  if (error) return showToast(error.message);
  teachers = teachers.filter(item => item.id !== teacher.id);
  renderTeachers();
  showToast(`${teacher.name} was removed.`);
}

teacherGrid.addEventListener('click', event => {
  const attendanceButton = event.target.closest('[data-attendance]');
  if (attendanceButton) {
    const teacher = teachers.find(item => item.id === attendanceButton.dataset.teacher);
    if (teacher) setAttendance(teacher, attendanceButton.dataset.attendance);
  }
  const openButton = event.target.closest('[data-open-teacher]');
  if (openButton) openTeacherDetail(teachers.find(item => item.id === openButton.dataset.openTeacher));
  const removeButton = event.target.closest('[data-remove-teacher]');
  if (removeButton) removeTeacher(teachers.find(item => item.id === removeButton.dataset.removeTeacher));
});

document.querySelectorAll('#detail-present, #detail-absent').forEach(button => button.addEventListener('click', event => {
  const teacher = teachers.find(item => item.id === document.querySelector('#detail-name').dataset.teacher);
  if (teacher) setAttendance(teacher, event.currentTarget.id === 'detail-present' ? 'present' : 'absent');
}));

document.querySelector('#detail-add-task').addEventListener('click', () => { closeModals(); document.querySelector('#add-task-button').click(); });

taskList.addEventListener('change', async event => {
  const task = tasks.find(item => item.id === event.target.dataset.task);
  if (!task) return;
  const completed = event.target.checked;
  const { error } = await database.from('tasks').update({ completed }).eq('id', task.id);
  if (error) return showToast(error.message);
  task.done = completed;
  renderTasks();
  showToast(task.done ? 'Task completed.' : 'Task moved back to upcoming.');
});

document.querySelector('#add-teacher-button').addEventListener('click', () => openModal('#teacher-modal'));
document.querySelector('#add-task-button').addEventListener('click', () => {
  document.querySelector('#task-teacher-select').innerHTML = teachers.map(teacher => `<option value="${teacher.id}">${escapeHtml(teacher.name)} · ${escapeHtml(teacher.subject)}</option>`).join('');
  openModal('#task-modal');
});
document.querySelectorAll('[data-close-modal]').forEach(button => button.addEventListener('click', closeModals));
document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.addEventListener('click', event => { if (event.target === backdrop) closeModals(); }));

document.querySelector('#teacher-form').addEventListener('submit', async event => {
  event.preventDefault();
  const data = new FormData(event.target);
  const { error } = await database.from('teachers').insert({ user_id: currentUser.id, name: data.get('name'), subject: data.get('subject'), room: data.get('room') || 'Room to be added', weekly_classes: 1 });
  if (error) return showToast(error.message);
  await loadData();
  closeModals();
  event.target.reset();
  showToast('Teacher added to your semester.');
});

document.querySelector('#task-form').addEventListener('submit', async event => {
  event.preventDefault();
  const data = new FormData(event.target);
  const { error } = await database.from('tasks').insert({ user_id: currentUser.id, teacher_id: data.get('teacher'), title: data.get('title'), due: data.get('due'), completed: false });
  if (error) return showToast(error.message);
  await loadData();
  closeModals();
  event.target.reset();
  showToast('Assignment added to your list.');
});

authToggle.addEventListener('click', () => { authMode = authMode === 'signin' ? 'signup' : 'signin'; updateAuthMode(); });
authForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (!isConfigured()) return setAuthMessage('Add your Supabase URL and publishable key in supabase-config.js.');
  const data = new FormData(event.target);
  const request = authMode === 'signin'
    ? database.auth.signInWithPassword({ email: data.get('email'), password: data.get('password') })
    : database.auth.signUp({ email: data.get('email'), password: data.get('password') });
  const { data: result, error } = await request;
  if (error) return setAuthMessage(error.message);
  if (authMode === 'signup' && !result.session) return setAuthMessage('Account created. Check your email to confirm your account.', true);
  event.target.reset();
});

document.querySelector('#logout-button').addEventListener('click', () => database.auth.signOut());

database.auth.onAuthStateChange(async (_event, session) => {
  currentUser = session?.user || null;
  if (!currentUser) return showAuth();
  document.querySelector('#greeting').textContent = `Good morning, ${currentUser.email.split('@')[0]}.`;
  showApp();
  try {
    await loadData();
  } catch (error) {
    showAuth();
    setAuthMessage(`Database setup is incomplete: ${error.message}`);
  }
});

updateAuthMode();
