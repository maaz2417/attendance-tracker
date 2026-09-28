# Project Proposal: Attendance Tracker

## 1. Overview

Attendance Tracker is a mobile-first web application that helps a university student record attendance quickly and understand whether each subject is meeting its required attendance threshold.

## 2. Problem statement

Students often track attendance using paper, spreadsheets, or scattered notes. These methods make it difficult to record a class immediately, connect a class to the correct subject and teacher, calculate accurate percentages, and notice a low-attendance risk early.

## 3. Objectives

- Record present, absent, late, and excused outcomes for scheduled classes.
- Calculate subject-level and overall attendance accurately.
- Show the student what classes are scheduled for today.
- Store subjects, teachers, credit hours, assignments, and makeup classes in one online account.
- Provide a fast and usable experience on a phone.
- Keep the backend platform-neutral for a future Flutter client.

## 4. Target user

The first release targets a single university student managing their own Semester 5 data. Multi-student administration and teacher accounts are outside the MVP.

## 5. Scope

### In scope

- Account sign-in and protected user data.
- Semester, subject, teacher, and schedule management.
- Daily attendance marking.
- Attendance history and percentage summaries.
- A configurable warning threshold, defaulting to 75%.
- Assignment records linked to subjects.
- Makeup class records linked to subjects and dates.
- Responsive mobile and desktop layouts.

### Out of scope for the MVP

- Teacher or administrator portals.
- QR-code attendance.
- Automatic university timetable integration.
- Native mobile applications.
- Offline synchronization.
- CSV/PDF export and push notifications.

## 6. Success criteria

- A student can mark a scheduled class in a few seconds from a phone.
- Attendance percentages match the documented calculation rules.
- A student can identify subjects below the threshold from the dashboard.
- Data remains available after closing and reopening the application.
- The core API and data model can be reused by a future Flutter app.

## 7. Delivery approach

1. Define and validate the data model and attendance rules.
2. Build authentication and online persistence.
3. Implement subjects, schedules, and attendance marking.
4. Add dashboard summaries, assignments, and makeup classes.
5. Add validation, automated tests, responsive polish, and deployment.