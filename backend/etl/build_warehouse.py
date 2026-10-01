"""
ETL Pipeline for Bank Campaign Decision Support System Data Warehouse
Extracts raw data from UCI Bank Marketing dataset (bank-additional-full.csv),
transforms records into a clean Star Schema, and loads into SQLite Data Warehouse.
"""

import os
import sys
import sqlite3
import pandas as pd


def get_paths():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(base_dir, "..", ".."))
    
    # Candidate CSV locations
    csv_candidates = [
        os.path.join(project_root, "bank-additional-full.csv"),
        os.path.join(base_dir, "..", "bank-additional-full.csv"),
        os.path.join(os.getcwd(), "bank-additional-full.csv"),
    ]
    csv_path = None
    for p in csv_candidates:
        if os.path.exists(p):
            csv_path = p
            break
            
    if not csv_path:
        raise FileNotFoundError(f"Source file bank-additional-full.csv not found in candidate paths: {csv_candidates}")

    warehouse_dir = os.path.abspath(os.path.join(base_dir, "..", "warehouse"))
    os.makedirs(warehouse_dir, exist_ok=True)
    db_path = os.path.join(warehouse_dir, "bank_warehouse.db")

    return csv_path, db_path


def create_schema(conn):
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = ON;")

    # Drop existing tables to allow clean re-runs
    cursor.execute("DROP TABLE IF EXISTS fact_campaign;")
    cursor.execute("DROP TABLE IF EXISTS dim_customer;")
    cursor.execute("DROP TABLE IF EXISTS dim_contact;")
    cursor.execute("DROP TABLE IF EXISTS dim_campaign_history;")
    cursor.execute("DROP TABLE IF EXISTS dim_market;")

    cursor.execute("""
    CREATE TABLE dim_customer (
        customer_key INTEGER PRIMARY KEY AUTOINCREMENT,
        age INTEGER NOT NULL,
        job TEXT NOT NULL,
        marital TEXT NOT NULL,
        education TEXT NOT NULL,
        "default" TEXT NOT NULL,
        housing TEXT NOT NULL,
        loan TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE dim_contact (
        contact_key INTEGER PRIMARY KEY AUTOINCREMENT,
        contact TEXT NOT NULL,
        month TEXT NOT NULL,
        day_of_week TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE dim_campaign_history (
        campaign_history_key INTEGER PRIMARY KEY AUTOINCREMENT,
        previous INTEGER NOT NULL,
        pdays INTEGER NOT NULL,
        poutcome TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE dim_market (
        market_key INTEGER PRIMARY KEY AUTOINCREMENT,
        emp_var_rate REAL NOT NULL,
        cons_price_idx REAL NOT NULL,
        cons_conf_idx REAL NOT NULL,
        euribor3m REAL NOT NULL,
        nr_employed REAL NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE fact_campaign (
        record_key INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_key INTEGER NOT NULL,
        contact_key INTEGER NOT NULL,
        campaign_history_key INTEGER NOT NULL,
        market_key INTEGER NOT NULL,
        campaign_contacts INTEGER NOT NULL,
        duration INTEGER NOT NULL,
        response TEXT NOT NULL,
        FOREIGN KEY (customer_key) REFERENCES dim_customer (customer_key),
        FOREIGN KEY (contact_key) REFERENCES dim_contact (contact_key),
        FOREIGN KEY (campaign_history_key) REFERENCES dim_campaign_history (campaign_history_key),
        FOREIGN KEY (market_key) REFERENCES dim_market (market_key)
    );
    """)

    conn.commit()


