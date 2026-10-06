const database = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_PUBLISHABLE_KEY);
let currentUser;
let teachers = [];
let tasks = [];

const taskList = document.querySelector('#task-list');
const toast = document.querySelector('#toast');

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(`${date}T12:00:00`));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2400);
}

function renderTasks() {
  const upcoming = tasks.filter(task => !task.done);
  taskList.innerHTML = tasks.length
    ? tasks.map(task => `<div class="task-row"><input class="task-check" type="checkbox" data-task="${task.id}" ${task.done ? 'checked' : ''} /><span><p class="task-title ${task.done ? 'done' : ''}">${escapeHtml(task.title)}</p><p class="task-meta"><strong>${escapeHtml(task.teacher)}</strong><span>${escapeHtml(task.subject)}</span></p></span><span class="task-due">Due ${formatDate(task.due)}</span><button class="delete-task" type="button" data-delete-task="${task.id}" aria-label="Delete ${escapeHtml(task.title)}" title="Delete assignment">🗑</button></div>`).join('')
    : '<div class="empty-state"><strong>No assignments yet.</strong><span>Add your first deadline and keep it in view here.</span></div>';
  document.querySelector('#task-count').textContent = `${tasks.length} assignment${tasks.length === 1 ? '' : 's'}`;
  document.querySelector('#upcoming-count').textContent = upcoming.length;
  document.querySelector('#completed-count').textContent = tasks.length - upcoming.length;
  const weekFrom = new Date();
  const weekTo = new Date();
  weekTo.setDate(weekTo.getDate() + 7);
  document.querySelector('#week-count').textContent = upcoming.filter(task => {
    const due = new Date(`${task.due}T12:00:00`);
    return due >= new Date(weekFrom.toDateString()) && due <= weekTo;
  }).length;
}

async function loadData() {
  const [{ data: teacherRows, error: teacherError }, { data: taskRows, error: taskError }] = await Promise.all([
    database.from('teachers').select('*').order('created_at'),
    database.from('tasks').select('*, teachers(name, subject)').order('due'),
  ]);
  if (teacherError || taskError) throw teacherError || taskError;
  teachers = teacherRows || [];
  tasks = (taskRows || []).map(task => ({ ...task, done: task.completed, teacher: task.teachers?.name || 'Unassigned', subject: task.teachers?.subject || '' }));
  renderTasks();
}

function openModal() {
  document.querySelector('#task-teacher-select').innerHTML = teachers.map(teacher => `<option value="${teacher.id}">${escapeHtml(teacher.name)} · ${escapeHtml(teacher.subject)}</option>`).join('');
  document.querySelector('#task-modal').hidden = false;
  document.querySelector('#task-modal input').focus();
}

function closeModal() {
  document.querySelector('#task-modal').hidden = true;
}

document.querySelector('#add-task-button').addEventListener('click', openModal);
document.querySelectorAll('[data-close-modal]').forEach(button => button.addEventListener('click', closeModal));
document.querySelector('#task-modal').addEventListener('click', event => { if (event.target.id === 'task-modal') closeModal(); });

taskList.addEventListener('change', async event => {
  const task = tasks.find(item => item.id === event.target.dataset.task);
  if (!task) return;
  const { error } = await database.from('tasks').update({ completed: event.target.checked }).eq('id', task.id);
  if (error) return showToast(error.message);
  task.done = event.target.checked;
  renderTasks();
  showToast(task.done ? 'Assignment completed.' : 'Assignment moved back to upcoming.');
});

taskList.addEventListener('click', async event => {
  const button = event.target.closest('[data-delete-task]');
  if (!button) return;
  const task = tasks.find(item => item.id === button.dataset.deleteTask);
  if (!task) return;
  const { error } = await database.from('tasks').delete().eq('id', task.id);
  if (error) return showToast(error.message);
  tasks = tasks.filter(item => item.id !== task.id);
  renderTasks();
  showToast('Assignment removed.');
});

document.querySelector('#task-form').addEventListener('submit', async event => {
  event.preventDefault();
  const data = new FormData(event.target);
  const { error } = await database.from('tasks').insert({ user_id: currentUser.id, teacher_id: data.get('teacher'), title: data.get('title'), due: data.get('due'), completed: false });
  if (error) return showToast(error.message);
  await loadData();
  closeModal();
  event.target.reset();
  showToast('Assignment added to your list.');
});

document.querySelector('#logout-button').addEventListener('click', async () => {
  await database.auth.signOut();
  window.location.replace('index.html');
});

database.auth.getSession().then(async ({ data }) => {
  currentUser = data.session?.user;
  if (!currentUser) return window.location.replace('index.html');
  try {
    const { data: profile, error } = await database.from('profiles').select('username').eq('id', currentUser.id).maybeSingle();
    if (error) throw error;
    document.querySelector('#greeting').textContent = `${profile?.username || currentUser.email.split('@')[0]}'s assignments.`;
    await loadData();
  } catch (error) {
    showToast(`Database setup is incomplete: ${error.message}`);
  }
});
