# Housewalk V4 — V5 sunlit correction review

This focused pass continues PR #6 (`c5ac96d`) on
`codex/v5-sunlit-alcove-refinement`. The existing local Three.js/PBR/GLB engine,
controls and Canvas fallback remain. Only `v4/` changes; no merge or deploy.

See [actual V5 screenshots and checklist](V5_QA.md),
[reference audit / geometry and material notes](V5_REVIEW.md), and
[derived model plan](qa/v5-sunlit/plan.svg).

```sh
python3 -m http.server 8000 --bind 127.0.0.1
# Open http://127.0.0.1:8000/v4/
```

The sunny living alcove is enclosed real geometry with continuous oak and a
level ceiling. The approved furniture positions remain. Bedroom AC clearance,
open curtains, layered bedding, fixed-wall mirrors, one corner cabinet and the
occluded cat runner are modeled. The toilet is remodelled in the retained
bathroom layout. No private source photograph, original plan or collage is a
runtime asset. The shelf frame uses a neutral insert for privacy.

Walking/look, joystick, collisions, doors, map/labels, tours, day/night and
context recovery remain. Visual fidelity is for owner review; authored cloth,
indirect lighting and the shared outdoor context remain approximations.
Physical iPhone Safari performance is **UNVERIFIED**.

PR #6 documentation is historical: [INTEGRATED_V3.md](INTEGRATED_V3.md) and
[QA.md](QA.md). Earlier captures remain unchanged.
