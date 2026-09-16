# Budget Planner beta — v17 fixes and validation

This package updates the local app build. It has not been deployed to the live domain. The checks below use an isolated DOM environment and mocked Google Drive responses, not customer financial data.

## Changes

- Replaced the text-plus-hidden date fields with one labeled native date input. Dates use the device's display format and an ISO value internally. Calendar validity, supported years and month updates are checked before saving.
- Removed hard-coded peso amounts from initial HTML. Startup now formats Income and Analytics immediately using the saved or detected currency. Chart descriptions, printable charts, expense labels and data-viewer captions identify the currency. Changing currency never converts the numeric amounts.
- Standardized action controls to at least 48 CSS pixels. Preserved meaningful labels on icon buttons and added labels to row-deletion checkboxes and a visible keyboard focus outline.
- Changed viewer headings and interface messages to My Budget and My Expenses. Internal worksheet names MyBudget and MyExpenses remain unchanged.
- Repeated budget-month duplication updates matching target items instead of adding duplicate rows. Other target items are retained.
- IndexedDB recovery stores committed records instead of unsaved form drafts.
- Drive reconnection compares saved local and remote records with the last shared copy. Independent changes and deletions are merged; detected conflicting edits pause sync and preserve both copies.
- Serialized uploads within a tab, added remote-version checks during reading and before writing, and changed first-file creation to upload metadata and workbook content together.
- Updated offline cache to v17 and included the sync comparison module.

## Automated checks

Run `tests/hardening.cjs` with Node and the development dependencies `jsdom` and `fake-indexeddb`. No Google credentials are required. These are DOM/logic tests; canvas drawing is stubbed, so they verify values and descriptions rather than pixel layout.

| Check | Result |
|---|---|
| Single date input, leap-day validity, invalid-date rejection, month alignment | Passed |
| Repeated budget and income month duplication, including deductions | Passed |
| Expense entry retains 125.50 and resets fields | Passed |
| Selected budget-row deletion removes exactly one row | Passed |
| USD/EUR/JPY/PHP updates Income, KPIs, chart descriptions and printable output | Passed |
| Icon-only controls have labels; viewer headings use readable names | Passed |
| USD Excel export and re-import preserve income, deductions and centavos | Passed |
| Merge retains local-only records; Replace restores workbook records | Passed |
| IndexedDB restores all three datasets after localStorage removal | Passed |
| Three-way comparison retains deletions and independent edits; conflicting matching records pause | Passed |
| Mocked Drive reconnect merges before uploading; changed remote version cancels upload | Passed |
| First Drive workbook creation includes its content without an empty placeholder | Passed |

## Remaining release gates

1. **Physical Safari and Chrome:** browser binaries could not be downloaded in this environment. Test iPhone Safari, installed iPhone PWA, Android Chrome and a 360px device. Open the date picker, cancel it, change month/year, choose February 29, clear the date, save, rotate the device and reopen. Confirm only one date control, no clipped fields and reachable bottom buttons.
2. **Actual Google authorization:** verify cancellation, denied access, expired token, account switching, close/reopen, offline edits, reconnect and a second device using a test account. Mocked requests do not certify OAuth or actual Drive behavior.
3. **Simultaneous cloud writes:** the version check and upload are separate operations. Another device can still write between them. A server-enforced conditional write/transaction design is needed before claiming conflict-free concurrent editing. Within-tab serialization does not serialize other tabs or devices.
4. **Expense identity:** expense matching still uses its date, payee, item, category and amount. Concurrent edits to the same original expense can appear as separate new records. Stable record IDs and a migration plan are still needed for reliable automatic reconciliation of that case. Review totals manually after concurrent edits.
5. **Spreadsheet applications:** test actual Excel and Google Sheets editing/recalculation, then import the saved workbook. The standalone Analytics template is limited to 1,000 input rows per data sheet and 30 categories. Currency is a label, not exchange-rate conversion.

## Physical destructive-data scenario

Use a separate test account and retain the exported workbook. Enter a January budget of 1,000; income of 5,000 with deductions of 500 and 100; and an expense of 125.50. Duplicate Budget and Income to February twice. Verify two monthly records, not three. Edit February, delete a chosen row, export, close/reopen, import with Merge, and repeat with Replace. Compare Budget, gross income, deductions, Net Income, Expenses and Available Balance against the workbook after each step.

Disconnect the network, save another expense, close/reopen offline, reconnect, and verify it survives. On a second device, make an independent change and then conflicting changes. Confirm a detected conflict preserves both copies and shows a readable message. Avoid simultaneous editing of the same account during beta.

**Status: improved beta; not certified as fully hardened.**
