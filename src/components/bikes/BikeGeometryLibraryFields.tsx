"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Check, ChevronDown, ListChecks, X } from "lucide-react";
import { useQuery } from "convex/react";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button, Input, Select } from "@/components/ui";
import { api } from "../../../convex/_generated/api";
import { pushDataLayerEvent } from "@/lib/analytics/marketing";
import type { DashboardMessages } from "@/i18n/dashboardMessages";
import {
  applyGeometryRecordSelection,
  applyStandardBrandSelection,
  applyStandardGeometrySelection,
  applyStandardModelFamilySelection,
  applyStandardModelVariantSelection,
  disableCustomBrandFallback,
  enableCustomBrandFallback,
  type BikeGeometryFallbackState,
} from "./bikeFormGeometry";

type BikeGeometryLibraryFieldsProps = {
  state: BikeGeometryFallbackState;
  onChange: (
    updater:
      | BikeGeometryFallbackState
      | ((current: BikeGeometryFallbackState) => BikeGeometryFallbackState)
  ) => void;
  messages: DashboardMessages;
};

type BrandOption = {
  brandId: Id<"geometry_brands">;
  name: string;
  hasUsableModels: boolean;
};

type ModelYearOption = {
  modelId: Id<"geometry_models">;
  yearLabel: string | null;
  sizeRecordCount: number;
};

type ModelFamilyOption = {
  modelKey: string;
  name: string;
  yearSelectionRequired: boolean;
  hasUsableSizes: boolean;
  yearOptions: ModelYearOption[];
};

type SizeOption = {
  recordId: Id<"geometry_records">;
  sizeLabel: string;
};

type GeometryPreview = {
  recordId: Id<"geometry_records">;
  sizeLabel: string;
  stackMm: number | null;
  reachMm: number | null;
  seatTubeAngle: number | null;
  headTubeAngle: number | null;
};

type GeometryRecordSelection = {
  recordId: Id<"geometry_records">;
  brandId: Id<"geometry_brands">;
  brandName: string;
  modelFamilyKey: string;
  modelId: Id<"geometry_models">;
  modelName: string;
  yearLabel: string | null;
  sizeLabel: string;
};

function asStateSetter(onChange: BikeGeometryLibraryFieldsProps["onChange"]) {
  return (updater: (current: BikeGeometryFallbackState) => BikeGeometryFallbackState) => {
    onChange(updater);
  };
}

function trackGeometrySelection(eventType: string, payload: Record<string, unknown>) {
  pushDataLayerEvent({
    event: "bbf_marketing_event",
    eventType,
    ...payload,
  });
}

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function formatMetric(value: number | null, unit: string, unavailable: string) {
  return value === null ? unavailable : `${value}${unit}`;
}

