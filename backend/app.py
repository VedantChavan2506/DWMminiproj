import os
import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

from warehouse.warehouse_service import (
    get_dashboard_data,
    olap_rollup,
    olap_drilldown,
    olap_slice,
    olap_dice,
    get_historical_context,
    get_warehouse_schema,
    get_table_sample,
)

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for React dashboard

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "model")
PREPROCESSOR_PATH = os.path.join(MODEL_DIR, "preprocessor.pkl")
MODEL_PATH = os.path.join(MODEL_DIR, "xgb_model.pkl")

preprocessor = None
xgb_model = None


def load_artifacts():
    global preprocessor, xgb_model
    if os.path.exists(PREPROCESSOR_PATH) and os.path.exists(MODEL_PATH):
        try:
            preprocessor = joblib.load(PREPROCESSOR_PATH)
            xgb_model = joblib.load(MODEL_PATH)
            print("Successfully loaded preprocessor and XGBoost model.")
        except Exception as e:
            print(f"Error loading model artifacts: {e}")
    else:
        print("Warning: Model artifacts not found. Run train_and_save.py first.")


def probability_to_business(prob_yes: float) -> dict:
    """
    Convert raw model probability into business-friendly interest level,
    priority and recommended action. Keeps ML logic hidden from the UI.
    """
    pct = round(prob_yes * 100, 1)

    if prob_yes >= 0.60:
        interest_level = "HIGH"
        priority = "HIGH"
        recommended_action = (
            "Consider prioritizing this customer for a personalized follow-up call. "
            "Their profile aligns well with customers who have previously shown strong interest."
        )
    elif prob_yes >= 0.35:
        interest_level = "MEDIUM"
        priority = "MEDIUM"
        recommended_action = (
            "This customer may be worth a follow-up. "
            "A brief, focused conversation could help gauge their interest further."
        )
    else:
        interest_level = "LOW"
        priority = "LOW"
        recommended_action = (
            "Focus campaign resources on higher-priority customers first. "
            "This customer may be revisited in a future campaign cycle."
        )

    return {
        "interest_level": interest_level,
        "priority": priority,
        "recommended_action": recommended_action,
        "estimated_likelihood": pct,
    }


load_artifacts()


# ─── Existing Endpoints (Preserved) ──────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": (preprocessor is not None and xgb_model is not None),
        "warehouse_available": True
    }), 200


@app.route("/predict", methods=["POST"])
def predict():
    if preprocessor is None or xgb_model is None:
        load_artifacts()
        if preprocessor is None or xgb_model is None:
            return jsonify({
                "error": "Assessment service is currently unavailable. Please try again later."
            }), 503

    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "No input provided."}), 400

        # Required fields
        required_fields = [
            "age", "job", "contact", "campaign",
            "previous", "poutcome", "euribor3m", "duration"
        ]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # Build single row dataframe with proper types
        input_dict = {
            "age": [float(data["age"])],
            "job": [str(data["job"])],
            "contact": [str(data["contact"])],
            "campaign": [float(data["campaign"])],
            "previous": [float(data["previous"])],
            "poutcome": [str(data["poutcome"])],
            "euribor3m": [float(data["euribor3m"])],
            "duration": [float(data["duration"])],
        }
        df_input = pd.DataFrame(input_dict)

        # Transform using existing preprocessor pipeline
        X_processed = preprocessor.transform(df_input)

        # Predict probability using trained XGBoost model
        proba = xgb_model.predict_proba(X_processed)[0]
        prob_yes = float(proba[1])
        prediction = "yes" if prob_yes >= 0.5 else "no"

        # Enrich with business-friendly fields
        business = probability_to_business(prob_yes)

        # Query Star Schema Data Warehouse for empirical historical context
        try:
            hist_context = get_historical_context(
                age=int(float(data["age"])),
                job=str(data["job"]),
                contact=str(data["contact"]),
                poutcome=str(data["poutcome"])
            )
        except Exception as e:
            hist_context = {
                "matching_records": 0,
                "positive_responses": 0,
                "historical_response_rate": 0.0,
                "segment_description": "Historical data unavailable",
                "disclaimer": "Historical statistics are descriptive patterns."
            }

        return jsonify({
            "prediction": prediction,
            "probability": round(prob_yes, 4),
            "interest_level": business["interest_level"],
            "priority": business["priority"],
            "recommended_action": business["recommended_action"],
            "estimated_likelihood": business["estimated_likelihood"],
            "historical_context": hist_context
        }), 200

    except Exception as e:
        return jsonify({"error": "An error occurred during assessment. Please check your inputs."}), 500


