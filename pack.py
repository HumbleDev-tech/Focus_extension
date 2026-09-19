#!/usr/bin/env python3
"""
Libertad Extension Packager & Quality Guardian
Validates linter compliance, version synchronization, and changelog documentation
before generating a clean distribution zip ready for the Chrome Web Store.
"""

import json
import os
import re
import subprocess
import sys
import zipfile

OUTPUT_ZIP = "libertad-extension.zip"
FILES_TO_INCLUDE = [
    "manifest.json",
    "constants.js",
    "background.js",
    "content.js",
    "popup.html",
    "popup.css",
    "popup.js",
    "i18n.js",
    "theme-init.js",
    "welcome.html",
]
DIRS_TO_INCLUDE = [
    "icons",
    "_locales",
    "src",
]

def run_preflight_checks():
    print("Running release pre-flight checks...")

    # 1. Check version consistency between manifest.json and package.json
    if not os.path.exists("manifest.json") or not os.path.exists("package.json"):
        print("[ERROR] manifest.json or package.json missing!")
        sys.exit(1)

    with open("manifest.json", "r", encoding="utf-8") as f:
        manifest_data = json.load(f)
    with open("package.json", "r", encoding="utf-8") as f:
        pkg_data = json.load(f)

    manifest_ver = manifest_data.get("version", "").strip()
    pkg_ver = pkg_data.get("version", "").strip()

    if not manifest_ver:
        print("[ERROR] 'version' not found in manifest.json")
        sys.exit(1)

    if manifest_ver != pkg_ver:
        print(f"[ERROR] Version mismatch! manifest.json is '{manifest_ver}', but package.json is '{pkg_ver}'.")
        sys.exit(1)

    # 2. Check version synchronization in UI & documentation files
    if os.path.exists("popup.html"):
        with open("popup.html", "r", encoding="utf-8") as f:
            html_content = f.read()
        m_html = re.search(r'id=[\"\']footerVersion[\"\']>v?([^<]+)<', html_content)
        if not m_html or m_html.group(1).strip() != manifest_ver:
            found_v = m_html.group(1).strip() if m_html else "not found"
            print(f"[ERROR] Version mismatch in popup.html! Expected 'v{manifest_ver}', but found '{found_v}'.")
            sys.exit(1)

    if os.path.exists("popup.js"):
        with open("popup.js", "r", encoding="utf-8") as f:
            js_content = f.read()
        m_js = re.search(r'let\s+manifestVersion\s*=\s*[\"\']([^\'\"]+)[\"\']', js_content)
        if not m_js or m_js.group(1).strip() != manifest_ver:
            found_v = m_js.group(1).strip() if m_js else "not found"
            print(f"[ERROR] Version mismatch in popup.js! Expected '{manifest_ver}', but found '{found_v}'.")
            sys.exit(1)

    if os.path.exists("README.md"):
        with open("README.md", "r", encoding="utf-8") as f:
            readme_content = f.read()
        m_readme = re.search(r'img\.shields\.io/badge/Version-([^\-\s]+)-blue\.svg', readme_content)
        if not m_readme or m_readme.group(1).strip() != manifest_ver:
            found_v = m_readme.group(1).strip() if m_readme else "not found"
            print(f"[ERROR] Version mismatch in README.md! Expected '{manifest_ver}', but found '{found_v}'.")
            sys.exit(1)

    # 3. Check CHANGELOG.md entry
    if not os.path.exists("CHANGELOG.md"):
        print("[ERROR] CHANGELOG.md is missing from repository root!")
        sys.exit(1)

    with open("CHANGELOG.md", "r", encoding="utf-8") as f:
        changelog_content = f.read()

    expected_section = f"## [{manifest_ver}]"
    if expected_section not in changelog_content:
        print(f"[ERROR] Version {manifest_ver} is not documented in CHANGELOG.md!")
        print(f"   Please add a section '{expected_section}' detailing changes before packaging.")
        sys.exit(1)

    # 4. Run Biome check
    print("  + Running Biome code quality check...")
    try:
        res = subprocess.run(["npm", "run", "check"], capture_output=True, text=True)
        if res.returncode != 0:
            print(f"[ERROR] Biome check failed!\n{res.stdout}\n{res.stderr}")
            sys.exit(1)
    except FileNotFoundError:
        pass

    print(f"[OK] All pre-flight checks passed! (Version {manifest_ver} verified)\n")
    return manifest_ver

def create_package():
    manifest_ver = run_preflight_checks()
    print(f"Creating {OUTPUT_ZIP} for Libertad v{manifest_ver}...")

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
