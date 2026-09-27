const classes = [
  { time: '09:00', end: '10:00', subject: 'Database Systems', teacher: 'Dr. Sara Khan', room: 'Lab 2', type: 'Lecture', status: null },
  { time: '11:30', end: '12:30', subject: 'Software Engineering', teacher: 'Prof. Adeel Ahmed', room: 'Room 304', type: 'Lecture', status: 'present' },
  { time: '14:00', end: '15:00', subject: 'Web Programming', teacher: 'Ms. Hira Raza', room: 'Lab 1', type: 'Practical', status: null }
];
const assignments = [
  { title: 'ER diagram for library system', subject: 'Database Systems', due: 'Due tomorrow · 11:59 PM', completed: false },
  { title: 'Read chapter 04: Testing', subject: 'Software Engineering', due: 'Due Wed · 08:00 AM', completed: true },
  { title: 'Portfolio wireframes', subject: 'Web Programming', due: 'Due Oct 02 · 11:59 PM', completed: false }
];
const subjects = [
  ['Database Systems', 'Dr. Sara Khan', 68, '3 credit hours'], ['Software Engineering', 'Prof. Adeel Ahmed', 87, '3 credit hours'],
  ['Web Programming', 'Ms. Hira Raza', 92, '3 credit hours'], ['Computer Networks', 'Dr. Usman Tariq', 81, '3 credit hours']
];
const jokes = ['Attendance is temporary. The group project screenshots are forever.', 'Your future self says thanks for showing up.', 'One present mark a day keeps the shortage away.', 'You came, you saw, you got marked present.'];
const classList = document.querySelector('#classList');
const assignmentList = document.querySelector('#assignmentList');
const subjectGrid = document.querySelector('#subjectGrid');
const toast = document.querySelector('#toast');

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2600);
}

function renderClasses() {
  classList.innerHTML = classes.map((item, index) => `<article class="class-row ${item.status ? 'completed' : ''}">
    <div class="class-time"><strong>${item.time}</strong>${item.end}</div>
    <div class="class-info"><strong>${item.subject}<span class="class-tag">${item.type}</span></strong><span>${item.teacher} · ${item.room}</span></div>
    <div class="attendance-actions">${item.status ? `<button class="present-button" data-action="undo" data-index="${index}">✓ Present</button>` : `<button class="present-button" data-action="present" data-index="${index}">Present</button><button class="absent-button" data-action="absent" data-index="${index}">Absent</button>`}</div>
  </article>`).join('');
  classList.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
    const item = classes[button.dataset.index];
    item.status = button.dataset.action === 'undo' ? null : button.dataset.action;
    showToast(item.status === 'present' ? `Nice. ${item.subject} marked present.` : item.status === 'absent' ? `Marked absent. Don’t let ${item.subject} become a habit.` : `${item.subject} is ready to update.`);
    renderClasses();
  }));
}

function renderAssignments() {
  assignmentList.innerHTML = assignments.map((item, index) => `<div class="assignment ${item.completed ? 'completed' : ''}" data-index="${index}"><button class="assignment-check" aria-label="Mark ${item.title} complete"></button><div><strong>${item.title}</strong><small><span class="subject-chip">${item.subject}</span> · ${item.due}</small></div></div>`).join('');
  assignmentList.querySelectorAll('.assignment-check').forEach(button => button.addEventListener('click', () => { const item = assignments[button.parentElement.dataset.index]; item.completed = !item.completed; renderAssignments(); showToast(item.completed ? 'Assignment checked off. Tiny victory.' : 'Assignment moved back to your list.'); }));
}

function renderSubjects() {
  subjectGrid.innerHTML = subjects.map(item => `<article class="subject-card"><div class="subject-color"></div><h3>${item[0]}</h3><p>${item[1]}</p><div class="subject-meta"><span class="percentage ${item[2] < 75 ? 'low' : 'good'}">${item[2]}%</span><span class="credits">${item[3]}</span></div><div class="subject-progress ${item[2] < 75 ? 'low-progress' : ''}"><span style="width:${item[2]}%"></span></div></article>`).join('');
}

document.querySelector('#refreshQuote').addEventListener('click', () => { const quote = document.querySelector('#quoteText'); const current = jokes.indexOf(quote.textContent); quote.textContent = jokes[(current + 1) % jokes.length]; });
document.querySelector('#addAssignmentButton').addEventListener('click', () => showToast('Assignment form is ready for the next step.'));
document.querySelector('#addClassButton').addEventListener('click', () => showToast('Makeup class form is ready for the next step.'));
document.querySelector('#weekButton').addEventListener('click', () => showToast('Week view is coming next.'));
document.querySelector('#viewAssignmentsButton').addEventListener('click', () => showToast('You’re looking at all active assignments.'));
document.querySelector('#manageSubjectsButton').addEventListener('click', () => showToast('Subject management is ready for your Semester 5 data.'));
renderClasses(); renderAssignments(); renderSubjects();