#!/usr/bin/env python3
"""
Libertad Extension Packager
Generates a clean distribution zip ready for the Chrome Web Store.
"""

import os
import zipfile

OUTPUT_ZIP = "libertad-extension.zip"
FILES_TO_INCLUDE = [
    "manifest.json",
    "background.js",
    "content.js",
    "popup.html",
    "popup.css",
    "popup.js",
    "i18n.js",
    "theme-init.js",
]
DIRS_TO_INCLUDE = [
    "icons",
    "_locales",
]

def create_package():
    print(f"Creating {OUTPUT_ZIP}...")
    
    if os.path.exists(OUTPUT_ZIP):
        os.remove(OUTPUT_ZIP)

    with zipfile.ZipFile(OUTPUT_ZIP, "w", zipfile.ZIP_DEFLATED) as zf:
        # Add root files
        for f in FILES_TO_INCLUDE:
            if os.path.isfile(f):
                zf.write(f, arcname=f)
                print(f"  + Added {f}")
            else:
                print(f"  ! Warning: {f} not found!")

        # Add directories
        for d in DIRS_TO_INCLUDE:
            if os.path.isdir(d):
                for root, _, filenames in os.walk(d):
                    for fn in filenames:
                        if fn.startswith("."):
                            continue
                        full_path = os.path.join(root, fn)
                        arcname = os.path.relpath(full_path, ".")
                        zf.write(full_path, arcname=arcname)
                        print(f"  + Added {arcname}")

    file_size_kb = os.path.getsize(OUTPUT_ZIP) / 1024
    print(f"\nSuccessfully built {OUTPUT_ZIP} ({file_size_kb:.1f} KB)")
    print("Ready for upload to Chrome Web Store Developer Dashboard!")

if __name__ == "__main__":
    create_package()