def run_etl(csv_path: str, db_path: str):
    print("=" * 60)
    print("ETL PROCESS - STARTING")
    print(f"Source file: {csv_path}")
    print(f"Target DB:   {db_path}")
    print("=" * 60)

    # 1. EXTRACT
    df_raw = pd.read_csv(csv_path, sep=";")
    source_count = len(df_raw)
    print(f"Source records extracted: {source_count}")

    # 2. TRANSFORM
    # Prepare dim_customer (source-record grain surrogate key)
    # The UCI Bank Marketing dataset has no real-world customer ID,
    # so each row represents a distinct customer campaign interaction record.
    customer_cols = ["age", "job", "marital", "education", "default", "housing", "loan"]
    df_customer = df_raw[customer_cols].copy()
    df_customer["customer_key"] = range(1, source_count + 1)

    # Prepare dim_contact (dimension entity of unique contact methods and calendar timings)
    contact_cols = ["contact", "month", "day_of_week"]
    df_unique_contacts = df_raw[contact_cols].drop_duplicates().reset_index(drop=True)
    df_unique_contacts["contact_key"] = range(1, len(df_unique_contacts) + 1)

    # Prepare dim_campaign_history (dimension entity of previous campaign outcomes)
    history_cols = ["previous", "pdays", "poutcome"]
    df_unique_history = df_raw[history_cols].drop_duplicates().reset_index(drop=True)
    df_unique_history["campaign_history_key"] = range(1, len(df_unique_history) + 1)

    # Prepare dim_market (dimension entity of macroeconomic indicators)
    market_raw_cols = ["emp.var.rate", "cons.price.idx", "cons.conf.idx", "euribor3m", "nr.employed"]
    df_unique_market = df_raw[market_raw_cols].drop_duplicates().reset_index(drop=True)
    df_unique_market["market_key"] = range(1, len(df_unique_market) + 1)
    df_unique_market_renamed = df_unique_market.rename(columns={
        "emp.var.rate": "emp_var_rate",
        "cons.price.idx": "cons_price_idx",
        "cons.conf.idx": "cons_conf_idx",
        "euribor3m": "euribor3m",
        "nr.employed": "nr_employed"
    })

    # Map keys back to fact table
    df_fact = df_raw.copy()
    df_fact["customer_key"] = df_customer["customer_key"]

    # Merge contact key
    df_fact = df_fact.merge(df_unique_contacts, on=contact_cols, how="left")

    # Merge history key
    df_fact = df_fact.merge(df_unique_history, on=history_cols, how="left")

    # Merge market key
    df_fact = df_fact.merge(df_unique_market, on=market_raw_cols, how="left")

    # Final fact columns
    df_fact_final = pd.DataFrame({
        "record_key": range(1, source_count + 1),
        "customer_key": df_fact["customer_key"],
        "contact_key": df_fact["contact_key"],
        "campaign_history_key": df_fact["campaign_history_key"],
        "market_key": df_fact["market_key"],
        "campaign_contacts": df_fact["campaign"].astype(int),
        "duration": df_fact["duration"].astype(int),
        "response": df_fact["y"].astype(str),
    })

    # 3. LOAD
    conn = sqlite3.connect(db_path)
    create_schema(conn)

    # Insert dimensions
    df_customer[["customer_key", "age", "job", "marital", "education", "default", "housing", "loan"]].to_sql(
        "dim_customer", conn, if_exists="append", index=False
    )
    df_unique_contacts[["contact_key", "contact", "month", "day_of_week"]].to_sql(
        "dim_contact", conn, if_exists="append", index=False
    )
    df_unique_history[["campaign_history_key", "previous", "pdays", "poutcome"]].to_sql(
        "dim_campaign_history", conn, if_exists="append", index=False
    )
    df_unique_market_renamed[["market_key", "emp_var_rate", "cons_price_idx", "cons_conf_idx", "euribor3m", "nr_employed"]].to_sql(
        "dim_market", conn, if_exists="append", index=False
    )

    # Insert fact
    df_fact_final.to_sql("fact_campaign", conn, if_exists="append", index=False)

    # Create indexes for high-performance OLAP queries
    cursor = conn.cursor()
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_fact_cust ON fact_campaign(customer_key);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_fact_contact ON fact_campaign(contact_key);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_fact_history ON fact_campaign(campaign_history_key);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_fact_market ON fact_campaign(market_key);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_fact_resp ON fact_campaign(response);")
    conn.commit()

    # 4. VALIDATION
    validate_warehouse(conn, source_count)
    conn.close()


