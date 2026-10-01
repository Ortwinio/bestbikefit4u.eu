export type AutosaveState = "idle" | "pending" | "saving" | "saved" | "error" | "invalid";

export type AutosaveOptions<T> = {
  value: T;
  onSave: (value: T) => Promise<unknown>;
  validate?: (value: T) => string | null | undefined;
  debounceMs?: number;
  enabled?: boolean;
};

/** One serial writer per mounted field group. Values must be JSON serializable. */
export class AutosaveController<T> {
  private options: AutosaveOptions<T>;
  private value: T;
  private savedKey: string;
  private timer?: ReturnType<typeof setTimeout>;
  private fadeTimer?: ReturnType<typeof setTimeout>;
  private flight?: Promise<void>;
  private dirty = false;
  private active: boolean;
  private listener?: (state: AutosaveState, error: string | null) => void;
  state: AutosaveState = "idle";
  error: string | null = null;

  constructor(options: AutosaveOptions<T>) {
    this.options = options;
    this.value = options.value;
    this.savedKey = JSON.stringify(options.value);
    this.active = options.enabled !== false;
  }

  subscribe(listener: (state: AutosaveState, error: string | null) => void) {
    this.listener = listener;
    listener(this.state, this.error);
    return () => { this.listener = undefined; };
  }

  private publish(state: AutosaveState, error: string | null = null) {
    clearTimeout(this.fadeTimer);
    this.state = state;
    this.error = error;
    this.listener?.(state, error);
    if (state === "saved") {
      this.fadeTimer = setTimeout(() => this.publish("idle"), 2000);
    }
  }

  update(options: AutosaveOptions<T>) {
    const wasActive = this.active;
    const changed = JSON.stringify(options.value) !== JSON.stringify(this.value);
    this.options = options;
    this.value = options.value;
    this.active = options.enabled !== false;
    if (!this.active || !wasActive) {
      clearTimeout(this.timer);
      this.savedKey = JSON.stringify(this.value);
      this.dirty = false;
      if (wasActive || changed) this.publish("idle");
      return;
    }
    if (!changed) return;
    clearTimeout(this.timer);
    this.dirty = JSON.stringify(this.value) !== this.savedKey || Boolean(this.flight);
    const error = options.validate?.(this.value);
    if (error) {
      this.publish("invalid", error);
      return;
    }
    if (!this.dirty) {
      this.publish("idle");
      return;
    }
    this.publish(this.flight ? "saving" : "pending");
    this.timer = setTimeout(() => { void this.flush(); }, options.debounceMs ?? 800);
  }

  flush = (): Promise<void> => {
    clearTimeout(this.timer);
    if (this.flight) return this.flight;
    if (!this.active || !this.dirty || this.state === "error") return Promise.resolve();
    const validation = this.options.validate?.(this.value);
    if (validation) {
      this.publish("invalid", validation);
      return Promise.resolve();
    }
    const value = this.value;
    const key = JSON.stringify(value);
    const onSave = this.options.onSave;
    this.publish("saving");
    // Defer invocation so flight is assigned even if onSave throws synchronously.
    this.flight = Promise.resolve().then(() => onSave(value)).then(() => {
      this.savedKey = key;
      this.dirty = JSON.stringify(this.value) !== key;
      this.publish(this.dirty ? "pending" : "saved");
    }).catch(() => {
      this.dirty = true;
      this.publish("error");
    }).then(async () => {
      this.flight = undefined;
      // A newer valid edit wins even when the older request failed.
      if (JSON.stringify(this.value) !== key && this.active) {
        if (this.state === "error") this.publish("pending");
        await this.flush();
      }
    });
    return this.flight;
  };

  retry = () => {
    if (this.state === "error") this.publish("pending");
    return this.flush();
  };

  detach() {
    this.listener = undefined;
    clearTimeout(this.fadeTimer);
    // Pending writes, including the latest queued edit, survive SPA unmount.
    void this.flush();
  }
}
