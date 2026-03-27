Design the multi-photo extension for bikes.

Requirements:

- do not overload the existing `photoUrl` field forever
- preserve compatibility with the current primary photo
- support:
  - multiple photos per bike
  - one primary photo
  - ordering
  - deletion
  - optional caption or view type if useful

Recommend the best model:

- dedicated `bikePhotos` table is preferred unless there is a strong reason otherwise

Define:

- schema shape
- upload flow
- how `photoUrl` transitions to primary-photo compatibility
- UI behavior on the bike page

Output file:

- `output-03-multi-photo-data-model-and-ui.md`
