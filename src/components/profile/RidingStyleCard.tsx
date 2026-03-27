"use client";

import { useEffect, useState } from "react";
import { Bike, Edit2 } from "lucide-react";
import { Doc } from "../../../convex/_generated/dataModel";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { cn } from "@/utils/cn";

type ExperienceLevel = "beginner" | "intermediate" | "advanced";
type WeeklyHours = "0-3" | "3-6" | "6-10" | "10-15" | "15+";
type RideLength = "short" | "medium" | "long" | "ultra";
type PositionPriority = "comfort" | "balanced" | "performance";

export interface RiderProfileData {
  experienceLevel: ExperienceLevel;
  weeklyHours: WeeklyHours;
  typicalRideLength: RideLength;
  positionPriority: PositionPriority;
}

interface DraftState {
  experienceLevel: ExperienceLevel | null;
  weeklyHours: string | null;
  typicalRideLength: string | null;
  positionPriority: string | null;
}

const EXPERIENCE_KEYS: ExperienceLevel[] = ["beginner", "intermediate", "advanced"];
const WEEKLY_HOURS_KEYS: WeeklyHours[] = ["0-3", "3-6", "6-10", "10-15", "15+"];
const RIDE_DISTANCE_KEYS: RideLength[] = ["short", "medium", "long", "ultra"];
const POSITION_KEYS: PositionPriority[] = ["comfort", "balanced", "performance"];

function isRiderProfileComplete(profile: Doc<"profiles"> | null): boolean {
  if (!profile) return false;
  return (
    profile.experienceLevel !== undefined &&
    profile.weeklyHours !== undefined &&
    profile.typicalRideLength !== undefined &&
    profile.positionPriority !== undefined
  );
}

function initDraft(profile: Doc<"profiles"> | null): DraftState {
  return {
    experienceLevel: (profile?.experienceLevel as ExperienceLevel | undefined) ?? null,
    weeklyHours: profile?.weeklyHours ?? null,
    typicalRideLength: profile?.typicalRideLength ?? null,
    positionPriority: profile?.positionPriority ?? null,
  };
}

