# Basic verification results

See README for the mobile manual checklist. Browser automation can check that the Canvas produces non-uniform pixels, that the room tour and map controls work, and that no errors occur in a Chromium iPhone-sized viewport. **A simulated viewport does not replace testing on a real iPhone/Safari.**

Verification in headless Chromium on 2026-11-10:

- Mobile-emulated 390×844 viewport: Canvas rendered 142 distinct sampled colors; tour, map, day/night, reset controls passed; no page JavaScript errors.
- Desktop 1280×800 viewport: Canvas rendered 134 distinct sampled colors; tour, map, day/night, reset, and keyboard/mouse smoke checks passed; no page JavaScript errors.
- The local test harness used `page.set_content` because the execution environment blocks browser requests to local HTTP servers.
- Actual iPhone Safari testing after deployment remains outstanding.