function SelectedBadge({
  label,
  onClear,
}: {
  label: string;
  onClear: () => void;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--primary)] bg-[color:var(--primary)]/12 px-3 py-1.5 text-sm font-medium text-[color:var(--foreground)]">
      <Check className="h-4 w-4" />
      <span>{label}</span>
      <button
        type="button"
        className="rounded-full p-0.5 text-[color:var(--muted-foreground)] transition hover:bg-[color:var(--background)] hover:text-[color:var(--foreground)]"
        onClick={onClear}
        aria-label={label}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function SectionShell({
  step,
  complete,
  disabled,
  title,
  description,
  children,
}: {
  step: number;
  complete?: boolean;
  disabled?: boolean;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cx(
        "space-y-3 rounded-[var(--radius-lg)] border bg-[color:var(--card)] p-4",
        disabled ? "border-[color:var(--border)]/60 opacity-70" : "border-[color:var(--border)]"
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div
            className={cx(
              "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
              complete
                ? "bg-[color:var(--primary)] text-[color:var(--primary-foreground)]"
                : disabled
                  ? "bg-[color:var(--secondary)] text-[color:var(--muted-foreground)]"
                  : "bg-[color:var(--secondary)] text-[color:var(--foreground)]"
            )}
          >
            {complete ? <Check className="h-4 w-4" /> : step}
          </div>
          <p className="text-sm font-semibold text-[color:var(--foreground)]">{title}</p>
        </div>
        {description ? (
          <p className="text-sm text-[color:var(--muted-foreground)]">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function EmptyChipState({ message }: { message: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-dashed border-[color:var(--border)] px-4 py-3 text-sm text-[color:var(--muted-foreground)]">
      {message}
    </div>
  );
}

function SelectionSummary({
  state,
  yearLabel,
  messages,
}: {
  state: BikeGeometryFallbackState;
  yearLabel: string | null;
  messages: DashboardMessages;
}) {
  const copy = messages.bikeForm.fields.geometryLink;
  const selection = [
    state.standardBrand,
    state.standardModel,
    yearLabel,
    state.geometrySizeLabel,
  ].filter(Boolean);

  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--card)] p-4">
      <div className="flex items-center gap-2">
        <ListChecks className="h-4 w-4 text-[color:var(--muted-foreground)]" />
        <p className="text-sm font-semibold text-[color:var(--foreground)]">
          {copy.selectionSummary}
        </p>
      </div>
      <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
        {selection.length > 0 ? selection.join(" · ") : copy.selectionSummaryEmpty}
      </p>
    </div>
  );
}

function GeometryPreviewCard({
  preview,
  messages,
}: {
  preview: GeometryPreview | null | undefined;
  messages: DashboardMessages;
}) {
  const copy = messages.bikeForm.fields.geometryLink.preview;

  if (!preview) {
    return null;
  }

  const items = [
    { label: copy.stack, value: formatMetric(preview.stackMm, " mm", copy.unavailable) },
    { label: copy.reach, value: formatMetric(preview.reachMm, " mm", copy.unavailable) },
    {
      label: copy.seatTubeAngle,
      value: formatMetric(preview.seatTubeAngle, "°", copy.unavailable),
    },
    {
      label: copy.headTubeAngle,
      value: formatMetric(preview.headTubeAngle, "°", copy.unavailable),
    },
  ];

  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)]/25 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">
        {copy.title}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-[var(--radius-md)] bg-[color:var(--background)] px-3 py-3"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted-foreground)]">
              {item.label}
            </p>
            <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Phase1BrandSelector({
  brands,
  selectedBrandId,
  onBrandSelect,
  messages,
}: {
  brands: BrandOption[] | undefined;
  selectedBrandId?: string;
  onBrandSelect: (brand: BrandOption) => void;
  messages: DashboardMessages;
}) {
  const copy = messages.bikeForm.fields.geometryLink;
  const options =
    brands?.map((brand) => ({
      value: String(brand.brandId),
      label: brand.name,
    })) ?? [];

  return (
    <SectionShell
      step={1}
      complete={Boolean(selectedBrandId)}
      title={copy.standardBrand.label}
      description={
        brands === undefined
          ? copy.loadingBrands
          : brands.length === 0
            ? copy.noBrands
            : copy.standardBrand.helper
      }
    >
      <Select
        label={copy.standardBrand.label}
        value={selectedBrandId ?? ""}
        onChange={(event) => {
          const nextBrand = brands?.find(
            (brand) => String(brand.brandId) === event.target.value
          );
          if (nextBrand) {
            onBrandSelect(nextBrand);
          }
        }}
        options={options}
        placeholder={copy.standardBrand.placeholder}
      />
      {brands !== undefined && brands.length === 0 ? (
        <EmptyChipState message={copy.noBrands} />
      ) : null}
    </SectionShell>
  );
}

function Phase2ModelSelector({
  models,
  selectedBrandName,
  selectedModelFamilyKey,
  selectedModelFamilyLabel,
  selectedModelId,
  onClearBrand,
  onModelSelect,
  onYearSelect,
  messages,
}: {
  models: ModelFamilyOption[] | undefined;
  selectedBrandName: string;
  selectedModelFamilyKey?: string;
  selectedModelFamilyLabel?: string;
  selectedModelId?: string;
  onClearBrand: () => void;
  onModelSelect: (family: ModelFamilyOption) => void;
  onYearSelect: (family: ModelFamilyOption, option: ModelYearOption) => void;
  messages: DashboardMessages;
}) {
  const copy = messages.bikeForm.fields.geometryLink;
  const selectedFamily =
    models?.find((family) => family.modelKey === selectedModelFamilyKey) ?? null;
  const modelOptions =
    models?.map((family) => ({
      value: family.modelKey,
      label: family.yearSelectionRequired
        ? `${family.name} (${family.yearOptions.length})`
        : family.name,
    })) ?? [];
  const yearOptions =
    selectedFamily?.yearOptions.map((option) => ({
      value: String(option.modelId),
      label:
        option.yearLabel ??
        copy.year.unknownOptionLabel.replace(
          "{count}",
          String(option.sizeRecordCount)
        ),
    })) ?? [];

  return (
    <SectionShell
      step={2}
      complete={Boolean(selectedModelFamilyKey)}
      disabled={!selectedBrandName}
      title={copy.standardModel.label}
      description={
        models === undefined
          ? copy.loadingModels
          : models.length === 0
            ? copy.noModels
            : copy.selectModelFirst
      }
    >
      <SelectedBadge label={selectedBrandName} onClear={onClearBrand} />
      <Select
        label={copy.standardModel.label}
        value={selectedModelFamilyKey ?? ""}
        onChange={(event) => {
          const family = models?.find(
            (candidate) => candidate.modelKey === event.target.value
          );
          if (family) {
            onModelSelect(family);
          }
        }}
        options={modelOptions}
        placeholder={copy.standardModel.placeholder}
        disabled={!selectedBrandName || models === undefined || models.length === 0}
      />
      {models !== undefined && models.length === 0 ? (
        <EmptyChipState message={copy.noModels} />
      ) : null}
      {selectedFamily && !selectedFamily.yearSelectionRequired && selectedModelFamilyLabel ? (
        <div className="rounded-[var(--radius-md)] bg-[color:var(--secondary)]/35 px-3 py-3 text-sm text-[color:var(--muted-foreground)]">
          {selectedModelFamilyLabel}
        </div>
      ) : null}
      {selectedFamily?.yearSelectionRequired ? (
        <Select
          label={copy.year.label}
          value={selectedModelId ?? ""}
          onChange={(event) => {
            const option = selectedFamily.yearOptions.find(
              (candidate) => String(candidate.modelId) === event.target.value
            );
            if (option) {
              onYearSelect(selectedFamily, option);
            }
          }}
          options={yearOptions}
          placeholder={copy.year.placeholder}
          helperText={copy.year.helper}
        />
      ) : null}
    </SectionShell>
  );
}

function Phase3YearSelector({
  selectedLabel,
  yearSelectionRequired,
  selectedYearLabel,
  selectedModelId,
  onClearModel,
  messages,
}: {
  selectedLabel: string;
  yearSelectionRequired: boolean;
  selectedYearLabel: string | null;
  selectedModelId?: string;
  onClearModel: () => void;
  messages: DashboardMessages;
}) {
  const copy = messages.bikeForm.fields.geometryLink;

  return (
    <SectionShell
      step={3}
      complete={yearSelectionRequired ? Boolean(selectedModelId) : Boolean(selectedLabel)}
      disabled={!selectedLabel}
      title={copy.year.label}
      description={copy.year.helper}
    >
      <SelectedBadge label={selectedLabel} onClear={onClearModel} />
      <div className="rounded-[var(--radius-md)] bg-[color:var(--secondary)]/35 px-3 py-3 text-sm text-[color:var(--muted-foreground)]">
        {selectedYearLabel ??
          (yearSelectionRequired ? copy.year.placeholder : copy.year.unknownOptionLabel.replace("{count}", "1"))}
      </div>
    </SectionShell>
  );
}

function Phase4SizeSelector({
  selectedLabel,
  onClearModel,
  sizeOptions,
  selectedRecordId,
  onSizeSelect,
  geometryPreview,
  messages,
}: {
  selectedLabel: string;
  onClearModel: () => void;
  sizeOptions: SizeOption[] | undefined;
  selectedRecordId?: string;
  onSizeSelect: (size: SizeOption) => void;
  geometryPreview: GeometryPreview | null | undefined;
  messages: DashboardMessages;
}) {
  const copy = messages.bikeForm.fields.geometryLink;
  const options =
    sizeOptions?.map((size) => ({
      value: String(size.recordId),
      label: size.sizeLabel,
    })) ?? [];

  return (
    <SectionShell
      step={4}
      complete={Boolean(selectedRecordId)}
      disabled={!selectedLabel}
      title={copy.size.label}
      description={copy.size.helper}
    >
      <SelectedBadge label={selectedLabel} onClear={onClearModel} />
      {sizeOptions === undefined ? (
        <EmptyChipState message={copy.loadingModels} />
      ) : sizeOptions.length === 0 ? (
        <EmptyChipState message={copy.noModels} />
      ) : (
        <Select
          label={copy.size.label}
          value={selectedRecordId ?? ""}
          onChange={(event) => {
            const nextSize = sizeOptions.find(
              (size) => String(size.recordId) === event.target.value
            );
            if (nextSize) {
              onSizeSelect(nextSize);
            }
          }}
          options={options}
          placeholder={copy.size.placeholder}
        />
      )}
      <GeometryPreviewCard preview={geometryPreview} messages={messages} />
    </SectionShell>
  );
}

function CustomFallbackDisclosure({
  open,
  state,
  onOpenChange,
  onChange,
  messages,
}: {
  open: boolean;
  state: BikeGeometryFallbackState;
  onOpenChange: (nextOpen: boolean) => void;
  onChange: BikeGeometryLibraryFieldsProps["onChange"];
  messages: DashboardMessages;
}) {
  const setState = asStateSetter(onChange);
  const copy = messages.bikeForm.fields.geometryLink;

  return (
    <section className="rounded-[var(--radius-lg)] border border-dashed border-[color:var(--border)] bg-[color:var(--secondary)]/20">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
        aria-expanded={open}
        onClick={() => {
          const nextOpen = !open;
          onOpenChange(nextOpen);
          if (nextOpen) {
            trackGeometrySelection("bike_geometry_custom_fallback_enabled", {
              fallbackType: "brand",
            });
          } else {
            onChange((current) => disableCustomBrandFallback(current));
          }
        }}
      >
        <div>
          <p className="text-sm font-semibold text-[color:var(--foreground)]">
            {copy.customBrandAction}
          </p>
          <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
            {copy.customExplanation}
          </p>
        </div>
        <ChevronDown
          className={cx(
            "h-4 w-4 shrink-0 text-[color:var(--muted-foreground)] transition",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <div className="space-y-4 border-t border-[color:var(--border)] px-4 py-4">
          <Input
            label={messages.bikeForm.fields.brand.label}
            value={state.customBrand}
            onChange={(event) => {
              const nextBrand = event.target.value;
              setState((current) => {
                if (!nextBrand.trim()) {
                  return disableCustomBrandFallback(current);
                }

                const enabled = current.customBrandEnabled
                  ? current
                  : enableCustomBrandFallback(current);

                return {
                  ...enabled,
                  customBrand: nextBrand,
                };
              });
            }}
            placeholder={messages.bikeForm.fields.brand.placeholder}
          />
          <Input
            label={messages.bikeForm.fields.model.label}
            value={state.customModel}
            onChange={(event) =>
              setState((current) => ({
                ...current,
                customModel: event.target.value,
              }))
            }
            placeholder={messages.bikeForm.fields.model.placeholder}
          />
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onChange((current) => disableCustomBrandFallback(current));
              }}
            >
              {messages.common.back}
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function BikeGeometryLibraryFields({
  state,
  onChange,
  messages,
}: BikeGeometryLibraryFieldsProps) {
  const setState = asStateSetter(onChange);
  const [customOpen, setCustomOpen] = useState(
    state.customBrandEnabled || state.customModelEnabled
  );
  const brands = useQuery(api.geometry.queries.listBrandsForRider, {}) as
    | BrandOption[]
    | undefined;
  const models = useQuery(
    api.geometry.queries.listModelsForRiderBrand,
    state.standardBrandId && !state.customBrandEnabled
      ? { brandId: state.standardBrandId as Id<"geometry_brands"> }
      : "skip"
  ) as ModelFamilyOption[] | undefined;
  const sizes = useQuery(
    api.geometry.queries.listSizeRecordsForRiderModel,
    state.standardModelId && !state.customBrandEnabled && !state.customModelEnabled
      ? { modelId: state.standardModelId as Id<"geometry_models"> }
      : "skip"
  ) as { sizeOptions: SizeOption[] } | null | undefined;
  const geometryPreview = useQuery(
    api.geometry.queries.getGeometryRecordPreview,
    state.geometryRecordId && !state.customBrandEnabled && !state.customModelEnabled
      ? { recordId: state.geometryRecordId as Id<"geometry_records"> }
      : "skip"
  ) as GeometryPreview | null | undefined;
  const geometrySelection = useQuery(
    api.geometry.queries.getGeometryRecordSelectionForRider,
    state.geometryRecordId &&
      !state.customBrandEnabled &&
      !state.customModelEnabled &&
      (!state.standardBrandId || !state.standardModelId)
      ? { recordId: state.geometryRecordId as Id<"geometry_records"> }
      : "skip"
  ) as GeometryRecordSelection | null | undefined;

  const customDisclosureOpen =
    customOpen || state.customBrandEnabled || state.customModelEnabled;

  useEffect(() => {
    if (
      !geometrySelection ||
      state.customBrandEnabled ||
      state.customModelEnabled ||
      state.geometryRecordId !== String(geometrySelection.recordId)
    ) {
      return;
    }

    const needsHydration =
      state.standardBrandId !== String(geometrySelection.brandId) ||
      state.standardModelFamilyKey !== geometrySelection.modelFamilyKey ||
      state.standardModelId !== String(geometrySelection.modelId) ||
      state.geometrySizeLabel !== geometrySelection.sizeLabel;

    if (!needsHydration) {
      return;
    }

    setState((current) =>
      applyStandardGeometrySelection(current, {
        brandId: String(geometrySelection.brandId),
        brandName: geometrySelection.brandName,
        modelFamilyKey: geometrySelection.modelFamilyKey,
        modelId: String(geometrySelection.modelId),
        modelName: geometrySelection.modelName,
        geometryRecordId: String(geometrySelection.recordId),
        sizeLabel: geometrySelection.sizeLabel,
      })
    );
  }, [
    geometrySelection,
    setState,
    state.customBrandEnabled,
    state.customModelEnabled,
    state.geometryRecordId,
    state.geometrySizeLabel,
    state.standardBrandId,
    state.standardModelFamilyKey,
    state.standardModelId,
  ]);

  const availableBrands = useMemo(() => {
    if (!brands) {
      return undefined;
    }

    return [...brands]
      .filter((brand) => brand.hasUsableModels)
      .sort((left, right) =>
        left.name.localeCompare(right.name, undefined, { sensitivity: "base" })
      );
  }, [brands]);

  const availableModels = useMemo(() => {
    if (!models) {
      return undefined;
    }

    return [...models]
      .filter((family) => family.hasUsableSizes)
      .sort((left, right) =>
        left.name.localeCompare(right.name, undefined, { sensitivity: "base" })
      );
  }, [models]);

  const selectedModelFamily =
    availableModels?.find((family) => family.modelKey === state.standardModelFamilyKey) ?? null;
  const selectedYearOption =
    selectedModelFamily?.yearOptions.find(
      (option) => String(option.modelId) === state.standardModelId
    ) ?? null;
  const resolvedYearLabel =
    selectedYearOption?.yearLabel ?? geometrySelection?.yearLabel ?? null;
  const selectedModelLabel = [
    state.standardBrand,
    selectedModelFamily?.name ?? state.standardModel,
    resolvedYearLabel,
  ]
    .filter(Boolean)
    .join(" · ");
  const selectedYearLabel = resolvedYearLabel ?? messages.bikeForm.fields.geometryLink.year.placeholder;
  const selectedModelFamilyLabel =
    selectedModelFamily && !selectedModelFamily.yearSelectionRequired
      ? resolvedYearLabel
        ? `${selectedModelFamily.name} · ${resolvedYearLabel}`
        : selectedModelFamily.name
      : undefined;

  return (
    <div className="space-y-5 rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
      <div className="space-y-1">
        <p className="text-sm font-medium text-[color:var(--foreground)]">
          {messages.bikeForm.fields.geometryLink.title}
        </p>
        <p className="text-sm text-[color:var(--muted-foreground)]">
          {messages.bikeForm.fields.geometryLink.description}
        </p>
      </div>

      <SelectionSummary state={state} yearLabel={resolvedYearLabel} messages={messages} />

      {!customDisclosureOpen ? (
        <>
          <Phase1BrandSelector
            brands={availableBrands}
            selectedBrandId={state.standardBrandId}
            onBrandSelect={(brand) => {
              setState((current) =>
                applyStandardBrandSelection(current, {
                  brandId: String(brand.brandId),
                  brandName: brand.name,
                })
              );
              trackGeometrySelection("bike_geometry_brand_selected", {
                brandName: brand.name,
              });
            }}
            messages={messages}
          />

          <Phase2ModelSelector
            models={availableModels}
            selectedBrandName={state.standardBrand ?? ""}
            selectedModelFamilyLabel={selectedModelFamilyLabel}
            selectedModelFamilyKey={state.standardModelFamilyKey}
            selectedModelId={state.standardModelId}
            onClearBrand={() => {
              setState((current) =>
                applyStandardBrandSelection(current, {
                  brandId: undefined,
                  brandName: undefined,
                })
              );
            }}
            onModelSelect={(family) => {
              setState((current) => {
                const nextState = applyStandardModelFamilySelection(current, {
                  modelFamilyKey: family.modelKey,
                  modelName: family.name,
                });

                if (!family.yearSelectionRequired && family.yearOptions[0]) {
                  return applyStandardModelVariantSelection(nextState, {
                    modelId: String(family.yearOptions[0].modelId),
                    modelName: family.name,
                  });
                }

                return nextState;
              });
              trackGeometrySelection("bike_geometry_model_selected", {
                brandName: state.standardBrand,
                modelName: family.name,
              });
            }}
            onYearSelect={(family, option) => {
              setState((current) =>
                applyStandardModelVariantSelection(current, {
                  modelId: String(option.modelId),
                  modelName: family.name,
                })
              );
              trackGeometrySelection("bike_geometry_year_selected", {
                brandName: state.standardBrand,
                modelName: family.name,
                yearLabel: option.yearLabel,
              });
            }}
            messages={messages}
          />

          <Phase3YearSelector
            selectedLabel={selectedModelLabel}
            yearSelectionRequired={Boolean(selectedModelFamily?.yearSelectionRequired)}
            selectedYearLabel={selectedYearLabel}
            selectedModelId={state.standardModelId}
            onClearModel={() => {
              setState((current) =>
                applyStandardModelFamilySelection(current, {
                  modelFamilyKey: undefined,
                  modelName: undefined,
                })
              );
            }}
            messages={messages}
          />

          {state.standardModelId ? (
            <Phase4SizeSelector
              selectedLabel={selectedModelLabel}
              onClearModel={() => {
                setState((current) =>
                  applyStandardModelFamilySelection(current, {
                    modelFamilyKey: undefined,
                    modelName: undefined,
                  })
                );
              }}
              sizeOptions={sizes?.sizeOptions}
              selectedRecordId={state.geometryRecordId}
              onSizeSelect={(size) => {
                setState((current) =>
                  applyGeometryRecordSelection(current, {
                    geometryRecordId: String(size.recordId),
                    sizeLabel: size.sizeLabel,
                  })
                );
                trackGeometrySelection("bike_geometry_record_linked", {
                  brandName: state.standardBrand,
                  modelName: state.standardModel,
                  sizeLabel: size.sizeLabel,
                });
              }}
              geometryPreview={geometryPreview}
              messages={messages}
            />
          ) : null}
        </>
      ) : null}

      <CustomFallbackDisclosure
        open={customDisclosureOpen}
        state={state}
        onOpenChange={setCustomOpen}
        onChange={onChange}
        messages={messages}
      />
    </div>
  );
}
