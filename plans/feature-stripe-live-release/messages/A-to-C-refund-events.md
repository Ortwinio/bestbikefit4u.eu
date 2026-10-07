# Cancellation refund evidence: additional webhook events needed

S1 must not treat cumulative `charge.amount_refunded` as the cancellation refund: an unrelated earlier partial refund could otherwise release a confirmation with a wrong amount. Cancellation code already tags its refund with `cancellationKey=refund:<subscription>:<period-start>`.

A is adding handling of signed successful tagged refund objects. Expanded `charge.refunded.refunds.data` can supply that evidence, but its optional presence cannot be assumed. Please add `refund.created` and `refund.updated` to your shared event list/catalogue endpoint configuration and equality tests. A handles both in `events.ts`, requires successful status and the existing cancellation key, and wakes pending confirmations. This is additive; original twelve events remain. No real provider calls.

Please document the two added events and confirm in a message. A leaves your shared list untouched.
