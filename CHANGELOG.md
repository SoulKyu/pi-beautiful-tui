# Changelog

All notable changes to this project will be documented in this file.

## 0.2.1 - 2026-08-02

### Changed

- Reduced the active footer timer from 250 ms to 1000 ms, matching its whole-second display precision.
- Added state-aware header render caching to avoid rebuilding static header lines on every 80 ms working-animation frame.

## 0.2.0 - 2026-08-02

### Added

- Six coordinated styles: Aurora, Jade Ink, Matrix, Industrial, Cosmos, and Mono.
- Theme-specific palettes, frames, progress bars, semantic icons, and continuous 80 ms working animations for every new style.
- Per-style thinking-level colors shared by the editor border, header, and footer indicator; editor text remains unmodified.
- Pi-native Bash mode border-color preservation in the custom editor.

## 0.1.1 - 2026-08-02

### Changed

- Replaced abrupt four-frame working indicators with continuous, theme-specific motion sequences.
- Standardized every working animation to Pi's native 80 ms frame interval.
- Added proper attribution for spinner sequences adapted from cli-spinners.

## 0.1.0 - 2026-08-02

### Added

- Seven coordinated visual styles with theme-specific Nerd Font icon packs and ASCII fallbacks.
- Custom Pi header, footer, editor frame, progress bars, and working indicators.
- English and Chinese settings available through `/pi-beautiful-tui`.
- Configurable session name, working directory, context, token, cache-hit, cost, timer, and extension-status segments.
- Per-run TPS, TTFT, duration, token, stream-stall, and cost telemetry adapted from pi-open-tui.

### Privacy

- No Git subprocesses, repository scans, runtime probes, analytics, or credential access.
- No changes to prompts, model requests, context, tools, messages, or session contents.
