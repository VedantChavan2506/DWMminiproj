import os
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from imblearn.over_sampling import SMOTE
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix

def main():
    print("Loading bank-additional-full.csv...")
    csv_path = os.path.join(os.path.dirname(__file__), "..", "bank-additional-full.csv")
    df = pd.read_csv(csv_path, sep=';')
    print(f"Initial shape: {df.shape}")

    # Remove duplicates
    duplicates_count = df.duplicated().sum()
    df = df.drop_duplicates()
    print(f"Duplicates removed: {duplicates_count}, Clean shape: {df.shape}")

    # Feature selection matching the notebook
    features = [
        "age",
        "job",
        "contact",
        "campaign",
        "previous",
        "poutcome",
        "euribor3m",
        "duration"
    ]

    X = df[features]
    y = df["y"]

    # Stratified Train/Test Split (80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    num_cols = ["age", "campaign", "previous", "euribor3m", "duration"]
    cat_cols = ["job", "contact", "poutcome"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), num_cols),
            ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols)
        ]
    )

    print("Fitting preprocessor...")
    X_train_processed = preprocessor.fit_transform(X_train)
    X_test_processed = preprocessor.transform(X_test)

    print("Applying SMOTE (sampling_strategy=0.5, random_state=42)...")
    smote = SMOTE(sampling_strategy=0.5, random_state=42)
    X_train_smote, y_train_smote = smote.fit_resample(X_train_processed, y_train)

    print(f"Train counts before SMOTE: {dict(y_train.value_counts())}")
    print(f"Train counts after SMOTE: {dict(y_train_smote.value_counts())}")

    y_train_xgb = y_train_smote.map({"no": 0, "yes": 1})
    y_test_xgb = y_test.map({"no": 0, "yes": 1})

    print("Training XGBClassifier...")
    xgb_model = XGBClassifier(
        n_estimators=200,
        max_depth=5,
        learning_rate=0.05,
        random_state=42,
        eval_metric="logloss"
    )
    xgb_model.fit(X_train_smote, y_train_xgb)

    # Predictions & Evaluation
    y_pred = xgb_model.predict(X_test_processed)
    y_prob = xgb_model.predict_proba(X_test_processed)[:, 1]

    acc = accuracy_score(y_test_xgb, y_pred)
    prec = precision_score(y_test_xgb, y_pred)
    rec = recall_score(y_test_xgb, y_pred)
    f1 = f1_score(y_test_xgb, y_pred)
    auc = roc_auc_score(y_test_xgb, y_prob)
    cm = confusion_matrix(y_test_xgb, y_pred)

    print("\n--- MODEL EVALUATION ---")
    print(f"Accuracy:  {acc:.6f}")
    print(f"Precision: {prec:.6f}")
    print(f"Recall:    {rec:.6f}")
    print(f"F1 Score:  {f1:.6f}")
    print(f"AUC Score: {auc:.6f}")
    print(f"Confusion Matrix:\n{cm}")
    tn, fp, fn, tp = cm.ravel()
    print(f"TN: {tn}, FP: {fp}, FN: {fn}, TP: {tp}")

    # Ensure model dir exists
    model_dir = os.path.join(os.path.dirname(__file__), "model")
    os.makedirs(model_dir, exist_ok=True)

    preprocessor_path = os.path.join(model_dir, "preprocessor.pkl")
    model_path = os.path.join(model_dir, "xgb_model.pkl")

    print(f"Saving preprocessor to {preprocessor_path}...")
    joblib.dump(preprocessor, preprocessor_path)

    print(f"Saving XGBoost model to {model_path}...")
    joblib.dump(xgb_model, model_path)

    print("Model and preprocessor saved successfully!")

if __name__ == "__main__":
    main()

