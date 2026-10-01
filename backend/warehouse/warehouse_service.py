"""
Warehouse Query Service for Bank Campaign Decision Support System.
Executes real SQL queries and OLAP operations against SQLite Star Schema.
Never accepts raw unsanitized SQL; all queries use parameterized SQL.
"""

import os
import sqlite3
from typing import Dict, Any, List, Optional

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "bank_warehouse.db")

ALLOWED_TABLES = {
    "dim_customer",
    "dim_contact",
    "dim_campaign_history",
    "dim_market",
    "fact_campaign"
}

AGE_CASE_SQL = """
CASE 
    WHEN c.age BETWEEN 18 AND 25 THEN '18-25'
    WHEN c.age BETWEEN 26 AND 35 THEN '26-35'
    WHEN c.age BETWEEN 36 AND 45 THEN '36-45'
    WHEN c.age BETWEEN 46 AND 55 THEN '46-55'
    WHEN c.age BETWEEN 56 AND 65 THEN '56-65'
    ELSE '66+'
END
"""

def get_connection():
    if not os.path.exists(DB_PATH):
        raise FileNotFoundError(f"Database file not found at {DB_PATH}. Run ETL first.")
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def build_filter_clauses(filters: Dict[str, Any]):
    clauses = []
    params = []

    age_group = filters.get("age_group") or filters.get("ageGroup")
    if age_group:
        if age_group == "18-25":
            clauses.append("c.age BETWEEN 18 AND 25")
        elif age_group == "26-35":
            clauses.append("c.age BETWEEN 26 AND 35")
        elif age_group == "36-45":
            clauses.append("c.age BETWEEN 36 AND 45")
        elif age_group == "46-55":
            clauses.append("c.age BETWEEN 46 AND 55")
        elif age_group == "56-65":
            clauses.append("c.age BETWEEN 56 AND 65")
        elif age_group == "66+":
            clauses.append("c.age >= 66")

    job = filters.get("job") or filters.get("occupation")
    if job and job != "all":
        clauses.append("c.job = ?")
        params.append(job)

    contact = filters.get("contact") or filters.get("contactMethod")
    if contact and contact != "all":
        clauses.append("ct.contact = ?")
        params.append(contact)

    month = filters.get("month")
    if month and month != "all":
        clauses.append("ct.month = ?")
        params.append(month)

    poutcome = filters.get("poutcome") or filters.get("previousResult")
    if poutcome and poutcome != "all":
        clauses.append("h.poutcome = ?")
        params.append(poutcome)

    campaign_range = filters.get("campaign_range") or filters.get("campaignRange")
    if campaign_range and campaign_range != "all":
        if campaign_range == "1":
            clauses.append("f.campaign_contacts = 1")
        elif campaign_range == "2":
            clauses.append("f.campaign_contacts = 2")
        elif campaign_range == "3-5":
            clauses.append("f.campaign_contacts BETWEEN 3 AND 5")
        elif campaign_range == "6+":
            clauses.append("f.campaign_contacts >= 6")

    where_sql = ("WHERE " + " AND ".join(clauses)) if clauses else ""
    return where_sql, params


