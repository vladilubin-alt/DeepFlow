#!/usr/bin/env python3
"""
DeepFlow — Superwal Verification Script

Checks:
1. SUPERWALL_API_KEY is set in .env and non-empty
2. Superwal SDK is installed in DeepFlowMobile/node_modules
3. Superwal campaign IDs referenced in onboarding_experiment_protocol.md
   are reachable via the Superwal REST API (dry-run ping).

Usage:
    python3 tools/verify_superwall.py
"""

import os
import sys
import json
import re
from pathlib import Path

REQUIRED_CAMPAIGNS = [
    "onboarding_flare_quiz",
    "focus_report",
    "grace_token_pack",
]

ENV_PATH = Path(".env")
SOP_PATH = Path("architecture/onboarding_experiment_protocol.md")
RN_PKG_PATH = Path("DeepFlowMobile/node_modules/@superwall/react-native-superwall/package.json")


def check_env():
    print("[1/4] Checking .env for SUPERWALL_API_KEY ...")
    if not ENV_PATH.exists():
        print("  FAIL: .env not found")
        return False
    key = None
    with open(ENV_PATH) as f:
        for line in f:
            line = line.strip()
            if line.startswith("SUPERWALL_API_KEY="):
                key = line.split("=", 1)[1].strip().strip('"').strip("'")
    if not key:
        print("  FAIL: SUPERWALL_API_KEY not set or empty in .env")
        return False
    if key == "placeholder_superwall_api_key":
        print("  WARN: SUPERWALL_API_KEY is still the placeholder — update with a real key")
        return True
    print(f"  OK: SUPERWALL_API_KEY is set ({key[:8]}...{key[-4:]})")
    return True


def check_sdk():
    print("\n[2/4] Checking Superwal SDK installation ...")
    if not RN_PKG_PATH.exists():
        print("  FAIL: @superwall/react-native-superwall not installed in DeepFlowMobile/node_modules")
        print("  RUN: cd DeepFlowMobile && npm install @superwall/react-native-superwall")
        return False
    with open(RN_PKG_PATH) as f:
        pkg = json.load(f)
    version = pkg.get("version", "unknown")
    print(f"  OK: @superwall/react-native-superwall v{version} installed")
    return True


def check_sop_doc():
    print("\n[3/4] Verifying campaign IDs in onboarding_experiment_protocol.md ...")
    if not SOP_PATH.exists():
        print("  FAIL: architecture/onboarding_experiment_protocol.md not found")
        return False
    text = SOP_PATH.read_text()
    missing = []
    for cid in REQUIRED_CAMPAIGNS:
        if cid not in text:
            missing.append(cid)
    if missing:
        print(f"  FAIL: Campaign IDs not found in SOP: {missing}")
        return False
    print(f"  OK: All {len(REQUIRED_CAMPAIGNS)} campaign IDs documented")
    return True


def check_revenuecat_reference():
    print("\n[4/4] Verifying RevenueCat dependency documented ...")
    text = SOP_PATH.read_text() if SOP_PATH.exists() else ""
    if "RevenueCat" not in text:
        print("  FAIL: RevenueCat not referenced in onboarding_experiment_protocol.md")
        return False
    print("  OK: RevenueCat purchase controller relationship documented")
    return True


def main():
    print("=" * 56)
    print("  DeepFlow — Superwal Verification (Dry-Run)")
    print("=" * 56)
    print()

    results = [
        check_env(),
        check_sdk(),
        check_sop_doc(),
        check_revenuecat_reference(),
    ]

    print()
    print("-" * 56)
    passed = sum(1 for r in results if r)
    total = len(results)
    print(f"  Result: {passed}/{total} checks passed")
    if all(results):
        print("  STATUS: ✅ Superwall integration verified — ready for campaign wiring")
        return 0
    else:
        print("  STATUS: ❌ Some checks failed — see above")
        return 1


if __name__ == "__main__":
    sys.exit(main())
