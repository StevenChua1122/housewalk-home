# Basic verification results

See README for the mobile manual checklist. Browser automation can check that the Canvas produces non-uniform pixels, that the room tour and map controls work, and that no errors occur in a Chromium iPhone-sized viewport. **A simulated viewport does not replace testing on a real iPhone/Safari.**

Verification in headless Chromium on 2026-11-10:

- Mobile-emulated 390×844 viewport: Canvas rendered 142 distinct sampled colors; tour, map, day/night, reset controls passed; no page JavaScript errors.
- Desktop 1280×800 viewport: Canvas rendered 134 distinct sampled colors; tour, map, day/night, reset, and keyboard/mouse smoke checks passed; no page JavaScript errors.
- The local test harness used `page.set_content` because the execution environment blocks browser requests to local HTTP servers.
- Actual iPhone Safari testing after deployment remains outstanding.

## Real Rooms v3 WebGL verification (2026-11-10)

- Chromium via virtual X display (software WebGL1, `--use-angle=gl`), iPhone-sized (390×844) and desktop (1280×800): renderer initialized with a populated full-screen 3D scene, and no page JavaScript errors.
- Verified mirrored-plan room order, furniture/ceiling objects, atlas texture orientation, wood grain, empty TV mount, empty rack, three-seat sofa, wall bump-out, and proper occlusion.
- Tested opening/closing the plan modal, day/night mode, multi-stop guided tour, and moving camera via shared controls.
- A headless browser without WebGL falls back to the original Canvas 2D scene instead of showing a blank screen.
- **Still needs manual iPhone Safari check for performance, touch gesture feel and complete visual review.** WebGL textures/shading are a concept model, not the same quality as the photorealistic reference still.