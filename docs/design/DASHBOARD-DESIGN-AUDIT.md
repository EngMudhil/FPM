# DASHBOARD-DESIGN-AUDIT

Status: Reference (imported from original FPM dashboard design audit).  
Owner: Frontend.  
Source: Original `artifacts/fpm` dashboard UI observation (no application changes in the audit itself).

Use this document as the **visual/interaction fidelity checklist** for `/dashboard`. Financial formulas remain governed by ADR-014 / `@fpm/financial`.

## Page structure (top → bottom)

1. Application shell + sidebar  
2. Main funded-portfolio hero  
3. Conditional pending-withdrawal alert  
4. Funded Business section + KPI cards  
5. Funded Business Snapshot  
6. Performance charts (lifetime + payout trend / income by firm)  
7. Recent Withdrawals + Monthly Payouts  
8. Conditional Real Accounts section (only if ≥1 broker account)  
9. Combined Business Overview  

Root spacing: **20px** vertical gap; **48px** bottom padding.

## Shell / sidebar (summary)

* Sidebar expanded ~256px / collapsed ~72px; mobile overlay + hamburger  
* Brand: 32×32 blue gradient “F”; FPM 14px bold; Portfolio Manager 10px muted  
* Nav sections: funded modules, Real Accounts → Broker Accounts, Reports, Settings (expandable)  
* Active: `#1D4ED8` on pale blue; hover `#F1F5F9`; item radius 12px  

Spec/ADR-008 IA labels may differ from screenshot “FUNDED” wording; visual chrome should still match this audit.

## Typography / color (summary)

* Primary text `#0F172A`, secondary `#64748B`, muted `#94A3B8`, border `#E2E8F0`  
* Hero capital: `clamp(2.6rem, …, 3.75rem)`, tabular nums  
* Section title 16px bold; description 12px  
* Funded KPI values ~26px; real KPI ~23px; combined ~28px  

## Formatting rules

* **Funded** amounts: USD, **0** decimal places; compact notation at ≥ $1M  
* **Real** amounts: USD, **2** decimal places (always show cents)  
* Dates: en-US short month/day; UTC where applicable  
* ROI/yield: signed; one decimal on hero ROI / yield display where reference shows it  

## Key UI behaviors

* Pending alert only when pending count > 0 (amber)  
* Quarter/Year cards expose previous/next controls (period navigation)  
* Income by Firm: max **5**, ranked, pink progress ~5px  
* Profit by Broker/Account: max **5**, green/red bars  
* Real hero: green gradient if P/L ≥ 0, rose/red if negative  
* Lists: first row highlighted (pale blue + border); natural height (no inner scroll)  
* Lifetime chart: purple theme; monthly bars: blue gradient  

## Empty states

No withdrawals / no PAID withdrawals / no broker data / no largest withdrawal / empty charts.
