#!/usr/bin/env python3
"""
Test runner for Agent Crash Test backend tests.
Can be executed via: python3 backend/tests/run_tests.py
Or via: pytest backend/tests
"""
import os
import sys
import unittest

def main():
    test_dir = os.path.dirname(os.path.abspath(__file__))
    workspace_root = os.path.abspath(os.path.join(test_dir, "../.."))
    sys.path.insert(0, workspace_root)

    print(f"Running backend test suite from {test_dir}...")
    loader = unittest.TestLoader()
    suite = loader.discover(start_dir=test_dir, pattern="test_*.py")

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    total = result.testsRun
    failures = len(result.failures)
    errors = len(result.errors)
    passed = total - failures - errors

    print("\n------------------------------------------------------------")
    print(f"Backend Test Results: {passed}/{total} PASSED ({failures} failures, {errors} errors)")
    print("------------------------------------------------------------")

    sys.exit(0 if result.wasSuccessful() else 1)


if __name__ == "__main__":
    main()