// Read-only slider for view state
export function ReadOnlySlider({
  label,
  options,
  value,
}: {
  label: string;
  options: { key: string; label: string }[];
  value: string | null;
}) {
  const selectedIndex = value ? options.findIndex((o) => o.key === value) : -1;
  const fillPercent =
    selectedIndex >= 0 ? (selectedIndex / (options.length - 1)) * 100 : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-[color:var(--muted-foreground)]">{label}</p>
        {value ? (
          <span className="text-xs font-semibold text-primary">
            {options.find((o) => o.key === value)?.label}
          </span>
        ) : null}
      </div>
      <div className="relative flex h-6 items-center justify-between px-1">
        {/* Track */}
        <div className="pointer-events-none absolute inset-x-1 top-1/2 h-2 -translate-y-1/2 rounded-full bg-primary/15" />
        {/* Fill */}
        {selectedIndex >= 0 && (
          <div
            className="pointer-events-none absolute left-1 top-1/2 h-2 -translate-y-1/2 rounded-full bg-primary/60"
            style={{ width: `calc(${fillPercent}% * (100% - 8px) / 100 + ${fillPercent > 0 ? "4px" : "0px"})` }}
          />
        )}
        {/* Dots */}
        {options.map((opt, i) => {
          const isActive = i === selectedIndex;
          return (
            <div
              key={opt.key}
              className={cn(
                "relative z-10 rounded-full bg-primary transition-all duration-200",
                isActive ? "size-4 border-2 border-background shadow-sm ring-2 ring-primary" : "size-2 opacity-30"
              )}
            />
          );
        })}
      </div>
      {/* Labels */}
      <div
        className="grid text-xs"
        style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
      >
        {options.map((opt, i) => (
          <span
            key={opt.key}
            className={cn(
              "leading-tight",
              i === 0 ? "text-left" : i === options.length - 1 ? "text-right" : "text-center",
              opt.key === value ? "font-semibold text-primary" : "text-muted-foreground"
            )}
          >
            {opt.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// Compact horizontal snap-point slider
export function SliderQuestion({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { key: string; label: string }[];
  value: string | null;
  onChange: (key: string) => void;
}) {
  const selectedIndex = value ? options.findIndex((o) => o.key === value) : -1;
  const fillPercent =
    selectedIndex >= 0 ? (selectedIndex / (options.length - 1)) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-[color:var(--foreground)]">{label}</p>
        {value ? (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {options.find((o) => o.key === value)?.label}
          </span>
        ) : null}
      </div>
      <div
        role="radiogroup"
        aria-label={label}
        className="relative flex h-10 items-center justify-between px-1"
      >
        {/* Track background */}
        <div className="pointer-events-none absolute inset-x-1 top-1/2 h-2 -translate-y-1/2 rounded-full bg-primary/15" />
        {/* Filled portion */}
        {selectedIndex >= 0 && (
          <div
            className="pointer-events-none absolute left-1 top-1/2 h-2 -translate-y-1/2 rounded-full bg-primary transition-[width] duration-300 ease-out"
            style={{ width: `calc(${fillPercent}% * (100% - 8px) / 100 + ${fillPercent > 0 ? "4px" : "0px"})` }}
          />
        )}
        {/* Snap-point buttons */}
        {options.map((opt, i) => {
          const isActive = i === selectedIndex;
          return (
            <button
              key={opt.key}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(opt.key)}
              className={cn(
                "relative z-10 rounded-full bg-primary transition-all duration-200",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                isActive
                  ? "size-6 border-4 border-background shadow-md"
                  : "size-3 opacity-50 hover:opacity-100"
              )}
            />
          );
        })}
      </div>
      {/* Labels row */}
      <div
        className="grid text-xs font-medium"
        style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
      >
        {options.map((opt, i) => (
          <span
            key={opt.key}
            className={cn(
              "cursor-pointer transition-colors duration-150 leading-tight",
              i === 0 ? "text-left" : i === options.length - 1 ? "text-right" : "text-center",
              opt.key === value ? "font-semibold text-primary" : "text-muted-foreground"
            )}
            onClick={() => onChange(opt.key)}
          >
            {opt.label}
          </span>
        ))}
      </div>
    </div>
  );
}


interface RidingStyleCardProps {
  profile: Doc<"profiles"> | null;
  messages: ReturnType<typeof useDashboardMessages>["messages"];
  editing: boolean;
  onStartEdit: () => void;
  onCancel: () => void;
  onSave: (data: RiderProfileData) => Promise<void>;
}

export function RidingStyleCard({
  profile,
  messages,
  editing,
  onStartEdit,
  onCancel,
  onSave,
}: RidingStyleCardProps) {
  const t = messages.profile.ridingStyle;
  const tQ = messages.questionnaire;

  const [draft, setDraft] = useState<DraftState>(() => initDraft(profile));
  const [isSaving, setIsSaving] = useState(false);

  // Reset draft when editing starts
  useEffect(() => {
    if (editing) {
      setDraft(initDraft(profile));
    }
  }, [editing, profile]);

  const isComplete = isRiderProfileComplete(profile);

  const canSave =
    draft.experienceLevel !== null &&
    draft.weeklyHours !== null &&
    draft.typicalRideLength !== null &&
    draft.positionPriority !== null;

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    try {
      await onSave({
        experienceLevel: draft.experienceLevel as ExperienceLevel,
        weeklyHours: draft.weeklyHours as WeeklyHours,
        typicalRideLength: draft.typicalRideLength as RideLength,
        positionPriority: draft.positionPriority as PositionPriority,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderViewState = () => {
    if (!isComplete || !profile) return null;

    const experienceOptions = EXPERIENCE_KEYS.map((k) => ({
      key: k,
      label: tQ.experienceLevel.levels[k].label,
    }));
    const weeklyHoursOptions = WEEKLY_HOURS_KEYS.map((k) => ({
      key: k,
      label: tQ.weeklyHours.options[k].label,
    }));
    const rideDistanceOptions = RIDE_DISTANCE_KEYS.map((k) => ({
      key: k,
      label: tQ.rideDistance.options[k].label,
    }));
    const positionOptions = POSITION_KEYS.map((k) => ({
      key: k,
      label: k.charAt(0).toUpperCase() + k.slice(1),
    }));

    return (
      <div className="space-y-5">
        <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
          {t.description}
        </p>
        <ReadOnlySlider
          label={t.experienceLevel}
          options={experienceOptions}
          value={profile.experienceLevel ?? null}
        />
        <ReadOnlySlider
          label={t.weeklyHours}
          options={weeklyHoursOptions}
          value={profile.weeklyHours ?? null}
        />
        <ReadOnlySlider
          label={t.typicalRide}
          options={rideDistanceOptions}
          value={profile.typicalRideLength ?? null}
        />
        <ReadOnlySlider
          label={t.positionPriority}
          options={positionOptions}
          value={profile.positionPriority ?? null}
        />
      </div>
    );
  };

  const renderEditState = () => {
    const experienceOptions = EXPERIENCE_KEYS.map((k) => ({
      key: k,
      label: tQ.experienceLevel.levels[k].label,
    }));

    const weeklyHoursOptions = WEEKLY_HOURS_KEYS.map((k) => ({
      key: k,
      label: tQ.weeklyHours.options[k].label,
    }));

    const rideDistanceOptions = RIDE_DISTANCE_KEYS.map((k) => ({
      key: k,
      label: tQ.rideDistance.options[k].label,
    }));

    const positionOptions = POSITION_KEYS.map((k) => ({
      key: k,
      label: k.charAt(0).toUpperCase() + k.slice(1),
    }));

    return (
      <div className="space-y-6">
        <SliderQuestion
          label={tQ.experienceLevel.questionText}
          options={experienceOptions}
          value={draft.experienceLevel}
          onChange={(v) => setDraft((d) => ({ ...d, experienceLevel: v as ExperienceLevel }))}
        />

        <SliderQuestion
          label={tQ.weeklyHours.questionText}
          options={weeklyHoursOptions}
          value={draft.weeklyHours}
          onChange={(v) => setDraft((d) => ({ ...d, weeklyHours: v }))}
        />

        <SliderQuestion
          label={tQ.rideDistance.questionText}
          options={rideDistanceOptions}
          value={draft.typicalRideLength}
          onChange={(v) => setDraft((d) => ({ ...d, typicalRideLength: v }))}
        />

        <SliderQuestion
          label={t.positionPriorityQuestion}
          options={positionOptions}
          value={draft.positionPriority}
          onChange={(v) => setDraft((d) => ({ ...d, positionPriority: v }))}
        />

        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            {messages.common.cancel}
          </Button>
          <Button
            size="sm"
            onClick={() => void handleSave()}
            isLoading={isSaving}
            disabled={!canSave}
          >
            {t.saveButton}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card variant="bordered" className="dashboard-card-surface">
      <CardHeader className="border-b border-[color:var(--border)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bike className="h-5 w-5 text-[color:var(--primary)]" />
            <CardTitle>{t.title}</CardTitle>
          </div>
          {!editing ? (
            <Button variant="primary-soft" size="sm" onClick={onStartEdit}>
              <Edit2 className="h-4 w-4" />
              {t.editButton}
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!editing ? (
          isComplete ? (
            renderViewState()
          ) : (
            <div className="rounded-[var(--radius-lg)] border border-warning/40 bg-warning/5 p-4">
              <p className="font-medium text-foreground">{t.incompleteTitle}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t.incompleteDescription}</p>
              <Button className="mt-3" size="sm" onClick={onStartEdit}>
                {t.completeCta}
              </Button>
            </div>
          )
        ) : (
          renderEditState()
        )}
      </CardContent>
    </Card>
  );
}
