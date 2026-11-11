# Housewalk V4 — integrated final-reference review

This targeted branch continues the latest PR #5 head (`a96da34`), including
PR #2–4. The existing Three.js/PBR/GLB renderer and interaction bridge remain.
Only `v4/` changes; production root, main and Daylight are untouched. No deploy
or merge is included.

All 19 corrected references were inspected. Living/dining, kitchen and entrance
arrangements are retained, with refined oak/drapery and a contacting white TV
console plinth. The approved bedroom, under-AC cabinet, hallway transition and
two-view bathroom now occupy the same continuous apartment. Real 3D geometry,
local material maps and actual mirror reflections are used. No source image is
a scene background or panorama, and no private photo/floor plan is committed.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
# Open http://127.0.0.1:8000/v4/
```

See [screenshots and PASS/PARTIAL/FAIL review](QA.md), [reference/implementation
provenance](INTEGRATED_V3.md), and [model plan](qa/integrated-v3/plan.svg).
Older `qa/final/` and `review/` evidence remains historical.

Walking/look, joystick, collisions, doors, map/labels, tours, day/night and the
Canvas compatibility renderer remain. Visual acceptance is for owner review;
this is not a pixel-identical offline render. Physical iPhone Safari performance
is **unverified**.
