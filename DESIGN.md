# Design direction

## Product world

Lab is a bench notebook: experiments are specimens pinned beside an instrument readout, with an observation field that keeps the next question attached to the result. It is a local trace-making tool, not a simulated research platform.

## Visual system

- Palette: aged paper `#eee7d7`, ink `#24231e`, bench green `#4d6b55`, instrument amber `#c77b31`, and alert red `#a84e3c`.
- Type: `Libre Baskerville` for notebook headings and `Roboto Mono` for instrument labels, dates, and states.
- Composition: instrument hero, readout strip, ruled observation log, and a pinned-note intake form.
- Motion: state changes are restrained; reduced-motion mode removes nonessential movement.

## Interaction and boundary

Experiments can be searched, filtered, logged, moved between draft/active/done, and removed. Entries persist in `localStorage`. There is no research backend, collaboration, measurement ingestion, or scientific claim behind the sample records.

## Responsive behavior

The instrument and log stack vertically on mobile. Each observation keeps its number, area, state, and removal control readable without horizontal overflow.