# ─── Data Warehouse & OLAP API Endpoints ─────────────────────────────────────

@app.route("/api/warehouse/summary", methods=["GET"])
def warehouse_summary():
    """
    Returns full Manager Dashboard dataset powered by SQL Star Schema.
    Accepts filter query parameters: age_group, job, contact, month, poutcome, campaign_range.
    """
    try:
        filters = request.args.to_dict()
        data = get_dashboard_data(filters)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve warehouse summary: {str(e)}"}), 500


@app.route("/api/warehouse/olap/rollup", methods=["GET"])
def warehouse_rollup():
    """
    OLAP Roll-Up endpoint: Summarizes campaign results at a higher dimension level.
    Query param: dimension (e.g. age_group, occupation, contact_method, previous_result, overall).
    """
    try:
        dimension = request.args.get("dimension", "age_group")
        data = olap_rollup(dimension)
        return jsonify({
            "operation": "ROLL-UP",
            "manager_label": "View Summary",
            "dimension": dimension,
            "data": data
        }), 200
    except Exception as e:
        return jsonify({"error": f"Failed to execute roll-up: {str(e)}"}), 500


@app.route("/api/warehouse/olap/drilldown", methods=["GET"])
def warehouse_drilldown():
    """
    OLAP Drill-Down endpoint: Moves down hierarchy levels.
    Query params: parent_dim, parent_value, drill_dim.
    """
    try:
        parent_dim = request.args.get("parent_dim", "ageGroup")
        parent_value = request.args.get("parent_value", "36-45")
        drill_dim = request.args.get("drill_dim", "occupation")
        data = olap_drilldown(parent_dim, parent_value, drill_dim)
        return jsonify({
            "operation": "DRILL-DOWN",
            "manager_label": "Explore Details",
            "parent_dimension": parent_dim,
            "parent_value": parent_value,
            "drill_dimension": drill_dim,
            "data": data
        }), 200
    except Exception as e:
        return jsonify({"error": f"Failed to execute drill-down: {str(e)}"}), 500


@app.route("/api/warehouse/olap/slice", methods=["GET"])
def warehouse_slice():
    """
    OLAP Slice endpoint: Focuses on one dimension constraint.
    Query params: dimension, value.
    """
    try:
        dimension = request.args.get("dimension", "age_group")
        value = request.args.get("value", "36-45")
        data = olap_slice(dimension, value)
        return jsonify({
            "operation": "SLICE",
            "manager_label": "Focus on One Group",
            "dimension": dimension,
            "value": value,
            "data": data
        }), 200
    except Exception as e:
        return jsonify({"error": f"Failed to execute slice: {str(e)}"}), 500


@app.route("/api/warehouse/olap/dice", methods=["GET", "POST"])
def warehouse_dice():
    """
    OLAP Dice endpoint: Filters multiple dimensions simultaneously.
    Query params or JSON body.
    """
    try:
        if request.method == "POST" and request.is_json:
            filters = request.get_json()
        else:
            filters = request.args.to_dict()
        data = olap_dice(filters)
        return jsonify({
            "operation": "DICE",
            "manager_label": "Compare Customer Groups",
            "filters": filters,
            "data": data
        }), 200
    except Exception as e:
        return jsonify({"error": f"Failed to execute dice: {str(e)}"}), 500


@app.route("/api/warehouse/tables", methods=["GET"])
def warehouse_tables():
    """
    Returns warehouse metadata, Star Schema structure, PK/FK definitions, and row counts.
    Used by Technical Details page.
    """
    try:
        schema = get_warehouse_schema()
        return jsonify(schema), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch schema metadata: {str(e)}"}), 500


@app.route("/api/warehouse/table/<table_name>", methods=["GET"])
def warehouse_table_sample(table_name: str):
    """
    Returns actual sample rows and columns from an authorized warehouse table.
    """
    try:
        limit = int(request.args.get("limit", 8))
        sample = get_table_sample(table_name, limit)
        return jsonify(sample), 200
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": f"Failed to fetch sample rows: {str(e)}"}), 500


@app.route("/api/warehouse/context", methods=["GET"])
def warehouse_context():
    """
    Returns empirical historical campaign context for given customer attributes.
    """
    try:
        age = int(request.args.get("age")) if request.args.get("age") else None
        job = request.args.get("job")
        contact = request.args.get("contact")
        poutcome = request.args.get("poutcome")
        context_data = get_historical_context(age, job, contact, poutcome)
        return jsonify(context_data), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch historical context: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
