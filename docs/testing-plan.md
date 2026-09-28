# Testing Plan

## 1. Test objectives

Testing must prove that attendance data is accurate, private, durable, and usable on a phone. Calculation logic should be tested independently from the user interface.

## 2. Test levels

- **Unit tests:** attendance calculations, threshold status, date validation, and input rules.
- **Integration tests:** API authorization, database persistence, duplicate prevention, and related records.
- **End-to-end tests:** sign-in, dashboard, marking attendance, assignments, and makeup classes.
- **Responsive/accessibility checks:** mobile layouts, keyboard navigation, labels, focus, and contrast.

## 3. Initial test cases

| ID | Scenario | Expected result |
| --- | --- | --- |
| T-01 | No attendance records | Percentage displays `Not yet available` |
| T-02 | 4 Present, 1 Absent | Percentage is 80% |
| T-03 | 3 Present, 1 Late | Percentage is 100% by default |
| T-04 | 2 Present, 1 Excused | Percentage is 100%; excused is shown separately |
| T-05 | Subject percentage is 74% with threshold 75% | Subject is marked at risk |
| T-06 | Same class occurrence submitted twice | Request is rejected or safely updates the existing record |
| T-07 | User requests another user's subject | Request is denied |
| T-08 | Attendance saved, browser refreshed | Record and summary remain available |
| T-09 | Assignment linked to a subject | Assignment appears on the subject and assignment views |
| T-10 | Makeup class created for a date | It appears in that date's schedule |
| T-11 | Dashboard opened on a phone viewport | No horizontal overflow; primary actions remain usable |
| T-12 | Signed-out user opens a private route | User is redirected to authentication |

## 4. Test data

Use a dedicated test account and predictable fixtures. Include subjects with zero records, mixed statuses, archived subjects, multiple schedules, assignments with past and future due dates, and makeup classes.

## 5. Release gate

The MVP is ready for release when all critical unit and integration tests pass, the end-to-end attendance workflow passes on a mobile viewport, authorization tests pass, and no known issue can corrupt attendance totals or expose another user's data.