def get_dashboard_data(filters: Dict[str, Any]) -> Dict[str, Any]:
    """
    Executes Star Schema SQL queries across Fact and Dimension tables
    to power Manager Dashboard KPIs, Charts, Dynamic Observations, and Campaign Story.
    """
    conn = get_connection()
    cursor = conn.cursor()

    where_sql, params = build_filter_clauses(filters)

    # 1. Overall KPIs
    kpi_query = f"""
    SELECT
        COUNT(f.record_key) AS total_records,
        SUM(CASE WHEN f.response = 'yes' THEN 1 ELSE 0 END) AS positive_responses,
        ROUND(100.0 * SUM(CASE WHEN f.response = 'yes' THEN 1 ELSE 0 END) / MAX(1, COUNT(f.record_key)), 2) AS response_rate,
        SUM(f.campaign_contacts) AS total_contacts,
        ROUND(AVG(f.duration), 1) AS avg_duration
    FROM fact_campaign f
    JOIN dim_customer c ON f.customer_key = c.customer_key
    JOIN dim_contact ct ON f.contact_key = ct.contact_key
    JOIN dim_campaign_history h ON f.campaign_history_key = h.campaign_history_key
    JOIN dim_market m ON f.market_key = m.market_key
    {where_sql};
    """
    cursor.execute(kpi_query, params)
    kpi_row = cursor.fetchone()
    total_records = kpi_row["total_records"] or 0
    positive_responses = kpi_row["positive_responses"] or 0
    response_rate = kpi_row["response_rate"] or 0.0
    total_contacts = kpi_row["total_contacts"] or 0
    avg_duration = kpi_row["avg_duration"] or 0.0

    # 2. Response by Age Group
    age_query = f"""
    SELECT
        {AGE_CASE_SQL} AS age_group,
        COUNT(f.record_key) AS total,
        SUM(CASE WHEN f.response = 'yes' THEN 1 ELSE 0 END) AS yes,
        SUM(CASE WHEN f.response = 'no' THEN 1 ELSE 0 END) AS no,
        ROUND(100.0 * SUM(CASE WHEN f.response = 'yes' THEN 1 ELSE 0 END) / COUNT(f.record_key), 2) AS response_rate
    FROM fact_campaign f
    JOIN dim_customer c ON f.customer_key = c.customer_key
    JOIN dim_contact ct ON f.contact_key = ct.contact_key
    JOIN dim_campaign_history h ON f.campaign_history_key = h.campaign_history_key
    JOIN dim_market m ON f.market_key = m.market_key
    {where_sql}
    GROUP BY age_group
    ORDER BY 
        CASE age_group
            WHEN '18-25' THEN 1
            WHEN '26-35' THEN 2
            WHEN '36-45' THEN 3
            WHEN '46-55' THEN 4
            WHEN '56-65' THEN 5
            ELSE 6
        END;
    """
    cursor.execute(age_query, params)
    age_distribution = [dict(row) for row in cursor.fetchall()]

    # 3. Response by Contact Method
    contact_query = f"""
    SELECT
        ct.contact AS contact_method,
        COUNT(f.record_key) AS total,
        SUM(CASE WHEN f.response = 'yes' THEN 1 ELSE 0 END) AS yes,
        SUM(CASE WHEN f.response = 'no' THEN 1 ELSE 0 END) AS no,
        ROUND(100.0 * SUM(CASE WHEN f.response = 'yes' THEN 1 ELSE 0 END) / COUNT(f.record_key), 2) AS response_rate
    FROM fact_campaign f
    JOIN dim_customer c ON f.customer_key = c.customer_key
    JOIN dim_contact ct ON f.contact_key = ct.contact_key
    JOIN dim_campaign_history h ON f.campaign_history_key = h.campaign_history_key
    JOIN dim_market m ON f.market_key = m.market_key
    {where_sql}
    GROUP BY ct.contact
    ORDER BY response_rate DESC;
    """
    cursor.execute(contact_query, params)
    contact_distribution = [dict(row) for row in cursor.fetchall()]

    # 4. Response by Occupation
    job_query = f"""
    SELECT
        c.job AS occupation,
        COUNT(f.record_key) AS total,
        SUM(CASE WHEN f.response = 'yes' THEN 1 ELSE 0 END) AS yes,
        SUM(CASE WHEN f.response = 'no' THEN 1 ELSE 0 END) AS no,
        ROUND(100.0 * SUM(CASE WHEN f.response = 'yes' THEN 1 ELSE 0 END) / COUNT(f.record_key), 2) AS response_rate
    FROM fact_campaign f
    JOIN dim_customer c ON f.customer_key = c.customer_key
    JOIN dim_contact ct ON f.contact_key = ct.contact_key
    JOIN dim_campaign_history h ON f.campaign_history_key = h.campaign_history_key
    JOIN dim_market m ON f.market_key = m.market_key
    {where_sql}
    GROUP BY c.job
    ORDER BY response_rate DESC;
    """
    cursor.execute(job_query, params)
    job_distribution = [dict(row) for row in cursor.fetchall()]

    # 5. Campaign Contact Frequency
    freq_query = f"""
    SELECT
        CASE
            WHEN f.campaign_contacts = 1 THEN '1 Contact'
            WHEN f.campaign_contacts = 2 THEN '2 Contacts'
            WHEN f.campaign_contacts = 3 THEN '3 Contacts'
            WHEN f.campaign_contacts = 4 THEN '4 Contacts'
            WHEN f.campaign_contacts = 5 THEN '5 Contacts'
            ELSE '6+ Contacts'
        END AS contact_bucket,
        COUNT(f.record_key) AS total,
        SUM(CASE WHEN f.response = 'yes' THEN 1 ELSE 0 END) AS yes,
        SUM(CASE WHEN f.response = 'no' THEN 1 ELSE 0 END) AS no,
        ROUND(100.0 * SUM(CASE WHEN f.response = 'yes' THEN 1 ELSE 0 END) / COUNT(f.record_key), 2) AS response_rate
    FROM fact_campaign f
    JOIN dim_customer c ON f.customer_key = c.customer_key
    JOIN dim_contact ct ON f.contact_key = ct.contact_key
    JOIN dim_campaign_history h ON f.campaign_history_key = h.campaign_history_key
    JOIN dim_market m ON f.market_key = m.market_key
    {where_sql}
    GROUP BY contact_bucket
    ORDER BY 
        CASE contact_bucket
            WHEN '1 Contact' THEN 1
            WHEN '2 Contacts' THEN 2
            WHEN '3 Contacts' THEN 3
            WHEN '4 Contacts' THEN 4
            WHEN '5 Contacts' THEN 5
            ELSE 6
        END;
    """
    cursor.execute(freq_query, params)
    contact_frequency = [dict(row) for row in cursor.fetchall()]

    # 6. Previous Campaign Outcome
    poutcome_query = f"""
    SELECT
        h.poutcome AS previous_outcome,
        COUNT(f.record_key) AS total,
        SUM(CASE WHEN f.response = 'yes' THEN 1 ELSE 0 END) AS yes,
        SUM(CASE WHEN f.response = 'no' THEN 1 ELSE 0 END) AS no,
        ROUND(100.0 * SUM(CASE WHEN f.response = 'yes' THEN 1 ELSE 0 END) / COUNT(f.record_key), 2) AS response_rate
    FROM fact_campaign f
    JOIN dim_customer c ON f.customer_key = c.customer_key
    JOIN dim_contact ct ON f.contact_key = ct.contact_key
    JOIN dim_campaign_history h ON f.campaign_history_key = h.campaign_history_key
    JOIN dim_market m ON f.market_key = m.market_key
    {where_sql}
    GROUP BY h.poutcome
    ORDER BY response_rate DESC;
    """
    cursor.execute(poutcome_query, params)
    poutcome_distribution = [dict(row) for row in cursor.fetchall()]

    # 7. Monthly Campaign Pattern
    month_query = f"""
    SELECT
        ct.month AS month,
        COUNT(f.record_key) AS total,
        SUM(CASE WHEN f.response = 'yes' THEN 1 ELSE 0 END) AS yes,
        SUM(CASE WHEN f.response = 'no' THEN 1 ELSE 0 END) AS no,
        ROUND(100.0 * SUM(CASE WHEN f.response = 'yes' THEN 1 ELSE 0 END) / COUNT(f.record_key), 2) AS response_rate
    FROM fact_campaign f
    JOIN dim_customer c ON f.customer_key = c.customer_key
    JOIN dim_contact ct ON f.contact_key = ct.contact_key
    JOIN dim_campaign_history h ON f.campaign_history_key = h.campaign_history_key
    JOIN dim_market m ON f.market_key = m.market_key
    {where_sql}
    GROUP BY ct.month
    ORDER BY 
        CASE ct.month
            WHEN 'mar' THEN 1
            WHEN 'apr' THEN 2
            WHEN 'may' THEN 3
            WHEN 'jun' THEN 4
            WHEN 'jul' THEN 5
            WHEN 'aug' THEN 6
            WHEN 'sep' THEN 7
            WHEN 'oct' THEN 8
            WHEN 'nov' THEN 9
            WHEN 'dec' THEN 10
            ELSE 11
        END;
    """
    cursor.execute(month_query, params)
    monthly_pattern = [dict(row) for row in cursor.fetchall()]

    # 8. Highest historical response group
    highest_group = "N/A"
    highest_rate = 0.0
    if job_distribution:
        # Check jobs with at least 50 records in sample
        significant_jobs = [j for j in job_distribution if j["total"] >= 50]
        if significant_jobs:
            top_job = max(significant_jobs, key=lambda x: x["response_rate"])
            highest_group = f"{top_job['occupation'].title()} ({top_job['response_rate']}%)"
            highest_rate = top_job["response_rate"]
        elif job_distribution:
            top_job = max(job_distribution, key=lambda x: x["response_rate"])
            highest_group = f"{top_job['occupation'].title()} ({top_job['response_rate']}%)"
            highest_rate = top_job["response_rate"]

    # 9. Dynamic Descriptive Insights (Non-causal)
    insights = []
    if age_distribution:
        top_age = max(age_distribution, key=lambda x: x["response_rate"])
        insights.append(
            f"Customers in the {top_age['age_group']} age bracket showed a {top_age['response_rate']}% historical response rate in the selected data."
        )

    if contact_distribution and len(contact_distribution) >= 2:
        cell_rate = next((c["response_rate"] for c in contact_distribution if c["contact_method"] == "cellular"), None)
        tel_rate = next((c["response_rate"] for c in contact_distribution if c["contact_method"] == "telephone"), None)
        if cell_rate is not None and tel_rate is not None:
            if cell_rate > tel_rate:
                insights.append(
                    f"Cellular contacts showed a higher historical response rate ({cell_rate}%) than landline telephone contacts ({tel_rate}%) in the selected segment."
                )
            else:
                insights.append(
                    f"Landline telephone contacts showed a {tel_rate}% response rate compared to {cell_rate}% for cellular contacts in this selection."
                )

    if poutcome_distribution:
        success_item = next((p for p in poutcome_distribution if p["previous_outcome"] == "success"), None)
        if success_item and success_item["total"] > 0:
            insights.append(
                f"Customers with previous successful campaign outcomes recorded a {success_item['response_rate']}% historical response rate in this dataset."
            )

    if contact_frequency:
        first_contact = next((f for f in contact_frequency if f["contact_bucket"] == "1 Contact"), None)
        multi_contacts = next((f for f in contact_frequency if f["contact_bucket"] == "6+ Contacts"), None)
        if first_contact and multi_contacts:
            insights.append(
                f"Customers contacted at different frequencies showed different historical response rates ({first_contact['response_rate']}% for 1 contact vs {multi_contacts['response_rate']}% for 6+ contacts) in the dataset."
            )

    # 10. Campaign Story
    filter_desc_items = []
    if filters.get("age_group") or filters.get("ageGroup"):
        filter_desc_items.append(f"Age: {filters.get('age_group') or filters.get('ageGroup')}")
    if filters.get("job") or filters.get("occupation"):
        filter_desc_items.append(f"Occupation: {filters.get('job') or filters.get('occupation')}")
    if filters.get("contact") or filters.get("contactMethod"):
        filter_desc_items.append(f"Contact: {filters.get('contact') or filters.get('contactMethod')}")
    if filters.get("month"):
        filter_desc_items.append(f"Month: {filters.get('month').upper()}")
    if filters.get("poutcome") or filters.get("previousResult"):
        filter_desc_items.append(f"Previous: {filters.get('poutcome') or filters.get('previousResult')}")

    filter_desc_text = ", ".join(filter_desc_items) if filter_desc_items else "All historical records"

    campaign_story = {
        "title": "CAMPAIGN OVERVIEW",
        "total_records": total_records,
        "positive_responses": positive_responses,
        "response_rate": response_rate,
        "active_focus": filter_desc_text,
        "summary_text": (
            f"{total_records:,} campaign records analyzed from the warehouse. "
            f"{positive_responses:,} records resulted in a positive subscription response, "
            f"yielding a historical response rate of {response_rate}%. "
            f"The selected filters currently focus on: {filter_desc_text}."
        )
    }

    conn.close()

    return {
        "kpis": {
            "total_records": total_records,
            "positive_responses": positive_responses,
            "response_rate": response_rate,
            "total_contacts": total_contacts,
            "avg_duration": avg_duration,
            "highest_response_group": highest_group,
            "highest_response_rate": highest_rate,
        },
        "age_distribution": age_distribution,
        "contact_distribution": contact_distribution,
        "job_distribution": job_distribution,
        "contact_frequency": contact_frequency,
        "poutcome_distribution": poutcome_distribution,
        "monthly_pattern": monthly_pattern,
        "insights": insights,
        "campaign_story": campaign_story,
        "applied_filters": filters
    }


