"""
Comprehensive Integration & Validation Test Suite
Tests:
1. SQLite Star Schema Data Warehouse integrity & foreign keys
2. OLAP operations (Roll-Up, Drill-Down, Slice, Dice)
3. Flask REST endpoints
4. Machine Learning XGBoost /predict endpoint preservation
"""

import sys
import os
import sqlite3
import json

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app
from warehouse.warehouse_service import (
    get_connection,
    get_dashboard_data,
    olap_rollup,
    olap_drilldown,
    olap_slice,
    olap_dice,
    get_warehouse_schema,
    get_table_sample,
    get_historical_context,
)


def test_warehouse_schema():
    print("[1/5] Testing SQLite Star Schema Integrity...")
    conn = get_connection()
    cursor = conn.cursor()

    # Verify tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = {r[0] for r in cursor.fetchall()}
    required_tables = {"dim_customer", "dim_contact", "dim_campaign_history", "dim_market", "fact_campaign"}
    assert required_tables.issubset(tables), f"Missing tables: {required_tables - tables}"

    # Verify counts
    cursor.execute("SELECT COUNT(*) FROM fact_campaign;")
    fact_count = cursor.fetchone()[0]
    assert fact_count == 41188, f"Expected 41188 fact rows, got {fact_count}"

    cursor.execute("SELECT COUNT(*) FROM dim_customer;")
    cust_count = cursor.fetchone()[0]
    assert cust_count == 41188, f"Expected 41188 customer dimension rows, got {cust_count}"

    # Foreign key integrity check
    cursor.execute("PRAGMA foreign_key_check;")
    violations = cursor.fetchall()
    assert len(violations) == 0, f"Foreign key violations found: {violations}"

    # Verify no orphans
    orphan_queries = [
        ("dim_customer", "SELECT COUNT(*) FROM fact_campaign f LEFT JOIN dim_customer c ON f.customer_key = c.customer_key WHERE c.customer_key IS NULL;"),
        ("dim_contact", "SELECT COUNT(*) FROM fact_campaign f LEFT JOIN dim_contact ct ON f.contact_key = ct.contact_key WHERE ct.contact_key IS NULL;"),
        ("dim_history", "SELECT COUNT(*) FROM fact_campaign f LEFT JOIN dim_campaign_history h ON f.campaign_history_key = h.campaign_history_key WHERE h.campaign_history_key IS NULL;"),
        ("dim_market", "SELECT COUNT(*) FROM fact_campaign f LEFT JOIN dim_market m ON f.market_key = m.market_key WHERE m.market_key IS NULL;"),
    ]
    for name, q in orphan_queries:
        cursor.execute(q)
        cnt = cursor.fetchone()[0]
        assert cnt == 0, f"Orphan keys found in {name}: {cnt}"

    conn.close()
    print("  [PASS] Star Schema Integrity: PASSED (41,188 facts, 0 orphan FKs, PRAGMA foreign keys verified)")


def test_olap_operations():
    print("[2/5] Testing SQL OLAP Operations...")

    # 1. Roll-Up
    rollup_res = olap_rollup("age_group")
    assert len(rollup_res) > 0, "Rollup returned empty list"
    assert "group_name" in rollup_res[0] and "response_rate" in rollup_res[0]

    # 2. Drill-Down
    drill_res = olap_drilldown("age_group", "36-45", "occupation")
    assert len(drill_res) > 0, "Drilldown returned empty list"
    assert "group_name" in drill_res[0]

    # 3. Slice
    slice_res = olap_slice("age_group", "36-45")
    assert "kpis" in slice_res and slice_res["kpis"]["total_records"] > 0

    # 4. Dice
    dice_res = olap_dice({"age_group": "36-45", "job": "admin.", "contact": "cellular"})
    assert "kpis" in dice_res and dice_res["kpis"]["total_records"] > 0
    assert dice_res["kpis"]["response_rate"] >= 0

    print("  [PASS] OLAP Operations (Roll-Up, Drill-Down, Slice, Dice): PASSED")


def test_dashboard_service():
    print("[3/5] Testing Warehouse Dashboard Data Service...")
    data = get_dashboard_data({})
    kpis = data["kpis"]
    assert kpis["total_records"] == 41188
    assert kpis["positive_responses"] == 4640
    assert abs(kpis["response_rate"] - 11.27) < 0.1
    assert len(data["age_distribution"]) == 6
    assert len(data["contact_distribution"]) == 2
    assert len(data["job_distribution"]) == 12
    assert len(data["contact_frequency"]) == 6
    assert len(data["insights"]) > 0
    assert "summary_text" in data["campaign_story"]
    print("  [PASS] Dashboard Data Calculations & Non-Causal Insights: PASSED")


def test_flask_endpoints():
    print("[4/5] Testing Flask REST Endpoints...")
    client = app.test_client()

    # Health
    r = client.get("/health")
    assert r.status_code == 200 and r.get_json()["status"] == "ok"

    # Summary
    r = client.get("/api/warehouse/summary?age_group=26-35")
    assert r.status_code == 200
    res_json = r.get_json()
    assert res_json["kpis"]["total_records"] > 0

    # OLAP Rollup
    r = client.get("/api/warehouse/olap/rollup?dimension=occupation")
    assert r.status_code == 200 and r.get_json()["operation"] == "ROLL-UP"

    # OLAP Drilldown
    r = client.get("/api/warehouse/olap/drilldown?parent_dim=occupation&parent_value=admin.&drill_dim=contact_method")
    assert r.status_code == 200 and r.get_json()["operation"] == "DRILL-DOWN"

    # Tables schema
    r = client.get("/api/warehouse/tables")
    assert r.status_code == 200
    assert "fact_campaign" in r.get_json()["tables"]

    # Table sample
    r = client.get("/api/warehouse/table/fact_campaign?limit=3")
    assert r.status_code == 200
    assert len(r.get_json()["sample_rows"]) == 3

    print("  [PASS] Flask Warehouse REST Endpoints: PASSED")


def test_ml_prediction_preservation():
    print("[5/5] Testing Existing XGBoost Model & Context Attachment...")
    client = app.test_client()

    payload = {
        "age": 40,
        "job": "technician",
        "contact": "cellular",
        "campaign": 2,
        "previous": 1,
        "poutcome": "success",
        "euribor3m": 1.25,
        "duration": 350
    }
    r = client.post("/predict", json=payload)
    assert r.status_code == 200, f"Predict failed: {r.status_code}, {r.data}"
    data = r.get_json()

    assert "prediction" in data and data["prediction"] in ["yes", "no"]
    assert "probability" in data and 0.0 <= data["probability"] <= 1.0
    assert "interest_level" in data and data["interest_level"] in ["HIGH", "MEDIUM", "LOW"]
    assert "priority" in data and data["priority"] in ["HIGH", "MEDIUM", "LOW"]
    assert "recommended_action" in data and len(data["recommended_action"]) > 0
    assert "estimated_likelihood" in data
    assert "historical_context" in data
    assert data["historical_context"]["matching_records"] > 0
    assert data["historical_context"]["historical_response_rate"] >= 0

    print("  [PASS] Existing ML XGBoost Prediction & Historical Context Attachment: PASSED")


if __name__ == "__main__":
    print("=" * 60)
    print("RUNNING BANK CAMPAIGN DECISION SUPPORT INTEGRATION SUITE")
    print("=" * 60)
    test_warehouse_schema()
    test_olap_operations()
    test_dashboard_service()
    test_flask_endpoints()
    test_ml_prediction_preservation()
    print("=" * 60)
    print("ALL TESTS PASSED SUCCESSFULLY! (5/5)")
    print("=" * 60)
