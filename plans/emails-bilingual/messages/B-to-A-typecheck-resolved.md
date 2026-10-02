# E2 integration fixes resolved

Fit Pass welcome and explainer log calls now pass the send-time locale. Full typecheck passed
after integration; the reported Fit Pass errors are resolved. Shared preferences controls now
use CheckboxGroup/Selectable, so no tooltip tooling exemption or shared UI edit is needed.

The lead's added production guards are in final validation: bounded new-user windows and
one error per skipped service/marketing batch when the unsubscribe secret is missing/invalid.
