# UI-IMPROVEMENTS

Status: Authored (FPM-002).  
Owner: Frontend + Lead + QA.  
Only issues supported by inspection or clear product risk from observed UI.

| ID | Severity | Issue | Evidence | Recommendation |
| --- | --- | --- | --- | --- |
| UI-01 | High | Funded account identity weak (shown as `1` / `2`) | Accounts table (9); withdrawal account `FTMO - 2` | Prefer firm + account number/name + size in all lists |
| UI-02 | High | ROI shown as both `+8.1%` and `+8.05%` on same Dashboard | Screen 4 | Single rounding rule from Financial Domain |
| UI-03 | High | Destructive Delete adjacent to Edit without visible confirmation | Firms, Accounts, Withdrawals, Certificates | Confirm dialog + stronger danger styling |
| UI-04 | High | Restore is destructive; ensure always-visible confirm + typed confirm **RECOMMENDED** | Screen 25 warning exists but upload path easy | Keep warning; add explicit confirm step |
| UI-05 | Medium | Dashboard vs Reports metric duplication | Screens 1–3 vs 27 | Clarify information architecture; reduce duplicate KPIs or deep-link |
| UI-06 | Medium | Combined “Total Generated Profit” mixes funded payouts + real P/L | Screen 6 | Keep separate labels; avoid implying identical economics |
| UI-07 | Medium | Certificate card large $ vs certificate payout $ relationship unclear | Screen 16 vs 17 | Label fields (payout vs account size) explicitly |
| UI-08 | Medium | Analytics group labeling inconsistent (Reports alone vs ANALYTICS eyebrow) | Sidebar vs screen 27 | Consistent group header |
| UI-09 | Medium | No dedicated Brokers list | Only Add Broker (20) | Add Brokers list or manage from Real Accounts |
| UI-10 | Medium | Broker detail / deposit-withdrawal UI missing from inventory | Export mentions entities; View details uncaptured | Design detail + ledger screens |
| UI-11 | Medium | Audit DETAILS shows raw JSON | Screen 26 | Human-readable summary + expandable raw |
| UI-12 | Medium | Loading and error states not observed | All shots | Add skeletons/toasts/inline errors |
| UI-13 | Medium | Mobile/responsive behavior unknown | Desktop only | Define mobile nav (NAVIGATION.md) |
| UI-14 | Low | Website column often empty (`—`) | Firms (7) | Optional field OK; consider hide-empty |
| UI-15 | Low | Delete actions visually muted/disabled-looking | Multiple tables | Clarify enabled vs disabled |
| UI-16 | Low | Email “Not verified” with no verify CTA visible | Screen 23 | Add verify flow or hide until supported |
| UI-17 | Low | Quarter/year card chevrons unclear | Screen 2 | Affordance labels / aria |
| UI-18 | Critical | Currency aggregation risk if non-USD accounts added | All totals in `$` | Enforce currency-safe totals (FINANCIAL-RULES) |

Severity notes: Critical = correctness/safety; High = user harm or trust; Medium = usability; Low = polish.
