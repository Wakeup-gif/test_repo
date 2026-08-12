from pathlib import Path
import re

path = Path("tampermonkey/Adobe-Acrobat-US-Sign-Colors.user.js")
text = path.read_text(encoding="utf-8")
text = text.replace("// @version      1.1.0", "// @version      1.2.0", 1)
text = text.replace(
    "// @description  Dark graphite Acrobat Web colors with visible comment selection and Copy Comments. Leaves Adobe button styling untouched.",
    "// @description  Dark graphite Acrobat Web colors with native comment layout, color-only comment states, and Copy Comments. Leaves Adobe button styling untouched.",
    1,
)

pattern = re.compile(
    r'''    /\* Comment cards stay dark, but selected/focused comments are visibly distinct\. \*/.*?    /\* Preserve Acrobat PDF text highlights, annotations, ink and comment markers\. \*/''',
    re.S,
)

replacement = r'''    /* Comments: preserve Acrobat's native structure. Color changes only. */
    .${COMMENT_CARD} {
      color: var(--us-acrobat-text-soft) !important;
      background-color: #1a1f25 !important;
      border-color: rgba(255, 255, 255, 0.09) !important;
    }

    .${COMMENT_CARD}:hover {
      color: var(--us-acrobat-text) !important;
      background-color: #20262d !important;
      border-color: rgba(255, 255, 255, 0.13) !important;
    }

    .${COMMENT_CARD}.${COMMENT_SELECTED},
    .${COMMENT_CARD}:focus-within {
      color: var(--us-acrobat-text) !important;
      background-color: #252c34 !important;
      border-color: rgba(193, 204, 215, 0.30) !important;
    }

    .${COMMENT_CARD} :where(
      strong,
      b,
      [class*="author" i],
      [data-testid*="author" i]
    ) {
      color: #eef2f5 !important;
    }

    .${COMMENT_CARD} :where(
      time,
      [class*="time" i],
      [class*="date" i],
      [data-testid*="timestamp" i],
      [class*="resolved" i],
      [data-testid*="resolved" i]
    ) {
      color: #9ba5af !important;
    }

    /* Preserve Acrobat PDF text highlights, annotations, ink and comment markers. */'''

new_text, count = pattern.subn(replacement, text, count=1)
if count != 1:
    raise SystemExit(f"Expected to replace one comment styling block, replaced {count}")

path.write_text(new_text, encoding="utf-8")
