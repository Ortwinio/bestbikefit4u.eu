# R8 view contract

AdviceGroupsView props exactly {groups:AdviceGroup[],locale:Locale,bikes:Array<{_id:string;name:string}>,onOpenAdvice?:(item:AdviceItem)=>void}. Pure presentation + local all/rider/bike filter; no backend hooks or mutations. Seven groups always retained, empty groups explained. Known numeric values localized; string frame sizes preserved verbatim without extra units. Unknown provenance never labeled current; per-item engine confidence only, no group average or inferred applied/waiting/mark-done.

Dictionary exports adviceCopy[locale] and getAdviceCopy(locale) for view labels/groups/fields/units/stale reasons/improvements only. Parent's separate advicePage.ts and profileSections.ts own route/header/tabs/recalculation copy. View offers localized source links (onOpenAdvice is optional click notification and does not replace the href). Types are exported as AdviceGroupsViewProps.

Improvements: positive finite theoretical gains only, descending, max three per group. Generic localized unknown-key fallback, no raw internal keys. No Pro footer: the board's promised combined plan/follow-up benefits are not represented in this API. A sidebar untouched. Parent/Franklin handles full route captures after mount.