def olap_rollup(dimension: str = "age_group") -> List[Dict[str, Any]]:
    """
    OLAP ROLL-UP: Summarize data from granular levels to higher hierarchy levels.
    e.g. Age Group, Occupation, Contact Method, Previous Outcome, or Overall.
    Manager label: View Summary
    """
    conn = get_connection()
    cursor = conn.cursor()

    if dimension == "age_group":
        query = f"""
        SELECT 
            {AGE_CASE_SQL} AS group_name,
            COUNT(f.record_key) AS total,
            SUM(CASE WHEN f.response = 'yes' THEN 1 ELSE 0 END) AS yes,
            SUM(CASE WHEN f.response = 'no' THEN 1 ELSE 0 END) AS no,
            ROUND(100.0 * SUM(CASE WHEN f.response = 'yes' THEN 1 ELSE 0 END) / COUNT(f.record_key), 2) AS response_rate
        FROM fact_campaign f
        JOIN dim_customer c ON f.customer_key = c.customer_key
        GROUP BY group_name
        ORDER BY 
            CASE group_name
                WHEN '18-25' THEN 1
                WHEN '26-35' THEN 2
                WHEN '36-45' THEN 3
                WHEN '46-55' THEN 4
                WHEN '56-65' THEN 5
                ELSE 6
            END;
        """
    elif dimension == "occupation":
        query = """
        SELECT 
            c.job AS group_name,
            COUNT(f.record_key) AS total,
            SUM(CASE WHEN f.response = 'yes' THEN 1 ELSE 0 END) AS yes,
            SUM(CASE WHEN f.response = 'no' THEN 1 ELSE 0 END) AS no,
            ROUND(100.0 * SUM(CASE WHEN f.response = 'yes' THEN 1 ELSE 0 END) / COUNT(f.record_key), 2) AS response_rate
        FROM fact_campaign f
        JOIN dim_customer c ON f.customer_key = c.customer_key
        GROUP BY c.job
        ORDER BY response_rate DESC;
        """
    elif dimension == "contact_method":
        query = """
        SELECT 
            ct.contact AS group_name,
            COUNT(f.record_key) AS total,
            SUM(CASE WHEN f.response = 'yes' THEN 1 ELSE 0 END) AS yes,
            SUM(CASE WHEN f.response = 'no' THEN 1 ELSE 0 END) AS no,
            ROUND(100.0 * SUM(CASE WHEN f.response = 'yes' THEN 1 ELSE 0 END) / COUNT(f.record_key), 2) AS response_rate
        FROM fact_campaign f
        JOIN dim_contact ct ON f.contact_key = ct.contact_key
        GROUP BY ct.contact
        ORDER BY response_rate DESC;
        """
    elif dimension == "previous_result":
        query = """
        SELECT 
            h.poutcome AS group_name,
            COUNT(f.record_key) AS total,
            SUM(CASE WHEN f.response = 'yes' THEN 1 ELSE 0 END) AS yes,
            SUM(CASE WHEN f.response = 'no' THEN 1 ELSE 0 END) AS no,
            ROUND(100.0 * SUM(CASE WHEN f.response = 'yes' THEN 1 ELSE 0 END) / COUNT(f.record_key), 2) AS response_rate
        FROM fact_campaign f
        JOIN dim_campaign_history h ON f.campaign_history_key = h.campaign_history_key
        GROUP BY h.poutcome
        ORDER BY response_rate DESC;
        """
    else:  # overall
        query = """
        SELECT 
            'All Campaign Records' AS group_name,
            COUNT(f.record_key) AS total,
            SUM(CASE WHEN f.response = 'yes' THEN 1 ELSE 0 END) AS yes,
            SUM(CASE WHEN f.response = 'no' THEN 1 ELSE 0 END) AS no,
            ROUND(100.0 * SUM(CASE WHEN f.response = 'yes' THEN 1 ELSE 0 END) / COUNT(f.record_key), 2) AS response_rate
        FROM fact_campaign f;
        """

    cursor.execute(query)
    results = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return results


