# Shared autosave primitives (41a)

Available from `@/components/ui`: `useAutosave`, `AutosaveStatus`, `AutosaveField`.
Shared NL/EN status copy: `@/i18n/account/autosave` (`autosaveMessages[locale]`).

```tsx
const [values, setValues] = useState(initialValues);
const autosave = useAutosave({
  value: values,
  onSave: async (next) => { await updateRecord(next); },
  validate: (next) => isValid(next) ? null : copy.invalid,
  debounceMs: 800, // text; use 500 for sliders/segments
  enabled: loaded,
});
return <AutosaveField flush={autosave.flush}>
  <Input value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} />
  <AutosaveStatus {...autosave} messages={autosaveMessages[locale]} onRetry={autosave.retry} />
</AutosaveField>;
```

- Controlled values, JSON-serializable. Initial/hydrated value is the baseline; no initial write.
- Prefer query-loaded parent + keyed child holding the editor's initial values. Key by record/bike
  identity, so a pending write always retains its original record. Do not overwrite dirty fields
  in query subscription effects. Query undefined means loading, null means no saved data.
- `enabled:false` pauses and accepts hydration values as a baseline. Enable only after loading.
- One request at a time per hook. Intermediate queued values coalesce; latest valid edit follows
  the in-flight request. Failed values remain in the caller's state; explicit retry is exposed.
- `validate` returns a localized inline error or null. Server validation is still required.
- State: idle/pending/saving/saved/error/invalid. Saved fades after two seconds.
- `AutosaveField` flushes on blur. `commitOn="release"` also flushes pointer/key release for
  slider/segment groups. Ordinary text inputs and textareas keep their typing debounce; blur flushes them.
- Flush also starts on visibility hidden, pagehide and unmount. SPA unmount drains the serial queue.
  Browser process termination cannot guarantee network delivery; do not claim a completed save
  until the server promise resolves. No backend/session snapshots are modified by the hook itself.
