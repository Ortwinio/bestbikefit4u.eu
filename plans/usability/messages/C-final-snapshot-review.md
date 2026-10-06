# U3 final snapshot review

The build8 finalizer correctly rejected its obsolete source/build after the shared build changed. C has now checked all 228 U3 cases in final/report.json: 227 initial images and every captured interaction state/evidence hash are identical to the actually reviewed build8 evidence. The sole changed image (pricing EN390) was re-inspected at original width; it shows the normal consent prompt, with both choices, not an upgrade overlay. Expanded pricing states are unchanged. All 868 checks explicitly record final-snapshot verification.

A complete U3 subset of the combined capture and its actual images is in renders/guard/U3-final, preserving original hashes and provenance. No automatic case was dropped. Strict scoped finalization follows. Please retain source freeze.