def olap_drilldown(parent_dim: str, parent_value: str, drill_dim: str) -> List[Dict[str, Any]]:
    """
    OLAP DRILL-DOWN: Move down hierarchy levels (e.g. Age Group -> Occupation -> Contact Method).
    Manager label: Explore Details
    """
    conn = get_connection()
    cursor = conn.cursor()

    where_clause = ""
    params = []

    if parent_dim == "ageGroup" or parent_dim == "age_group":
        if parent_value == "18-25":
            where_clause = "WHERE c.age BETWEEN 18 AND 25"
        elif parent_value == "26-35":
            where_clause = "WHERE c.age BETWEEN 26 AND 35"
        elif parent_value == "36-45":
            where_clause = "WHERE c.age BETWEEN 36 AND 45"
        elif parent_value == "46-55":
            where_clause = "WHERE c.age BETWEEN 46 AND 55"
        elif parent_value == "56-65":
            where_clause = "WHERE c.age BETWEEN 56 AND 65"
        elif parent_value == "66+":
            where_clause = "WHERE c.age >= 66"
    elif parent_dim == "occupation":
        where_clause = "WHERE c.job = ?"
        params.append(parent_value)
    elif parent_dim == "contactMethod" or parent_dim == "contact_method":
        where_clause = "WHERE ct.contact = ?"
        params.append(parent_value)

    if drill_dim == "occupation":
        select_group = "c.job"
    elif drill_dim == "contactMethod" or drill_dim == "contact_method":
        select_group = "ct.contact"
    elif drill_dim == "previousResult" or drill_dim == "previous_result":
        select_group = "h.poutcome"
    else:
        select_group = AGE_CASE_SQL

    query = f"""
    SELECT
        {select_group} AS group_name,
        COUNT(f.record_key) AS total,
        SUM(CASE WHEN f.response = 'yes' THEN 1 ELSE 0 END) AS yes,
        SUM(CASE WHEN f.response = 'no' THEN 1 ELSE 0 END) AS no,
        ROUND(100.0 * SUM(CASE WHEN f.response = 'yes' THEN 1 ELSE 0 END) / COUNT(f.record_key), 2) AS response_rate
    FROM fact_campaign f
    JOIN dim_customer c ON f.customer_key = c.customer_key
    JOIN dim_contact ct ON f.contact_key = ct.contact_key
    JOIN dim_campaign_history h ON f.campaign_history_key = h.campaign_history_key
    JOIN dim_market m ON f.market_key = m.market_key
    {where_clause}
    GROUP BY group_name
    ORDER BY response_rate DESC;
    """

    cursor.execute(query, params)
    results = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return results


