# Housewalk — mirrored home POV walkthrough

Housewalk is an early **first-person, walkable home layout prototype** based on the corrected 6.30 × 7.05 m floor plan, flipped horizontally. The **entrance is at the lower left** of the mirrored map, followed by **dining on the middle-left**, **living farther ahead**, with the **kitchen/pantry toward the lower middle**, **bedroom upper-right**, and **bathroom lower-right**.

**Real Rooms v3** has actual WebGL 3D furniture geometry, depth-tested walls, a custom material atlas, and a light-oak floor texture derived from a cropped wood-only sample photo. The three-seat grey sofa, four cream-seat black dining chairs, long white TV cabinet with grey top, empty black TV bracket, empty white rack, warm ceiling spotlights/fan, AC bump-out, and curtains are represented in the walkable room.

This is **not yet a photorealistic or measurement-accurate architectural reconstruction**: it is a more detailed, interactable concept based on user references. Bedroom and bathroom remain placeholders, and some surface/lighting details still need refinement.

## Play

- On iPhone or Android: open the **published HTTPS website in Safari or Chrome**, drag to look around, use the left-side joystick to move. Tap **Tour** to move between preset viewpoints, **Plan** to open the map, or **Open door** near a door.
- On a laptop/desktop: use **W/A/S/D** to move, drag with a mouse to look, **E** for doors, **M** for map, and **Shift** to move faster.
- Use the sun/moon control for day/night mode and the round arrow to return to the entrance.

There are **no external libraries, CDNs, API keys, accounts, databases, trackers, or build steps**. `webgl.js` provides an offline-capable, built-in WebGL renderer; the original Canvas 2D scene remains as an automatic compatibility fallback. The cropped wood-grain material texture is embedded in JavaScript; raw room photos and videos are not uploaded.

## Publish with GitHub Pages

The repository already contains the game. GitHub Pages serves `main` at **https://StevenChua1122.github.io/housewalk-home/**. If Pages was disabled, open repository Settings → Pages and select deploy from `main`, folder `/(root)`.

**Privacy warning:** GitHub Pages sites normally are public on the internet, even when a paid account allows the repository to be private. Do not upload address details, real photos, or other private data unless you're comfortable sharing them publicly. This prototype does not include the supplied source video, source plan images, or any raw furniture photo; only a cropped wood-grain-only material sample is embedded.

## Test checklist

- [ ] On mobile Safari, the room appears behind the controls (not a blank background)
- [ ] Joystick moves through the entrance, dining, and living zones
- [ ] Swiping rotates the view; no browser page scrolling
- [ ] Tour cycles through kitchen, bedroom, bathroom and resets
- [ ] Tapping Plan shows the mirrored plan with dining left of the entry-to-living route
- [ ] Bedroom and bathroom doors toggle when nearby
- [ ] Day/night toggle works
- [ ] PC keyboard and mouse controls work

## Development

For best results host the folder with a static local server (`python3 -m http.server 8000`) so the browser can load `webgl.js`. There is no `npm install` step.

Codex guidance lives in [AGENTS.md](AGENTS.md). Development should use a feature branch and pull request; review the changes before merging to `main` because GitHub Pages may auto-publish after a merge.