def validate_warehouse(conn, expected_source_count: int):
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = ON;")

    # Row counts
    cursor.execute("SELECT COUNT(*) FROM dim_customer;")
    count_customer = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM dim_contact;")
    count_contact = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM dim_campaign_history;")
    count_history = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM dim_market;")
    count_market = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM fact_campaign;")
    count_fact = cursor.fetchone()[0]

    # Foreign key integrity check via PRAGMA
    cursor.execute("PRAGMA foreign_key_check;")
    fk_violations = cursor.fetchall()
    fk_passed = len(fk_violations) == 0

    # Explicit orphan checks
    cursor.execute("""
        SELECT COUNT(*) FROM fact_campaign f
        LEFT JOIN dim_customer c ON f.customer_key = c.customer_key
        WHERE c.customer_key IS NULL;
    """)
    orphan_customer = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*) FROM fact_campaign f
        LEFT JOIN dim_contact ct ON f.contact_key = ct.contact_key
        WHERE ct.contact_key IS NULL;
    """)
    orphan_contact = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*) FROM fact_campaign f
        LEFT JOIN dim_campaign_history h ON f.campaign_history_key = h.campaign_history_key
        WHERE h.campaign_history_key IS NULL;
    """)
    orphan_history = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*) FROM fact_campaign f
        LEFT JOIN dim_market m ON f.market_key = m.market_key
        WHERE m.market_key IS NULL;
    """)
    orphan_market = cursor.fetchone()[0]

    # Primary key null checks
    cursor.execute("SELECT COUNT(*) FROM fact_campaign WHERE record_key IS NULL;")
    null_pks = cursor.fetchone()[0]

    # Response check
    cursor.execute("SELECT DISTINCT response FROM fact_campaign;")
    responses = [r[0] for r in cursor.fetchall()]
    responses_valid = set(responses).issubset({"yes", "no"})

    # Test full 5-table star schema SQL JOIN
    cursor.execute("""
        SELECT
            c.job,
            ct.contact,
            h.poutcome,
            ROUND(AVG(m.euribor3m), 2) AS avg_euribor,
            COUNT(f.record_key) AS total_records,
            SUM(CASE WHEN f.response = 'yes' THEN 1 ELSE 0 END) AS positive_responses,
            ROUND(100.0 * SUM(CASE WHEN f.response = 'yes' THEN 1 ELSE 0 END) / COUNT(f.record_key), 2) AS response_rate_pct
        FROM fact_campaign f
        JOIN dim_customer c ON f.customer_key = c.customer_key
        JOIN dim_contact ct ON f.contact_key = ct.contact_key
        JOIN dim_campaign_history h ON f.campaign_history_key = h.campaign_history_key
        JOIN dim_market m ON f.market_key = m.market_key
        GROUP BY c.job, ct.contact, h.poutcome
        LIMIT 5;
    """)
    sample_join = cursor.fetchall()
    join_success = len(sample_join) > 0

    no_orphans = (orphan_customer == 0 and orphan_contact == 0 and orphan_history == 0 and orphan_market == 0)
    counts_match = (count_fact == expected_source_count)

    print("\n" + "=" * 60)
    print("ETL VALIDATION REPORT")
    print("=" * 60)
    print(f"Source records:        {expected_source_count}")
    print(f"dim_customer:          {count_customer}")
    print(f"dim_contact:           {count_contact}")
    print(f"dim_campaign_history:  {count_history}")
    print(f"dim_market:            {count_market}")
    print(f"fact_campaign:         {count_fact}")
    print("-" * 60)
    print(f"Primary Key Check:     {'PASSED (0 NULLs)' if null_pks == 0 else f'FAILED ({null_pks} NULLs)'}")
    print(f"Foreign Key Integrity: {'PASSED' if (fk_passed and no_orphans) else 'FAILED'}")
    print(f"Response Field Valid:  {'PASSED' if responses_valid else 'FAILED'} (values: {responses})")
    print(f"Star Schema SQL Join:  {'PASSED' if join_success else 'FAILED'}")
    print(f"Data Integrity:        {'PASSED' if (counts_match and no_orphans and responses_valid) else 'FAILED'}")
    print("Warehouse:             CREATED")
    print("=" * 60 + "\n")

    if not (counts_match and no_orphans and fk_passed and join_success):
        raise RuntimeError("Data Warehouse validation checks failed!")


if __name__ == "__main__":
    csv_file, db_file = get_paths()
    run_etl(csv_file, db_file)
