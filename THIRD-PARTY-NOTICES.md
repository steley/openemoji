# Third-party notices

This project builds a static emoji dictionary. The **code** is MIT (see `LICENSE`).
The **emoji artwork and data** shipped into `site/` come from third parties under
their own licenses. They are installed at build time via npm and copied into
`site/assets/` by `generate.mjs`.

## Emoji artwork

| Source | npm package | License | Copied to |
| --- | --- | --- | --- |
| [OpenMoji](https://openmoji.org/) | `openmoji@15.0.0` | **CC BY-SA 4.0** | `site/assets/openmoji/` |
| [Twemoji](https://github.com/jdecked/twemoji) | `@discordapp/twemoji@14.0.2` | Graphics **CC BY 4.0**, code MIT | `site/assets/twemoji/` |
| [Noto Emoji](https://github.com/googlefonts/noto-emoji) | `emoji-datasource-google@16.0.0` | Apache-2.0 (package MIT) | `site/assets/noto/` |

### What CC BY-SA 4.0 means for you

OpenMoji artwork is share-alike. If you deploy a site built from this repo:

- **Attribution is required.** The generated footer already credits OpenMoji,
  Twemoji and Noto with links — keep it, or put the same credits somewhere
  equally visible.
- **Share-alike applies to the artwork, not to your code.** Modified OpenMoji
  SVG files (recolored, cropped, combined) must stay under CC BY-SA 4.0. Your
  HTML/CSS/JS that merely embeds or references them is not forced to BY-SA.
- If you need a fully permissive output, run the generator with only the
  Twemoji / Noto sources enabled, or drop the `site/assets/openmoji/` directory.

## Data

| Source | npm package | License |
| --- | --- | --- |
| Emoji metadata (names, groups, keywords) | `unicode-emoji-json@0.4.0` | MIT |
| CLDR annotations, en + zh | `cldr-annotations-full@45.0.0` | Unicode License v3 |

Unicode data is used under the [Unicode License v3](https://www.unicode.org/license.txt).
This project is not affiliated with, endorsed by, or sponsored by the Unicode
Consortium.

## Hand-written content

Scene tags (`scenes.mjs`), kaomoji lists (`kaomoji.mjs`), trending picks
(`trending.mjs`) and the editorial copy (`editorial.mjs`, `editorial-en.mjs`,
`i18n.mjs`) are original to this project and covered by the MIT license.
