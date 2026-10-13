# Data Model

## Entity relationship overview

```text
User 1---* Semester 1---* Subject *---1 Teacher
                         |
                         +---* Schedule
                         +---* AttendanceRecord
                         +---* Assignment
                         +---* MakeupClass
```

## Entities

### User

| Field | Description |
| --- | --- |
| id | Unique account identifier |
| email | Sign-in identity |
| display_name | Name shown in the application |
| created_at | Creation timestamp |
| username | Unique display username associated with the account profile |

### Semester

| Field | Description |
| --- | --- |
| id | Unique semester identifier |
| user_id | Owning account |
| name | Display name, for example Semester 5 |
| start_date | First date |
| end_date | Last date |
| is_active | Current semester flag |

### Subject

| Field | Description |
| --- | --- |
| id | Unique subject identifier |
| semester_id | Parent semester |
| teacher_id | Associated teacher |
| name | Subject name |
| code | Optional course code |
| credit_hours | Credit-hour value |
| threshold_percent | Warning threshold, default 75 |
| is_archived | Whether it is hidden from active views |

### Teacher

| Field | Description |
| --- | --- |
| id | Unique teacher identifier |
| user_id | Owning account |
| name | Teacher name |
| contact_note | Optional private note |

### Schedule

Stores recurring classes with weekday, start time, end time, room, and subject. A schedule belongs to one subject and one semester.

### AttendanceRecord

Stores one class occurrence with subject, optional schedule, occurrence date, status, and note. The database must enforce uniqueness for a subject and occurrence date/time combination.

### Assignment

Stores subject, title, description, due date, completion status, and timestamps.

### MakeupClass

Stores subject, teacher, date, start time, end time, note, and its attendance-record relationship when attendance is taken.

## Attendance calculation

For each subject:

```text
counted_sessions = Present + Absent + Late
attended_sessions = Present + Late
attendance_percent = attended_sessions / counted_sessions * 100
```

Excused records are displayed separately and excluded from both values by default. A subject with zero counted sessions has no percentage and should display `Not yet available`, not `0%`.

## Data integrity rules

- Every owned record must reference the authenticated user, directly or through its parent.
- A subject must belong to exactly one semester.
- A schedule must reference an active subject.
- Attendance status must be one of `present`, `absent`, `late`, or `excused`.
- Dates and times must be stored in a consistent timezone strategy.
- Deleting a subject must use an explicit archive or cascade policy; it must not silently destroy attendance history.