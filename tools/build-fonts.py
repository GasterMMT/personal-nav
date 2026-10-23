"""Build the three small WOFF2 subsets used by the site.

Run after changing visible copy:

    pip install fonttools brotli
    python tools/build-fonts.py

The Yozai source is a reserved-name font, so its web subset is renamed to
"Sky Hand" before it is saved. Its OFL license is kept in assets/fonts.
"""

from __future__ import annotations

import shutil
import urllib.request
from html import unescape
from html.parser import HTMLParser
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
FONT_DIR = ROOT / "assets" / "fonts"
CACHE_DIR = ROOT / "tools" / ".font-cache"

SOURCES = [
    {
        "filename": "NotoSansSC-VF.ttf",
        "destination": "noto-sans-sc-subset.woff2",
        "url": "https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf",
        "windows": Path(r"C:\Windows\Fonts\NotoSansSC-VF.ttf"),
        "rename": None,
    },
    {
        "filename": "Outfit-Variable.ttf",
        "destination": "outfit-subset.woff2",
        "url": "https://raw.githubusercontent.com/google/fonts/main/ofl/outfit/Outfit%5Bwght%5D.ttf",
        "windows": None,
        "rename": None,
    },
    {
        "filename": "Yozai-Medium.ttf",
        "destination": "sky-hand-subset.woff2",
        "url": "https://github.com/lxgw/yozai-font/releases/download/v0.868/Yozai-Medium.ttf",
        "windows": None,
        "rename": "Sky Hand",
    },
]

EXTRA_CHARS = (
    "，。、；：？！“”‘’（）《》〈〉「」『』【】〔〕"
    "…—–·～×÷©®↑↓←→↗↖•°"
)


class VisibleText(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []
        self._skip = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in {"script", "style"}:
            self._skip += 1

    def handle_endtag(self, tag: str) -> None:
        if tag in {"script", "style"}:
            self._skip = max(0, self._skip - 1)

    def handle_data(self, data: str) -> None:
        if not self._skip:
            self.parts.append(data)


def collect_text() -> str:
    parser = VisibleText()
    for page in sorted(ROOT.glob("*.html")):
        parser.feed(page.read_text(encoding="utf-8"))
    visible_text = unescape("".join(parser.parts))
    ascii_chars = "".join(chr(code) for code in range(0x20, 0x7F))
    return visible_text + ascii_chars + EXTRA_CHARS


def get_source(source: dict) -> Path:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cached = CACHE_DIR / source["filename"]
    if cached.exists():
        return cached
    local = source.get("windows")
    if local and local.exists():
        shutil.copy2(local, cached)
        return cached
    print(f"Downloading {source['filename']} ...")
    urllib.request.urlretrieve(source["url"], cached)
    return cached


def rename_font(font: TTFont, family: str) -> None:
    names = {
        1: family,
        2: "Regular",
        3: f"{family} web subset",
        4: family,
        6: family.replace(" ", ""),
        16: family,
        17: "Regular",
        21: family,
        22: "Regular",
        25: family.replace(" ", ""),
    }
    name_table = font["name"]
    for record in name_table.names:
        if record.nameID not in names:
            continue
        value = names[record.nameID]
        try:
            record.string = value.encode(record.getEncoding())
        except Exception:
            record.string = value.encode("utf-16-be")
    if "OS/2" in font:
        font["OS/2"].usWeightClass = 500


def build_subset(source: Path, destination: Path, text: str, rename: str | None) -> None:
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["kern", "liga", "locl"]
    options.name_IDs = ["*"]
    options.notdef_outline = True
    options.recommended_glyphs = True

    font = subset.load_font(source, options)
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(text=text)
    subsetter.subset(font)
    if rename:
        rename_font(font, rename)
    destination.parent.mkdir(parents=True, exist_ok=True)
    font.save(destination)
    font.close()


def main() -> None:
    text = collect_text()
    unique_codepoints = {ord(char) for char in text if not char.isspace()}
    print(f"Subsetting {len(unique_codepoints)} unique characters")

    for source in SOURCES:
        source_path = get_source(source)
        destination = FONT_DIR / source["destination"]
        build_subset(source_path, destination, text, source["rename"])
        size_kb = destination.stat().st_size / 1024
        print(f"  {destination.name}: {size_kb:.1f} KB")


if __name__ == "__main__":
    main()
