"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { useQuery } from "convex/react";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button, Input } from "@/components/ui";
import { api } from "../../../convex/_generated/api";
import { pushDataLayerEvent } from "@/lib/analytics/marketing";
import type { DashboardMessages } from "@/i18n/dashboardMessages";
import {
  applyGeometryRecordSelection,
  applyStandardBrandSelection,
  applyStandardModelFamilySelection,
  applyStandardModelVariantSelection,
  disableCustomBrandFallback,
  type BikeGeometryFallbackState,
  enableCustomBrandFallback,
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

function matchesAutocompleteQuery(label: string, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  return label.toLowerCase().includes(normalizedQuery);
}

function compareAutocompleteMatches(left: string, right: string, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  const leftStarts = left.toLowerCase().startsWith(normalizedQuery);
  const rightStarts = right.toLowerCase().startsWith(normalizedQuery);

  if (leftStarts !== rightStarts) {
    return leftStarts ? -1 : 1;
  }

  return left.localeCompare(right, undefined, { sensitivity: "base" });
}

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function formatMetric(
  value: number | null,
  unit: string,
  unavailable: string
) {
  return value === null ? unavailable : `${value}${unit}`;
}

function ChipButton({
  selected,
  children,
  onClick,
}: {
  selected?: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cx(
        "inline-flex min-h-10 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
        selected
          ? "border-[color:var(--primary)] bg-[color:var(--primary)]/12 text-[color:var(--foreground)]"
          : "border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)] hover:border-[color:var(--primary)] hover:bg-[color:var(--accent)]"
      )}
      aria-pressed={selected}
      onClick={onClick}
    >
      {selected ? <Check className="h-4 w-4" /> : null}
      <span>{children}</span>
    </button>
  );
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
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--card)] p-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-[color:var(--foreground)]">{title}</p>
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
          <div key={item.label} className="rounded-[var(--radius-md)] bg-[color:var(--background)] px-3 py-3">
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
  brandFilter,
  onBrandFilterChange,
  selectedBrandName,
  onBrandSelect,
  messages,
}: {
  brands: BrandOption[] | undefined;
  brandFilter: string;
  onBrandFilterChange: (value: string) => void;
  selectedBrandName?: string;
  onBrandSelect: (brand: BrandOption) => void;
  messages: DashboardMessages;
}) {
  const copy = messages.bikeForm.fields.geometryLink;

  return (
    <SectionShell
      title={copy.standardBrand.label}
      description={
        brands === undefined
          ? copy.loadingBrands
          : brands.length === 0
            ? copy.noBrands
            : copy.standardBrand.helper
      }
    >
      <Input
        label={copy.standardBrand.label}
        value={brandFilter}
        placeholder={copy.standardBrand.placeholder}
        onChange={(event) => onBrandFilterChange(event.target.value)}
        autoComplete="off"
      />
      {brands === undefined ? null : brands.length === 0 ? (
        <EmptyChipState message={copy.noBrands} />
      ) : (
        <div className="flex flex-wrap gap-2">
          {brands.map((brand) => (
            <ChipButton
              key={String(brand.brandId)}
              selected={selectedBrandName === brand.name}
              onClick={() => onBrandSelect(brand)}
            >
              {brand.name}
            </ChipButton>
          ))}
        </div>
      )}
    </SectionShell>
  );
}

function Phase2ModelSelector({
  models,
  modelFilter,
  onModelFilterChange,
  selectedBrandName,
  selectedModelFamilyKey,
  selectedModelId,
  onClearBrand,
  onModelSelect,
  onYearSelect,
  messages,
}: {
  models: ModelFamilyOption[] | undefined;
  modelFilter: string;
  onModelFilterChange: (value: string) => void;
  selectedBrandName: string;
  selectedModelFamilyKey?: string;
  selectedModelId?: string;
  onClearBrand: () => void;
  onModelSelect: (family: ModelFamilyOption) => void;
  onYearSelect: (family: ModelFamilyOption, option: ModelYearOption) => void;
  messages: DashboardMessages;
}) {
  const copy = messages.bikeForm.fields.geometryLink;
  const selectedFamily =
    models?.find((family) => family.modelKey === selectedModelFamilyKey) ?? null;

  return (
    <SectionShell
      title={copy.standardModel.label}
      description={
        models === undefined
          ? copy.loadingModels
          : models.length === 0
            ? copy.noModels
            : copy.standardModel.helper
      }
    >
      <SelectedBadge label={selectedBrandName} onClear={onClearBrand} />
      <Input
        label={copy.standardModel.label}
        value={modelFilter}
        placeholder={copy.standardModel.placeholder}
        onChange={(event) => onModelFilterChange(event.target.value)}
        autoComplete="off"
      />
      {models === undefined ? null : models.length === 0 ? (
        <EmptyChipState message={copy.noModels} />
      ) : (
        <div className="flex flex-wrap gap-2">
          {models.map((family) => (
            <ChipButton
              key={family.modelKey}
              selected={family.modelKey === selectedModelFamilyKey}
              onClick={() => onModelSelect(family)}
            >
              {family.name}
            </ChipButton>
          ))}
        </div>
      )}
      {selectedFamily?.yearSelectionRequired ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-[color:var(--foreground)]">
            {copy.year.label}
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedFamily.yearOptions.map((option) => (
              <ChipButton
                key={String(option.modelId)}
                selected={String(option.modelId) === selectedModelId}
                onClick={() => onYearSelect(selectedFamily, option)}
              >
                {option.yearLabel ??
                  copy.year.unknownOptionLabel.replace(
                    "{count}",
                    String(option.sizeRecordCount)
                  )}
              </ChipButton>
            ))}
          </div>
          <p className="text-sm text-[color:var(--muted-foreground)]">{copy.year.helper}</p>
        </div>
      ) : null}
    </SectionShell>
  );
}

