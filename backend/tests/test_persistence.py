import os
import unittest
from backend.app.db.session import SessionLocal
from backend.app.models.scenario import TestScenario
from backend.app.models.run import TestRun
from backend.app.models.event import ExecutionEvent
from backend.app.models.report import TestReport
from backend.app.models.setting import ApplicationSetting


class TestLocalPersistence(unittest.TestCase):
    def setUp(self):
        self.db = SessionLocal()

    def tearDown(self):
        self.db.close()

    def test_scenarios_persisted_and_queryable(self):
        scenarios = self.db.query(TestScenario).all()
        self.assertGreaterEqual(len(scenarios), 6)
        codes = [s.code for s in scenarios]
        self.assertIn("SEC-01", codes)
        self.assertIn("BUS-01", codes)

    def test_create_custom_scenario(self):
        scenario = TestScenario(
            code="TEST-PERSIST-01",
            name="Persistence Verification Scenario",
            category="Security",
            risk_level="High",
            description="Testing persistent record creation",
        )
        self.db.add(scenario)
        self.db.commit()
        self.db.refresh(scenario)

        # Verify query
        found = self.db.query(TestScenario).filter(TestScenario.code == "TEST-PERSIST-01").first()
        self.assertIsNotNone(found)
        self.assertEqual(found.name, "Persistence Verification Scenario")

        # Cleanup
        self.db.delete(found)
        self.db.commit()

    def test_create_run_with_events_and_report_cascade(self):
        # Pick first scenario
        scenario = self.db.query(TestScenario).first()
        self.assertIsNotNone(scenario)

        run = TestRun(
            run_number="RUN-UNITTEST-01",
            scenario_id=scenario.id,
            status="COMPLETED",
            result="PASSED",
            risk_score=25,
            duration_seconds=5.4,
        )
        self.db.add(run)
        self.db.commit()
        self.db.refresh(run)

        # Add event
        event = ExecutionEvent(
            run_id=run.id,
            sequence_number=1,
            event_type="ACTION",
            message="Unit test action",
            status="SUCCESS",
        )
        self.db.add(event)

        # Add report
        report = TestReport(
            run_id=run.id,
            summary="Unit test report summary",
            result="PASSED",
            risk_score=25,
            findings_count=0,
        )
        self.db.add(report)
        self.db.commit()

        # Query and verify
        reloaded_run = self.db.query(TestRun).filter(TestRun.id == run.id).first()
        self.assertIsNotNone(reloaded_run)
        self.assertEqual(len(reloaded_run.events), 1)
        self.assertIsNotNone(reloaded_run.report)
        self.assertEqual(reloaded_run.report.summary, "Unit test report summary")

        # Cascade delete verification
        self.db.delete(reloaded_run)
        self.db.commit()

        # Confirm cascade deleted child event and report
        orphaned_event = self.db.query(ExecutionEvent).filter(ExecutionEvent.run_id == run.id).first()
        self.assertIsNone(orphaned_event)
        orphaned_report = self.db.query(TestReport).filter(TestReport.run_id == run.id).first()
        self.assertIsNone(orphaned_report)

    def test_application_settings_persistence(self):
        setting = ApplicationSetting(
            key="test_custom_config",
            value="enabled",
            description="Unit test setting",
            is_secret=False,
        )
        self.db.add(setting)
        self.db.commit()

        found = self.db.query(ApplicationSetting).filter(ApplicationSetting.key == "test_custom_config").first()
        self.assertIsNotNone(found)
        self.assertEqual(found.value, "enabled")

        self.db.delete(found)
        self.db.commit()


if __name__ == "__main__":
    unittest.main()
