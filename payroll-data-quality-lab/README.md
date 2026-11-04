# Payroll Data Quality Lab

Hands-on practice for the core tasks of a **Data Management Analyst**: tracking incoming payroll files, mapping client data to a standard layout, finding data anomalies, comparing file formats, and running user acceptance tests (UAT).

> All companies, people and numbers in this workbook are fictional.

## Scenario

Ten client companies send payroll files every pay period. The analyst checks that every file arrived on time, finds files that failed or are missing, fixes data problems, and contacts the client when something is wrong.

## What I did

| Area | Task | Tools / skills |
|---|---|---|
| File tracking | Reviewed a report of 60 payroll files from 10 clients and flagged missing, failed and late files | Sort & Filter, VLOOKUP, IF formulas |
| Reporting | Summarized file status and error types | Pivot tables |
| **Data mapping** | Matched a client's 11 column names to a 9-field standard layout; flagged 2 fields as UNMAPPED and documented the next step | Data validation (dropdowns), SOP-based decisions |
| **Anomaly detection** | Found **7 of 7** hidden problems in a 25-employee payroll file | Check column (`=Hrs*Rate`), conditional formatting, duplicate detection |
| File formats | Compared the same data as CSV and XML | CSV headers & delimiters, XML tags & nesting |
| **UAT** | Executed test cases for new validation rules and recorded actual results and Pass/Fail | Test case design |

## Highlights

### File tracking (Sort & Filter)
Out of 60 payroll files from 10 clients:
- **6 missing** (never arrived) and **5 failed** in transmission. The most common failure was a **file naming issue**.
- 4 XML files had a formatting error (filtering two columns at once).

### VLOOKUP & IF formulas
- Enriched the tracking report with each client's name, contact email and SLA days from the client list:
  `=VLOOKUP(B2,Clients!$A$2:$G$11,2,FALSE)`. `FALSE` forces an exact match, and `$` locks the client table so it doesn't shift when the formula is copied down.
- Calculated **days late** and an automatic **file status** (On Time / Late / Missing / Failed) with nested IFs:
  `=IF(E2="","Missing",IF(H2="Failed","Failed",IF(E2>D2,"Late","On Time")))`
- Added an action column that says **"Contact client"** whenever a file is Missing or Failed:
  `=IF(OR(P2="Missing",P2="Failed"),"Contact client","OK")`

### Pivot tables
- **Status:** 34 On Time (**56.7%**), 15 Late, 6 Missing, 5 Failed.
- **Most common error:** Unmapped field (11), followed by Formatting error (10). I built a pivot chart to communicate the error trend to stakeholders.
- **Clients needing follow-up:** Golden Fields Foods and Lakeside Schools District, with 4 problem files each.
- **Workload:** Paola R. processed the most records (23,994).

### Data mapping
- Mapped abbreviated client fields (`EmpID`, `Hrs`, `PayDt`, `StartDt`...) to the standard layout, telling apart three different date fields (period end, pay date, hire date).
- Verified the mapping with the data itself: **Hours × Rate = Gross Pay** (84 × 29.54 = 2,481.36).
- **UNMAPPED fields:** `ShirtSize` (not needed for payroll, exclude per SOP) and `BonusCode` (may affect pay, so contact the client before processing).

### Anomalies found in the incoming payroll file

| Row | Employee | Problem | Check used |
|---|---|---|---|
| 5 | Linda Lee | Missing Employee ID | Missing data |
| 9 | Karen Wilson | Negative gross pay (-1,520.00) | Value makes sense? |
| 13 | Lisa Thomas | 160 hours; pay matches 76 h, so confirm with client | Hrs × Rate check |
| 17 | Helen Martin | Wrong date format (MM/DD/YYYY) | Date format |
| 21 | Ashley Wright | Pay date in the wrong year (2027) | Date makes sense? |
| 24 | Brian Scott | Gross pay 10× too high (decimal error) | Hrs × Rate check |
| 26 | Sarah Davis | Duplicate of E2006 (row 7) | Duplicate detection |

**Escalate first:** the missing Employee ID and the duplicate, because they can send pay to the wrong person or pay someone twice.

### My review method
For every incoming file I ask five questions:
1. Is anything **missing**?
2. Is anything **duplicated**?
3. Does the **math** add up (Hours × Rate = Gross Pay)?
4. Do the **values make sense** (no negative pay, realistic hours)?
5. Are the **dates** in the right format and the right year?

### UAT
Tested five validation rules (missing ID, negative pay, date format, duplicates, pay calculation). All passed.

I also spotted a gap: a pay date with a valid format but the **wrong year** (2027) isn't caught by any of those rules. So I wrote my own test case, **UAT-06: "PayDt must be in the current pay period year"**, which catches row 21.

## Files
- `My_Practice.xlsx`: the completed workbook
