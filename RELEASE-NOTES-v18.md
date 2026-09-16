# v18 — Workbook XML crash fix

Addresses `Cannot read properties of undefined (reading 'getAttribute')` in the Analytics workbook exporter.

- Removes leading byte-order markers before parsing XML parts. The supplied template's workbook relationship file contains a UTF-8 BOM.
- Validates parsed XML before looking up worksheet relationships.
- Supports relationship-ID namespace/prefix fallback and common absolute/relative ZIP paths.
- Checks worksheet relationships, ZIP entries and required template sheets before populating financial data.
- Reports an actionable template error instead of dereferencing an absent relationship.
- Applies BOM normalization to workbook import and legacy XML import.
- Advances the offline cache to v18.

Regression checks reproduce the previous missing-relationship exception and verify the guarded error. A strict-parser simulation verifies BOM handling. All five worksheet links and all template XML parts are checked, along with malformed XML and missing-sheet cases. The existing data-integrity suite is rerun against this build.

Deploy the complete ZIP contents together, including analytics-workbook.js, analytics-template.xlsx, index.html and service-worker.js. Preserve browser data when updating. This package does not modify the live deployment automatically.

Real Safari/Chrome and authenticated Drive testing remain outstanding as documented in VALIDATION-v17.md.
