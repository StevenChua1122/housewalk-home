# Housewalk V4 — final-reference reconstruction for review

This branch continues PR #4 (`codex/v4-architecture-review`, `e31a409`), including
PR #3 and PR #2. Only `v4/` changes. It does not deploy, merge, or replace the
production homepage.

The final seven-image pack has now been inspected. The horizontally mirrored
6.30 × 7.05 m source plan governs the connected shell; real photographs govern
window/entrance construction; final approved mockups govern the finishes.
Internal wall coordinates are image traces, not surveyed dimensions. Furniture,
heights and camera lenses remain explicitly identified estimates.

A focused rendering replacement uses self-hosted Three.js r180, PBR materials,
custom upholstered-sofa and draped-curtain GLBs, and dedicated oak colour,
normal and roughness maps. The existing first-person controls, joystick, doors,
collision logic, mini-map, room labels and tours remain in the same application.
No reference picture is rendered as a backdrop or panorama. No runtime CDN is used.
A simple Canvas compatibility view remains available when WebGL2 is unavailable.

## Local review

```sh
python3 -m http.server 8000 --bind 127.0.0.1
# Open http://127.0.0.1:8000/v4/
```

See [final implementation and reference provenance](FINAL_IMPLEMENTATION.md),
[actual screenshots and testing](QA.md), and the [model plan](qa/final/plan.svg).
Older `qa/` images outside `qa/final/` and `review/` artifacts are historical.

This is a substantial realtime rendering/material upgrade, with remaining
lighting, cloth and exterior differences from the approved render. Review the
actual screenshots before design approval. Physical iPhone Safari performance
is **unverified**.
