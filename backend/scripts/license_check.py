"""Automated license and open-source attribution verification script for CI."""

import os
import sys

REQUIRED_FILES = [
    "LICENSE_NOTE.md",
    "LICENSE"
]

REQUIRED_NOTE_KEYWORDS = [
    "Swiss Ephemeris",
    "AGPL-3.0",
    "Astrodienst AG",
    "Professional License"
]


def check_license_integrity():
    root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    errors = []

    # 1. Verify existence of required license notes
    for fname in REQUIRED_FILES:
        fpath = os.path.join(root_dir, fname)
        if not os.path.exists(fpath):
            errors.append(f"Missing required license file: {fname}")

    # 2. Verify LICENSE_NOTE.md contains essential Swiss Ephemeris attribution
    note_path = os.path.join(root_dir, "LICENSE_NOTE.md")
    if os.path.exists(note_path):
        with open(note_path, "r", encoding="utf-8") as f:
            content = f.read()
            for kw in REQUIRED_NOTE_KEYWORDS:
                if kw.lower() not in content.lower():
                    errors.append(f"LICENSE_NOTE.md is missing key compliance text: '{kw}'")

    if errors:
        print("❌ License Check Failed:")
        for err in errors:
            print(f"  - {err}")
        sys.exit(1)
    else:
        print("✓ License and Swiss Ephemeris AGPL-3.0 attribution check passed successfully!")
        sys.exit(0)


if __name__ == "__main__":
    check_license_integrity()
