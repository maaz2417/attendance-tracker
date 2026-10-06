const database = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_PUBLISHABLE_KEY);
let currentUser;
let teachers = [];
let tasks = [];
let attendance = [];

const teacherGrid = document.querySelector('#teacher-grid');
const taskList = document.querySelector('#task-list');
const toast = document.querySelector('#toast');

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function initials(name) {
  return name.split(' ').filter(word => word.length > 2).slice(0, 2).map(word => word[0]).join('');
}

function latestAttendanceFor(teacherId) {
  return attendance
    .filter(item => item.teacher_id === teacherId)
    .sort((first, second) => new Date(second.created_at) - new Date(first.created_at))[0];
}

function renderTeachers() {
  teacherGrid.innerHTML = teachers.map(teacher => {
    const classesDone = attendance.filter(item => item.teacher_id === teacher.id).length;
    const absences = attendance.filter(item => item.teacher_id === teacher.id && item.status === 'absent').length;
    const classesLeft = Math.max((teacher.semester_classes || 0) - classesDone, 0);
    const latestAttendance = latestAttendanceFor(teacher.id);
    const undoButton = latestAttendance ? `<button class="undo-attendance" data-undo-attendance="${latestAttendance.id}" data-teacher="${teacher.id}" type="button">Undo last mark</button>` : '';
    return `<article class="teacher-card"><div class="teacher-top"><div><span class="eyebrow">Teacher</span><h4>${escapeHtml(teacher.name)}</h4><p class="teacher-subject"><span>Subject</span>${escapeHtml(teacher.subject)}</p></div><span class="teacher-initial">${escapeHtml(initials(teacher.name))}</span></div><div class="teacher-stats"><div><strong>${teacher.semester_classes ?? '—'}</strong><span>Total classes</span></div><div><strong>${classesDone}</strong><span>Recorded</span></div><div><strong>${classesLeft}</strong><span>Remaining</span></div><div class="absence-stat"><strong>${absences}</strong><span>Absent</span></div></div><p class="teacher-room">⌖ ${escapeHtml(teacher.room)}</p><div class="teacher-actions"><span class="action-label">Mark today’s class</span><div class="action-buttons"><button class="attendance-button present" data-attendance="present" data-teacher="${teacher.id}" type="button">✓ Present</button><button class="attendance-button absent" data-attendance="absent" data-teacher="${teacher.id}" type="button">× Absent</button><button class="open-button" data-open-teacher="${teacher.id}" type="button">View details</button></div>${undoButton}</div><button class="remove-teacher" data-remove-teacher="${teacher.id}" type="button">Remove teacher</button></article>`;
  }).join('');
  document.querySelector('#teacher-count').textContent = `${teachers.length} teachers`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(`${date}T12:00:00`));
}

function renderTasks() {
  const visibleTasks = tasks.filter(task => !task.done).slice(0, 4);
  taskList.innerHTML = visibleTasks.length
    ? visibleTasks.map(task => `<div class="task-row"><input class="task-check" type="checkbox" data-task="${task.id}" ${task.done ? 'checked' : ''} /><span><p class="task-title ${task.done ? 'done' : ''}">${escapeHtml(task.title)}</p><p class="task-meta"><strong>${escapeHtml(task.teacher)}</strong><span>${escapeHtml(task.subject)}</span></p></span><span class="task-due">Due ${formatDate(task.due)}</span><button class="delete-task" type="button" data-delete-task="${task.id}" aria-label="Delete ${escapeHtml(task.title)}" title="Delete assignment">🗑</button></div>`).join('')
    : '<div class="empty-state"><strong>Your desk is clear.</strong><span>Open assignments to add a new deadline.</span></div>';
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
  }));
  tasks = (taskRows || []).map(task => ({ ...task, done: task.completed, teacher: task.teachers?.name || 'Unassigned', subject: task.teachers?.subject || '' }));
  renderTeachers();
  renderTasks();
}

async function setAttendance(teacher, status) {
  const { data: attendanceRecord, error } = await database.from('attendance').insert({ user_id: currentUser.id, teacher_id: teacher.id, class_date: today(), status }).select().single();
  if (error) return showToast(error.message);
  attendance.push(attendanceRecord);
  renderTeachers();
  showToast(`${teacher.name}: marked ${status}.`);
}

async function undoAttendance(teacher, attendanceId) {
  const attendanceRecord = attendance.find(item => item.id === attendanceId && item.teacher_id === teacher.id);
  if (!attendanceRecord) return;
  const { error } = await database.from('attendance').delete().eq('id', attendanceId);
  if (error) return showToast(error.message);
  attendance = attendance.filter(item => item.id !== attendanceId);
  renderTeachers();
  showToast(`${teacher.name}: last mark undone.`);
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
  const undoButton = event.target.closest('[data-undo-attendance]');
  if (undoButton) {
    const teacher = teachers.find(item => item.id === undoButton.dataset.teacher);
    if (teacher) undoAttendance(teacher, undoButton.dataset.undoAttendance);
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

taskList.addEventListener('click', async event => {
  const deleteButton = event.target.closest('[data-delete-task]');
  if (!deleteButton) return;
  const task = tasks.find(item => item.id === deleteButton.dataset.deleteTask);
  if (!task) return;
  const { error } = await database.from('tasks').delete().eq('id', task.id);
  if (error) return showToast(error.message);
  tasks = tasks.filter(item => item.id !== task.id);
  renderTasks();
  showToast('Assignment removed.');
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
  const { error } = await database.from('teachers').insert({ user_id: currentUser.id, name: data.get('name'), subject: data.get('subject'), room: data.get('room') || 'Room to be added', semester_classes: Number(data.get('semester_classes')), weekly_classes: 1 });
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
    document.querySelector('#greeting').textContent = `Yo, ${displayName} — time to lock in.`;
    await loadData();
  } catch (error) {
    showToast(`Database setup is incomplete: ${error.message}`);
  }
}

document.querySelector('#logout-button').addEventListener('click', async () => {
  await database.auth.signOut();
  window.location.replace('index.html');
});

database.auth.getSession().then(({ data }) => loadAuthenticatedApp(data.session));
