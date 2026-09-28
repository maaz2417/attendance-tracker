# Software Requirements Specification

## 1. System context

Attendance Tracker is an online web application. A student uses a browser to manage their academic attendance data through an authenticated account. The system stores data in a hosted database and exposes business operations through a backend API.

## 2. Functional requirements

### FR-01 Authentication

The system shall allow a student to create an account, sign in, sign out, and reset access through the configured authentication provider. Unauthenticated users shall not access private academic data.

### FR-02 Semester and subject management

The system shall allow the student to create, edit, archive, and view semesters and subjects. A subject shall include a name, code, teacher, credit hours, attendance threshold, and active status.

### FR-03 Teacher management

The system shall allow the student to create and edit teacher records and associate a teacher with one or more subjects.

### FR-04 Schedule management

The system shall allow the student to define recurring class schedules by weekday and time. It shall show the classes scheduled for the current date.

### FR-05 Attendance recording

The system shall allow the student to record one attendance outcome per scheduled class occurrence. Supported outcomes shall be Present, Absent, Late, and Excused.

### FR-06 Attendance correction

The system shall allow the student to edit or remove an attendance record while preserving the correct final history and totals.

### FR-07 Attendance summaries

The system shall show attended sessions, total counted sessions, absences, percentage, and threshold status for each subject. It shall also show an overall summary.

### FR-08 Assignments

The system shall allow the student to create, edit, complete, and delete assignments linked to a subject. An assignment shall support a title, description, due date, and completion status.

### FR-09 Makeup classes

The system shall allow the student to record a makeup class with a subject, teacher, date, time, and optional note. Makeup classes shall appear in the relevant schedule and attendance workflow.

### FR-10 Warnings and feedback

The system shall visibly identify subjects below their configured threshold. Attendance actions may show brief, dismissible feedback without blocking the main workflow.

### FR-11 Data ownership

The system shall scope every student-owned record to its account. One student shall not be able to read or modify another student's data.

## 3. Non-functional requirements

- **Usability:** The primary attendance workflow shall be usable with one hand on a phone.
- **Responsive design:** The interface shall support common mobile and desktop viewport sizes without horizontal scrolling.
- **Performance:** Dashboard and attendance views should become interactive within two seconds on a normal broadband connection.
- **Availability:** Stored records shall persist online and survive browser refreshes and device changes.
- **Security:** Authentication, authorization, input validation, and secure transport shall be used for private data.
- **Accessibility:** Controls shall have readable labels, keyboard access, visible focus states, and sufficient color contrast.
- **Portability:** The backend API shall not depend on web-only UI assumptions so that Flutter can consume it later.
- **Maintainability:** Attendance calculations shall be isolated in tested business logic.

## 4. Business rules

- Attendance percentage is `counted attended sessions / counted sessions * 100`.
- Present counts as attended.
- Late counts as attended by default.
- Absent counts as a counted absence.
- Excused is displayed separately and does not count as attended or absent by default.
- A subject is at risk when its percentage is below its configured threshold.
- A class occurrence is identified by its subject and date/time; duplicate final records are not allowed.

## 5. Assumptions and open decisions

- The initial user is a student, not a university administrator.
- One account may contain multiple semesters, but only one semester is active at a time.
- The database and authentication provider are still to be selected.
- Whether excused sessions should be excluded from the denominator can be made configurable before implementation.