def olap_slice(dimension: str, value: str) -> Dict[str, Any]:
    """
    OLAP SLICE: Fixes one dimension to a single value and summarizes campaign performance.
    Manager label: Focus on One Group
    """
    filters = {}
    if dimension in ["age_group", "ageGroup"]:
        filters["age_group"] = value
    elif dimension in ["occupation", "job"]:
        filters["job"] = value
    elif dimension in ["contact_method", "contactMethod", "contact"]:
        filters["contact"] = value
    elif dimension in ["previous_result", "previousResult", "poutcome"]:
        filters["poutcome"] = value
    elif dimension == "month":
        filters["month"] = value

    return get_dashboard_data(filters)


def olap_dice(filters: Dict[str, Any]) -> Dict[str, Any]:
    """
    OLAP DICE: Multiple dimension constraints simultaneously.
    Manager label: Compare Customer Groups
    """
    return get_dashboard_data(filters)


def get_historical_context(age: Optional[int], job: Optional[str], contact: Optional[str], poutcome: Optional[str]) -> Dict[str, Any]:
    """
    Calculates empirical historical response rate for customer profiles similar
    to the given customer attributes.
    """
    conn = get_connection()
    cursor = conn.cursor()

    clauses = []
    params = []

    if age is not None:
        if age < 26:
            clauses.append("c.age BETWEEN 18 AND 25")
        elif age <= 35:
            clauses.append("c.age BETWEEN 26 AND 35")
        elif age <= 45:
            clauses.append("c.age BETWEEN 36 AND 45")
        elif age <= 55:
            clauses.append("c.age BETWEEN 46 AND 55")
        elif age <= 65:
            clauses.append("c.age BETWEEN 56 AND 65")
        else:
            clauses.append("c.age >= 66")

    if job and job != "unknown":
        clauses.append("c.job = ?")
        params.append(job)

    if contact:
        clauses.append("ct.contact = ?")
        params.append(contact)

    if poutcome and poutcome != "nonexistent":
        clauses.append("h.poutcome = ?")
        params.append(poutcome)

    where_sql = ("WHERE " + " AND ".join(clauses)) if clauses else ""

    query = f"""
    SELECT
        COUNT(f.record_key) AS total,
        SUM(CASE WHEN f.response = 'yes' THEN 1 ELSE 0 END) AS yes,
        ROUND(100.0 * SUM(CASE WHEN f.response = 'yes' THEN 1 ELSE 0 END) / MAX(1, COUNT(f.record_key)), 2) AS response_rate
    FROM fact_campaign f
    JOIN dim_customer c ON f.customer_key = c.customer_key
    JOIN dim_contact ct ON f.contact_key = ct.contact_key
    JOIN dim_campaign_history h ON f.campaign_history_key = h.campaign_history_key
    JOIN dim_market m ON f.market_key = m.market_key
    {where_sql};
    """
    cursor.execute(query, params)
    row = cursor.fetchone()
    total = row["total"] or 0
    yes = row["yes"] or 0
    rate = row["response_rate"] or 0.0

    # If narrow segment has too few records (<20), fall back to broader occupation + contact
    if total < 20 and job:
        fallback_query = """
        SELECT
            COUNT(f.record_key) AS total,
            SUM(CASE WHEN f.response = 'yes' THEN 1 ELSE 0 END) AS yes,
            ROUND(100.0 * SUM(CASE WHEN f.response = 'yes' THEN 1 ELSE 0 END) / MAX(1, COUNT(f.record_key)), 2) AS response_rate
        FROM fact_campaign f
        JOIN dim_customer c ON f.customer_key = c.customer_key
        WHERE c.job = ?;
        """
        cursor.execute(fallback_query, [job])
        fb_row = cursor.fetchone()
        total = fb_row["total"] or 0
        yes = fb_row["yes"] or 0
        rate = fb_row["response_rate"] or 0.0
        segment_desc = f"Customers with occupation '{job}'"
    else:
        segment_desc = "Customers with similar selected demographic and contact profile"

    conn.close()

    return {
        "matching_records": total,
        "positive_responses": yes,
        "historical_response_rate": rate,
        "segment_description": segment_desc,
        "disclaimer": "Historical statistics are descriptive patterns from previous campaigns and not a guarantee of future outcomes."
    }


