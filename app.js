const SEMESTER_WEEKS = 16;
const CURRENT_WEEK = 4;
const teachers = [
  { id: 1, name: 'Dr. Nadia Iftikhar', subject: 'Fundamentals of Accounting', room: '1st Floor · Class LR-113', weeklyClasses: 2, absent: 0, attendance: null },
  { id: 2, name: 'Mr. Muhammad Umer Haroon', subject: 'Software Construction & Development · Theory', room: 'Tuesday · Ground Class · 1 class per week', weeklyClasses: 1, absent: 0, attendance: null },
  { id: 10, name: 'Mr. Muhammad Umer Haroon', subject: 'Software Construction & Development · Lab', room: 'Wednesday · Lab SF-02 · 2 labs per week', weeklyClasses: 2, absent: 0, attendance: null },
  { id: 3, name: 'Dr. Sumaira Johar', subject: 'Computer Networks', room: 'Ground · Class LR-005', weeklyClasses: 1, absent: 0, attendance: null },
  { id: 4, name: 'Ms. Alma Irfan', subject: 'Technical & Business Writing', room: 'Ground · Class LR-010', weeklyClasses: 2, absent: 0, attendance: null },
  { id: 5, name: 'Mr. Fahim Muhammad Khan', subject: 'Software Requirements Engineering', room: '2nd Floor · Mobile and Web Lab', weeklyClasses: 2, absent: 0, attendance: null },
  { id: 9, name: 'Hamood Ur Rehman Durrani', subject: 'Software Requirements Engineering', room: 'Ground · Class LR-014', weeklyClasses: 1, absent: 0, attendance: null },
  { id: 6, name: 'Ms. Maimoona Khalil', subject: 'Computer Networks (Lab)', room: 'Basement · Lab B3', weeklyClasses: 1, absent: 0, attendance: null },
  { id: 7, name: 'Mr. Saim Sanan', subject: 'Parallel and Distributed Computing', room: '2nd Floor · Network and Cyber Security Lab', weeklyClasses: 2, absent: 0, attendance: null },
  { id: 8, name: 'Dr. Muhammad Asim', subject: 'Parallel and Distributed Computing', room: '1st Floor · Class LR-114', weeklyClasses: 1, absent: 0, attendance: null },
];
const tasks = [
  { id: 1, title: 'Finish requirements engineering lab', teacher: 'Mr. Fahim Muhammad Khan', subject: 'Software Requirements Engineering', due: '2026-10-02', done: false },
  { id: 2, title: 'Review accounting chapter 04', teacher: 'Dr. Nadia Iftikhar', subject: 'Fundamentals of Accounting', due: '2026-10-04', done: false },
  { id: 3, title: 'Prepare network topologies notes', teacher: 'Dr. Sumaira Johar', subject: 'Computer Networks', due: '2026-10-07', done: false },
  { id: 4, title: 'Complete distributed systems lab', teacher: 'Mr. Saim Sanan', subject: 'Parallel and Distributed Computing', due: '2026-10-09', done: false },
];
const teacherGrid = document.querySelector('#teacher-grid');
const taskList = document.querySelector('#task-list');
const toast = document.querySelector('#toast');
function initials(name) { return name.split(' ').filter(word => word.length > 2).slice(0, 2).map(word => word[0]).join(''); }
function classProgress(teacher) {
  const total = teacher.weeklyClasses * SEMESTER_WEEKS;
  const done = teacher.weeklyClasses * CURRENT_WEEK;
  return { total, done, left: total - done, absent: teacher.absent };
}
function setAttendance(teacher, status) {
  if (teacher.attendance === status) return;
  if (teacher.attendance === 'absent') teacher.absent -= 1;
  if (status === 'absent') teacher.absent += 1;
  teacher.attendance = status;
}
function renderTeachers() {
  teacherGrid.innerHTML = teachers.map(teacher => { const progress = classProgress(teacher); return `<article class="teacher-card"><div class="teacher-top"><div><h4>${teacher.name}</h4><p class="teacher-subject">${teacher.subject}</p></div><span class="teacher-initial">${initials(teacher.name)}</span></div><p class="teacher-room">⌖ ${teacher.room}</p><div class="class-counter" aria-label="Class progress"><div><strong>${progress.done}</strong><span>done</span></div><div><strong>${progress.left}</strong><span>left</span></div><div><strong>${progress.absent}</strong><span>absent</span></div></div><p class="semester-total">${progress.total} total classes · ${teacher.weeklyClasses} per week · week ${CURRENT_WEEK} of ${SEMESTER_WEEKS}</p><div class="teacher-actions"><button class="attendance-button present ${teacher.attendance === 'present' ? 'selected' : ''}" data-attendance="present" data-teacher="${teacher.id}" type="button">✓ Present</button><button class="attendance-button absent ${teacher.attendance === 'absent' ? 'selected' : ''}" data-attendance="absent" data-teacher="${teacher.id}" type="button">× Absent</button><button class="open-button" data-open-teacher="${teacher.id}" type="button">Open teacher</button></div></article>`; }).join('');
  document.querySelector('#teacher-count').textContent = `${teachers.length} teachers`;
}
function formatDate(date) { return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(`${date}T12:00:00`)); }
function renderTasks() {
  taskList.innerHTML = tasks.map(task => `<label class="task-row"><input class="task-check" type="checkbox" data-task="${task.id}" ${task.done ? 'checked' : ''} /><span><p class="task-title ${task.done ? 'done' : ''}">${task.title}</p><p class="task-meta"><strong>${task.teacher}</strong><span>${task.subject}</span></p></span><span class="task-due">Due ${formatDate(task.due)}</span></label>`).join('');
  document.querySelector('#task-count').textContent = `${tasks.filter(task => !task.done).length} remaining`;
}
function showToast(message) { toast.textContent = message; toast.classList.add('show'); window.setTimeout(() => toast.classList.remove('show'), 2400); }
function openModal(id) { document.querySelector(id).hidden = false; document.querySelector(`${id} input`).focus(); }
function closeModals() { document.querySelectorAll('.modal-backdrop').forEach(modal => { modal.hidden = true; }); }
function openTeacherDetail(teacher) {
  document.querySelector('#detail-name').textContent = teacher.name;
  document.querySelector('#detail-subject').textContent = teacher.subject;
  document.querySelector('#detail-room').textContent = `⌖ ${teacher.room}`;
  document.querySelector('#detail-present').classList.toggle('selected', teacher.attendance === 'present');
  document.querySelector('#detail-absent').classList.toggle('selected', teacher.attendance === 'absent');
  document.querySelector('#teacher-detail-modal').hidden = false;
}
teacherGrid.addEventListener('click', event => {
  const attendanceButton = event.target.closest('[data-attendance]');
  if (attendanceButton) { const teacher = teachers.find(item => item.id === Number(attendanceButton.dataset.teacher)); setAttendance(teacher, attendanceButton.dataset.attendance); renderTeachers(); showToast(`${teacher.name}: marked ${teacher.attendance}.`); }
  const openButton = event.target.closest('[data-open-teacher]');
  if (openButton) openTeacherDetail(teachers.find(item => item.id === Number(openButton.dataset.openTeacher)));
});
document.querySelectorAll('#detail-present, #detail-absent').forEach(button => button.addEventListener('click', event => {
  const teacher = teachers.find(item => item.name === document.querySelector('#detail-name').textContent);
  setAttendance(teacher, event.currentTarget.id === 'detail-present' ? 'present' : 'absent');
  renderTeachers(); openTeacherDetail(teacher); showToast(`${teacher.name}: marked ${teacher.attendance}.`);
}));
document.querySelector('#detail-add-task').addEventListener('click', () => { closeModals(); document.querySelector('#add-task-button').click(); });
taskList.addEventListener('change', event => { const task = tasks.find(item => item.id === Number(event.target.dataset.task)); if (!task) return; task.done = event.target.checked; renderTasks(); showToast(task.done ? 'Task completed.' : 'Task moved back to upcoming.'); });
document.querySelector('#add-teacher-button').addEventListener('click', () => openModal('#teacher-modal'));
document.querySelector('#add-task-button').addEventListener('click', () => { document.querySelector('#task-teacher-select').innerHTML = teachers.map(teacher => `<option>${teacher.name}</option>`).join(''); openModal('#task-modal'); });
document.querySelectorAll('[data-close-modal]').forEach(button => button.addEventListener('click', closeModals));
document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.addEventListener('click', event => { if (event.target === backdrop) closeModals(); }));
document.querySelector('#teacher-form').addEventListener('submit', event => { event.preventDefault(); const data = new FormData(event.target); teachers.push({ id: Date.now(), name: data.get('name'), subject: data.get('subject'), room: data.get('room') || 'Room to be added', weeklyClasses: 1, absent: 0, attendance: null }); renderTeachers(); closeModals(); event.target.reset(); showToast('Teacher added to your semester.'); });
document.querySelector('#task-form').addEventListener('submit', event => { event.preventDefault(); const data = new FormData(event.target); const teacher = teachers.find(item => item.name === data.get('teacher')); tasks.push({ id: Date.now(), title: data.get('title'), teacher: teacher.name, subject: teacher.subject, due: data.get('due'), done: false }); renderTasks(); closeModals(); event.target.reset(); showToast('Assignment added to your list.'); });
renderTeachers();
renderTasks();