function Phase3SizeSelector({
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

  return (
    <SectionShell title={copy.size.label} description={copy.size.helper}>
      <SelectedBadge label={selectedLabel} onClear={onClearModel} />
      {sizeOptions === undefined ? (
        <EmptyChipState message={copy.loadingModels} />
      ) : sizeOptions.length === 0 ? (
        <EmptyChipState message={copy.noModels} />
      ) : (
        <div className="flex flex-wrap gap-2">
          {sizeOptions.map((size) => (
            <button
              key={String(size.recordId)}
              type="button"
              className={cx(
                "inline-flex min-h-10 items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition",
                String(size.recordId) === selectedRecordId
                  ? "border-[color:var(--primary)] bg-[color:var(--primary)] text-[color:var(--primary-foreground)]"
                  : "border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)] hover:border-[color:var(--primary)] hover:bg-[color:var(--accent)]"
              )}
              aria-pressed={String(size.recordId) === selectedRecordId}
              onClick={() => onSizeSelect(size)}
            >
              {size.sizeLabel}
            </button>
          ))}
        </div>
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
              setState((current) => {
                return {
                  ...current,
                  customModel: event.target.value,
                };
              })
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
  const [brandFilter, setBrandFilter] = useState(state.standardBrand ?? "");
  const [modelFilter, setModelFilter] = useState(state.standardModel ?? "");
  const [customOpen, setCustomOpen] = useState(
    state.customBrandEnabled || state.customModelEnabled
  );
  const brands = useQuery(api.geometry.queries.listBrandsForRider, {});
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

  const customDisclosureOpen =
    customOpen || state.customBrandEnabled || state.customModelEnabled;

  const filteredBrands = useMemo(() => {
    if (brands === undefined) {
      return undefined;
    }

    return (brands as BrandOption[])
      .filter((brand) => brand.hasUsableModels)
      .filter((brand) => matchesAutocompleteQuery(brand.name, brandFilter))
      .sort((left, right) => compareAutocompleteMatches(left.name, right.name, brandFilter));
  }, [brandFilter, brands]);

  const filteredModels = useMemo(() => {
    if (models === undefined) {
      return undefined;
    }

    return (models as ModelFamilyOption[])
      .filter((family) => family.hasUsableSizes)
      .filter((family) => matchesAutocompleteQuery(family.name, modelFilter))
      .sort((left, right) => compareAutocompleteMatches(left.name, right.name, modelFilter));
  }, [modelFilter, models]);

  const selectedModelFamily =
    models?.find((family) => family.modelKey === state.standardModelFamilyKey) ?? null;
  const selectedYearOption =
    selectedModelFamily?.yearOptions.find(
      (option) => String(option.modelId) === state.standardModelId
    ) ?? null;
  const selectedModelLabel = [
    state.standardBrand,
    selectedModelFamily?.name ?? state.standardModel,
    selectedYearOption?.yearLabel,
  ]
    .filter(Boolean)
    .join(" · ");

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

      {!customDisclosureOpen ? (
        <>
          <Phase1BrandSelector
            brands={filteredBrands}
            brandFilter={brandFilter}
            onBrandFilterChange={setBrandFilter}
            selectedBrandName={state.standardBrand}
            onBrandSelect={(brand) => {
              setBrandFilter(brand.name);
              setModelFilter("");
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

          {state.standardBrandId ? (
            <Phase2ModelSelector
              models={filteredModels}
              modelFilter={modelFilter}
              onModelFilterChange={setModelFilter}
              selectedBrandName={state.standardBrand ?? ""}
              selectedModelFamilyKey={state.standardModelFamilyKey}
              selectedModelId={state.standardModelId}
              onClearBrand={() => {
                setBrandFilter("");
                setModelFilter("");
                setState((current) =>
                  applyStandardBrandSelection(current, {
                    brandId: undefined,
                    brandName: undefined,
                  })
                );
              }}
              onModelSelect={(family) => {
                setModelFilter(family.name);
                setState((current) => {
                  const familyState = applyStandardModelFamilySelection(current, {
                    modelFamilyKey: family.modelKey,
                    modelName: family.name,
                  });

                  if (!family.yearSelectionRequired && family.yearOptions[0]) {
                    return applyStandardModelVariantSelection(familyState, {
                      modelId: String(family.yearOptions[0].modelId),
                      modelName: family.name,
                    });
                  }

                  return familyState;
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
          ) : null}

          {state.standardModelId ? (
            <Phase3SizeSelector
              selectedLabel={selectedModelLabel}
              onClearModel={() => {
                setModelFilter("");
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
