# System Design

## 1. Proposed architecture

```text
Browser / Flutter client
          |
          v
   Authentication + API
          |
          v
 Hosted relational database
```

The web interface is the first client. A future Flutter application should use the same authenticated API and domain rules rather than duplicating attendance calculations.

## 2. Application modules

- **Authentication:** account creation, sign-in, sessions, and sign-out.
- **Semester and subjects:** academic grouping and subject metadata.
- **Teachers:** reusable teacher records owned by the student.
- **Schedules:** recurring weekly classes and one-time makeup classes.
- **Attendance:** class occurrences, outcomes, edits, and summaries.
- **Assignments:** subject-linked academic tasks and completion status.
- **Dashboard:** today's classes, risk indicators, and upcoming tasks.

## 3. Request flow: recording attendance

1. The client requests today's scheduled classes.
2. The API verifies the authenticated student.
3. The student submits an attendance outcome.
4. The API validates ownership, date/time, allowed status, and duplicate constraints.
5. The API stores the record in a transaction.
6. The client requests or receives the updated subject summary.

## 4. API boundary

The eventual API should expose resource-oriented operations such as:

- `GET /me`
- `GET /semesters`
- `GET /subjects`
- `POST /subjects`
- `GET /schedule?date=YYYY-MM-DD`
- `POST /attendance`
- `PATCH /attendance/{id}`
- `GET /subjects/{id}/attendance-summary`
- `GET /assignments`
- `POST /assignments`
- `GET /makeup-classes`
- `POST /makeup-classes`

The exact framework and provider are implementation decisions. The API must return validation errors in a consistent format and never trust an account or record ID supplied by the client without authorization checks.

## 5. Client responsibilities

- Render responsive views and accessible controls.
- Present loading, empty, success, and error states.
- Send authenticated requests.
- Avoid implementing a second, conflicting attendance formula.
- Optimistically update only when failure can be rolled back clearly.

## 6. Backend responsibilities

- Authenticate requests and enforce record ownership.
- Validate and persist domain data.
- Enforce unique attendance occurrences.
- Calculate summaries using one shared business rule.
- Provide stable responses usable by web and Flutter clients.

## 7. Security considerations

- Use HTTPS in deployed environments.
- Store secrets only in environment configuration.
- Apply database row-level ownership rules or equivalent authorization checks.
- Validate all user input on the server.
- Do not expose private records through predictable unauthenticated URLs.
- Provide a backup and account-data deletion strategy before production use.