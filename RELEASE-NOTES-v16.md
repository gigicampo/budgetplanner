# Budget Planner beta — Analytics workbook update

- Round currency-symbol button at the upper right opens currency selection.
- Log out is in the compact bottom cloud-status card.
- Home links read User Guide and Export Budget File; export uses a document/download icon.
- On-screen and printable graphs mark expenses above budget with a red bar and !.
- Export includes an independent Analytics dashboard with name, greeting, quote, currency, year/month filters, monthly/category chart, four KPIs, and over-budget analysis.
- Workbook income formulas count each category/month/year once while retaining individual deduction rows.
- Workbook import tolerates trailing formatted empty columns.

## Workbook use

Keep automatic calculation enabled in Excel. Currency selection changes labels only, not exchange rates. The workbook template supports 1,000 input rows per data sheet and 30 categories. Add custom category names in Analytics H39:H68. Extend source ranges and formulas before expanding these limits. App export reports a clear error if the limits are exceeded.

Budget-Planner-Freebie.xlsx contains illustrative sample data. App exports replace these samples with the user's records. Workbook changes return to the app through Import and its Merge/Replace review.

## Publishing and verification

Deploy all files together, including analytics-template.xlsx and analytics-workbook.js. Service worker cache v16 includes both for offline exports. This package has not been deployed automatically.

Verified workbook calculations, month filtering, deduction changes, formula errors, rendered dashboard, chart structure, and app export/import round trip. Physical mobile browsers, Google OAuth sessions and desktop Excel interactions still require device testing.
