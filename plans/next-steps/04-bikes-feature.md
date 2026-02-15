# Step 04: Bikes Feature (Frontend)

## Objective

Build the frontend for the bikes module. The backend CRUD operations already exist in `convex/bikes/`.

## Tasks

1. Create `/bikes` page (`src/app/(dashboard)/bikes/page.tsx`)
   - List all user's bikes with name, type, and current setup
   - Empty state with CTA to add first bike
   - Link to edit each bike

2. Create `/bikes/new` page (`src/app/(dashboard)/bikes/new/page.tsx`)
   - Form: bike name, bike type (road, gravel, mountain, hybrid, tt_triathlon, cyclocross, touring, city)
   - Optional: current geometry (stack, reach, seat tube angle, head tube angle, frame size)
   - Optional: current setup (saddle height, setback, stem length, stem angle, handlebar width, crank length)
   - Calls `bikes.mutations.create`

3. Create bike edit page or modal
   - Pre-populate form with current values
   - Calls `bikes.mutations.update`

4. Add bike selection to fit session creation
   - When user has bikes, show them as selectable cards on `/fit`
   - Pass `bikeId` to `sessions.mutations.create`
   - This enables comparison between recommended and current setup

5. Update dashboard sidebar
   - Add "My Bikes" link to sidebar navigation

## Deliverable

- Complete bikes management UI
- Bike selection in fit session flow

## Completion Checklist

- [x] Bikes list page shows all user bikes
- [x] Add new bike form works
- [x] Edit bike works
- [x] Delete bike works (with confirmation)
- [x] Fit session can be linked to a specific bike
- [x] Sidebar shows bikes link