def get_warehouse_schema() -> Dict[str, Any]:
    """
    Returns the real Data Warehouse tables, primary keys, foreign keys, and row counts.
    Used by the Technical Details page to verify the Star Schema implementation.
    """
    conn = get_connection()
    cursor = conn.cursor()

    tables_info = {}
    for table in ALLOWED_TABLES:
        cursor.execute(f"SELECT COUNT(*) FROM {table};")
        row_count = cursor.fetchone()[0]

        cursor.execute(f"PRAGMA table_info({table});")
        columns = [
            {
                "name": col["name"],
                "type": col["type"],
                "pk": bool(col["pk"]),
                "notnull": bool(col["notnull"]),
            }
            for col in cursor.fetchall()
        ]

        cursor.execute(f"PRAGMA foreign_key_list({table});")
        foreign_keys = [
            {
                "id": fk["id"],
                "from": fk["from"],
                "table": fk["table"],
                "to": fk["to"],
            }
            for fk in cursor.fetchall()
        ]

        tables_info[table] = {
            "row_count": row_count,
            "columns": columns,
            "foreign_keys": foreign_keys
        }

    conn.close()

    return {
        "database": "bank_warehouse.db",
        "schema_type": "Star Schema",
        "central_fact": "fact_campaign",
        "dimension_tables": ["dim_customer", "dim_contact", "dim_campaign_history", "dim_market"],
        "tables": tables_info
    }


def get_table_sample(table_name: str, limit: int = 5) -> Dict[str, Any]:
    """
    Fetches real sample rows from any warehouse table with safe whitelist verification.
    """
    if table_name not in ALLOWED_TABLES:
        raise ValueError(f"Table '{table_name}' is not an authorized warehouse table.")

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(f"PRAGMA table_info({table_name});")
    columns = [col["name"] for col in cursor.fetchall()]

    safe_limit = max(1, min(limit, 50))
    cursor.execute(f"SELECT * FROM {table_name} LIMIT {safe_limit};")
    rows = [dict(row) for row in cursor.fetchall()]

    cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
    total_count = cursor.fetchone()[0]

    conn.close()

    return {
        "table": table_name,
        "columns": columns,
        "sample_rows": rows,
        "total_records": total_count
    }
