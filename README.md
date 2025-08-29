# Lighthouse Scene

A responsive, animated lighthouse scene featuring day/night theming, dynamic stars and shooting stars, drifting clouds, parallax, ambient sound, and a three-mode lighthouse beam (moving, emergency, off). Built with accessibility and performance in mind as a static web app using semantic HTML, modular CSS, and modern JavaScript APIs like IntersectionObserver and the Fullscreen API.

---

## Features

- **Day/Night Theme**: Toggle between light (day) and dark (night) modes with animated sky, sun/moon transitions, and contextual elements (stars at night, clouds by day).
- **Dynamic Stars**: Twinkling stars with varying intensity, pulsing variants, and randomized density based on screen size.
- **Shooting Stars**: Randomized angle, duration, and delayed runs across the night sky.
- **Animated Birds**: Sine-wave vertical drift, separate daytime and nighttime flocks, continuous looping motion.
- **Three-Mode Lighthouse Beam**: Moving beam, emergency flashing sweep, and off state, toggleable by clicking the lighthouse or lantern.
- **Ambient Ocean Audio**: Play/pause control with initial muted state for user-gesture compliance.
- **Parallax Background**: Subtle depth effect driven by scroll position.
- **Staggered Animations**: Reveal elements efficiently on scroll using IntersectionObserver.
- **Fullscreen Mode**: Optional immersive mode via button or `F` key using the Fullscreen API.
- **Accessibility**: Reduced-motion handling, visible focus states, and skip link support.
- **Performance Optimizations**: Debounced resize, `requestAnimationFrame` updates, DOM caching, and CSS hints (`will-change`, `backface-visibility`).

---

## Project Structure

index.html — Main HTML document with containers for stars, clouds, lighthouse, waves, birds, and controls.
styles.css — Responsive styling, theme variables, animations, beam modes, accessibility rules.
script.js — LighthouseScene controller: initializes scene, creates dynamic elements, handles events and animations.
assets/ — Optional folder for audio (e.g., ocean-waves.mp3/.ogg).


---

## Getting Started

1. Clone or download the project files into a local folder.
2. Open `index.html` in a modern browser to run the scene locally.
3. (Optional) Serve via a local static server if testing cross-origin audio or stricter CSP setups.

---

## Usage

- **Theme**: Click the theme toggle in the top-left to switch between day and night.
- **Sound**: Click the sound toggle to play/pause ocean audio (initial state is muted).
- **Lighthouse Modes**: Click the lighthouse body or lantern to cycle through moving → emergency → off.
- **Fullscreen**: Click the fullscreen control or press `F` to enter/exit fullscreen.
- **Scrolling**: Smooth scroll enhances navigation; parallax background follows scroll position.

---

## Controls and UI

- `#themeToggle` — Button to switch day/night theme.
- `#soundToggle` — Button to toggle ocean audio (`#oceanSound`).
- Fullscreen — Button (`#right-button`) or `F` key toggles immersive mode.
- Mode Indicator — Lighthouse beam states update classes (`beam-moving`, `beam-emergency`, `beam-off`) along with lantern visuals.

---

## Architecture

- **Controller**: `LighthouseScene` class initializes, caches DOM nodes, binds events, and manages stars, shooting stars, clouds, and birds.
- **Animations**: `requestAnimationFrame` drives beam rotation; CSS keyframes handle twinkle, shooting stars, waves, and pulses.
- **Observers**: IntersectionObserver handles staggered reveal-on-scroll efficiently.
- **Responsiveness**: CSS `clamp()`, media queries, and custom properties adapt the scene to all screen sizes.

---

## Configuration

- **JavaScript CONFIG**: Adjust counts, sizes, durations, delays, and breakpoints for stars, shooting stars, clouds, and birds.
- **Lighthouse Modes**: Managed via `lightModes` array and `updateLightMode()`.
- **CSS Variables**: Adjust theme colors, timing, and glow intensities via `:root` in `styles.css`.
- **Accessibility**: Modify reduced-motion behavior in CSS and in `setupAccessibility()` logic.

---

## Accessibility

- Honors `prefers-reduced-motion` to minimize animations.
- Focus visibility for keyboard and screen-reader users.
- Skip link pattern included for easier navigation.

---

## Performance

- Uses `will-change` and `backface-visibility` for smooth animations.
- `requestAnimationFrame` throttles dynamic updates; resize events are debounced.
- IntersectionObserver delays entrance effects until elements approach viewport.

---

## Fullscreen Notes

- Uses `requestFullscreen`/`exitFullscreen` with fallbacks.
- `F` key and optional UI button toggle fullscreen.
- Listens to `fullscreenchange` events to update UI state.

---

## Troubleshooting

- **Audio doesn’t play**: Click the sound button; browsers require a user gesture.
- **Fullscreen blocked**: Ensure browser supports fullscreen and trigger via UI or `F` key.
- **Performance issues**: Enable reduced motion or reduce particle counts in CONFIG.
- **Mode cycling unresponsive**: Ensure clicks target lighthouse/lantern; avoid overriding beam classes in CSS.

---

## Contributing

- Adjust visuals via CSS custom properties and keyframes.
- Tweak behavior via CONFIG and `LighthouseScene` methods in `script.js`.
- Maintain accessibility and performance when increasing particle counts or animation durations.

---

## License

- Recommended: MIT License (add a `LICENSE` file to the project).

---

## Acknowledgments

- Inspired by professional README templates and open-source best practices.

---

## Quick Start (TL;DR)

1. Open `index.html` in a modern browser.
2. Toggle theme, sound, fullscreen, and click the lighthouse to cycle beam modes.
3. Adjust CONFIG to optimize visuals and performance for your device.
