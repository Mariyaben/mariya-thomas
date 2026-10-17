# Shared ship clock

Mariya is always fixed to IST (UTC +05:30). Thomas starts 5h30 behind IST. Use Set difference to correct hours/minutes; ±1 hour applies ship adjustments.

Pair the phones once in Chat. Either phone can change the ship clock; encrypted updates sync while both apps are open and online. Each phone saves a versioned snapshot offline. Reconnects replay retained updates and request the latest snapshot from an online peer. Stale events cannot roll back newer changes. Concurrent edits converge deterministically.

If the relay cache expires while the phone holding the newest update is closed, open that phone too. There is no background clock synchronization. Both devices need v1.2. Old local-only clock settings migrate to the confirmed initial difference of 5h30 behind IST. Manual clock codes remain available.

Validation: clock conversion/day rollover; IST-relative records; encrypted two-client clock changes in both directions, stale rejection, offline persistence and reconnect after expired relay history; Android debug build.
