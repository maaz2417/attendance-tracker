# Use Cases

## Actors

- **Student:** Authenticated owner of attendance, schedule, and assignment data.
- **Authentication service:** Confirms identity and manages sessions.
- **Application database:** Stores and retrieves the student's records.

## UC-01: Sign in

**Precondition:** The student has an account.

**Main flow:**

1. The student enters credentials.
2. The authentication service validates them.
3. The application opens the student's active-semester dashboard.

**Failure:** Invalid credentials produce a clear error without revealing whether a different account exists.

## UC-02: Configure a subject

**Precondition:** The student is signed in.

**Main flow:**

1. The student opens Subjects and selects Add subject.
2. The student enters the subject, teacher, credit hours, threshold, and schedule.
3. The application validates required fields.
4. The application saves the subject and displays it in the active semester.

## UC-03: Mark today's attendance

**Precondition:** The student has a class scheduled for today.

**Main flow:**

1. The student opens the dashboard.
2. The application lists today's classes in time order.
3. The student selects Present, Absent, Late, or Excused.
4. The application saves the result and refreshes the subject summary.

**Alternative:** The student can edit an existing result if it was recorded incorrectly.

## UC-04: Review attendance risk

1. The student opens a subject or the dashboard.
2. The application displays percentage, attended sessions, absences, and threshold.
3. The application marks the subject as on track or at risk.

## UC-05: Manage an assignment

1. The student opens Assignments.
2. The student creates an assignment and selects a subject.
3. The application stores its title, due date, notes, and status.
4. The student later marks it complete or edits it.

## UC-06: Add a makeup class

1. The student opens the schedule or subject page.
2. The student adds a date, time, subject, teacher, and optional note.
3. The application shows the makeup class in the relevant date view.
4. The student records attendance using the normal attendance workflow.

## UC-07: Sign out

The student selects Sign out. The application ends the session and returns to the public sign-in screen.

## Acceptance checklist

- A signed-out user cannot open private dashboard data.
- A class cannot receive two final attendance records for the same occurrence.
- Saving attendance updates the visible percentage immediately or after a clear reload state.
- Assignment and makeup-class records remain linked to the correct subject.