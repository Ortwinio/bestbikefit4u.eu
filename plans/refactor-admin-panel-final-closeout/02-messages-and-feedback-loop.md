# Step 02: Messages And Feedback Loop

## Objective

Fix the broken outbound communication flows so admin actions produce actual user-visible results.

## Tasks

1. Fix direct user messaging from `UserDetailClient` so "send message" results in a deliverable message:
   - either publish immediately
   - or create draft + explicit publish UX
2. Remove false-success flows where the UI claims a message was sent but it remains `scheduled`.
3. Implement the feedback reply loop:
   - when admin adds a non-internal reply, create the right `dashboard_messages` record and target
   - keep the feedback comment as the source thread record
4. Ensure the rider dashboard shows those replies in the intended surface:
   - inbox card, banner, or another approved non-popup format
5. Add tests for:
   - direct user message visibility
   - feedback reply notification visibility
   - internal comments remaining hidden from riders

## Done When

- direct messages from admin reach the targeted user
- user-visible feedback replies appear in the rider dashboard
- internal admin notes remain admin-only
