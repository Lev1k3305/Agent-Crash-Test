import unittest
from fastapi.testclient import TestClient
from backend.app.main import app


class TestApiCrud(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health_and_ready(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "ok")

        ready_res = self.client.get("/api/ready")
        self.assertEqual(ready_res.status_code, 200)
        self.assertEqual(ready_res.json()["database"], "connected")

    def test_scenarios_crud(self):
        # 1. List scenarios
        res = self.client.get("/api/scenarios")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreaterEqual(data["total"], 6)

        # 2. Create scenario
        create_payload = {
            "code": "API-TEST-01",
            "name": "API Integration Scenario",
            "category": "Reliability",
            "risk_level": "Medium",
            "description": "Integration test scenario description",
            "target_workflow": "Order Processing",
        }
        post_res = self.client.post("/api/scenarios", json=create_payload)
        self.assertEqual(post_res.status_code, 201)
        created_id = post_res.json()["id"]

        # 3. Get scenario
        get_res = self.client.get(f"/api/scenarios/{created_id}")
        self.assertEqual(get_res.status_code, 200)
        self.assertEqual(get_res.json()["code"], "API-TEST-01")

        # 4. Update scenario
        put_res = self.client.put(f"/api/scenarios/{created_id}", json={"name": "Updated Name"})
        self.assertEqual(put_res.status_code, 200)
        self.assertEqual(put_res.json()["name"], "Updated Name")

        # 5. Delete scenario
        del_res = self.client.delete(f"/api/scenarios/{created_id}")
        self.assertEqual(del_res.status_code, 204)

    def test_runs_and_reports_crud(self):
        # List scenarios to attach run to
        scenarios = self.client.get("/api/scenarios").json()["items"]
        self.assertGreater(len(scenarios), 0)
        scenario_id = scenarios[0]["id"]

        # Create run
        run_payload = {
            "scenario_id": scenario_id,
            "status": "COMPLETED",
            "result": "PASSED",
            "risk_score": 15,
            "duration_seconds": 3.8,
            "notes": "Automated test execution",
            "create_default_events": True,
            "create_report": True,
        }
        create_res = self.client.post("/api/runs", json=run_payload)
        self.assertEqual(create_res.status_code, 201)
        run_data = create_res.json()
        run_id = run_data["id"]

        # Get run details
        detail_res = self.client.get(f"/api/runs/{run_id}")
        self.assertEqual(detail_res.status_code, 200)
        detail_data = detail_res.json()
        self.assertGreater(len(detail_data["events"]), 0)
        self.assertIsNotNone(detail_data["report"])

        # Test report export JSON
        report_id = detail_data["report"]["id"]
        export_json = self.client.get(f"/api/reports/{report_id}/export?format=json")
        self.assertEqual(export_json.status_code, 200)
        self.assertIn("application/json", export_json.headers["content-type"])

        # Test report export CSV
        export_csv = self.client.get(f"/api/reports/{report_id}/export?format=csv")
        self.assertEqual(export_csv.status_code, 200)
        self.assertIn("text/csv", export_csv.headers["content-type"])

        # Cleanup run
        self.client.delete(f"/api/runs/{run_id}")

    def test_backup_status_and_export(self):
        status_res = self.client.get("/api/backup/status")
        self.assertEqual(status_res.status_code, 200)
        status_data = status_res.json()
        self.assertTrue(status_data["file_exists"])
        self.assertIn("test_scenarios", status_data["table_counts"])
        self.assertGreaterEqual(status_data["table_counts"]["test_scenarios"], 6)

        # Export backup
        export_res = self.client.get("/api/backup/export")
        self.assertEqual(export_res.status_code, 200)
        self.assertIn("application/x-sqlite3", export_res.headers["content-type"])
        self.assertTrue(len(export_res.content) > 100)


if __name__ == "__main__":
    unittest.main()
