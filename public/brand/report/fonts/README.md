# Embedded report fonts

The Latin WOFF2 source subsets are the same Google Fonts binaries used by the application through
Next's font loader. They are bundled so Chromium renders reports without font network access.

- `bricolage-grotesque-latin.woff2`: original variable weight 200–800 source.
- `figtree-latin.woff2`: original variable weight 300–900 source.
- `bricolage-grotesque-{600,700,800}-latin.woff2`: static report heading instances.
- `figtree-{400,500,600,700,800}-latin.woff2`: static body and emphasis instances.
- `dm-mono-latin.woff2`: unchanged static weight 500 for measurements, dates and page numbers.

## Static instance provenance

Static instances were derived locally with fontTools 4.60.2 and
`fontTools.varLib.instancer.instantiateVariableFont(source, {"wght": weight}, inplace=True)`.
The source has only the weight axis; pinning it removes variable-font tables. WOFF2 flavor is retained.
Name records 1/16 retain the family; 2/17 use Regular, Medium, SemiBold, Bold or ExtraBold as applicable;
3/6 use the distinct family-without-spaces plus hyphen plus style; 4 uses family plus space plus style.
These names distinguish the embedded static weights in PDF font inspection.

The report CSS declares a separate font face for each static weight. Chromium emitted unnamed Type3
outline fonts from the variable sources; the static instances support named embedded PDF text fonts.
Keep the original sources for reproducible regeneration; they are not embedded by the report renderer.

The subsets include Dutch/English Latin text, punctuation and measurement symbols. Font licenses are
included beside the files, copied from the corresponding `google/fonts` OFL directories. Do not remove
these notices when redistributing the bundled fonts. No font files are downloaded at report runtime.
