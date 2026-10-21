from flask import Flask, render_template, request, jsonify
import joblib
import pandas as pd
import os

app = Flask(__name__)

# -----------------------------------------------------
# MODEL PATHS
# -----------------------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "customer_churn_pipeline.pkl"
)

THRESHOLD_PATH = os.path.join(
    BASE_DIR,
    "customer_churn_threshold.pkl"
)


# -----------------------------------------------------
# LOAD MODEL
# -----------------------------------------------------

try:
    model = joblib.load(MODEL_PATH)

    try:
        threshold = joblib.load(THRESHOLD_PATH)
        threshold = float(threshold)
    except Exception:
        threshold = 0.5

    print("Model loaded successfully")
    print("Threshold:", threshold)

except Exception as e:
    print("Error loading model:", e)
    model = None
    threshold = 0.5


# -----------------------------------------------------
# HOME PAGE
# -----------------------------------------------------

@app.route("/")
def home():
    return render_template("index.html")


# -----------------------------------------------------
# PREDICTION
# -----------------------------------------------------

@app.route("/predict", methods=["POST"])
def predict():

    if model is None:
        return jsonify({
            "success": False,
            "error": "Model could not be loaded."
        }), 500

    try:

        data = request.get_json()

        # -------------------------------------------------
        # CREATE INPUT DATA
        #
        # IMPORTANT:
        # These column names should be the SAME column names
        # used when training your model.
        # -------------------------------------------------

        input_data = pd.DataFrame([{

            "gender": data["gender"],
            "SeniorCitizen": int(data["SeniorCitizen"]),
            "Partner": data["Partner"],
            "Dependents": data["Dependents"],

            "tenure": int(data["tenure"]),

            "PhoneService": data["PhoneService"],
            "MultipleLines": data["MultipleLines"],

            "InternetService": data["InternetService"],

            "OnlineSecurity": data["OnlineSecurity"],
            "OnlineBackup": data["OnlineBackup"],
            "DeviceProtection": data["DeviceProtection"],
            "TechSupport": data["TechSupport"],

            "StreamingTV": data["StreamingTV"],
            "StreamingMovies": data["StreamingMovies"],

            "Contract": data["Contract"],
            "PaperlessBilling": data["PaperlessBilling"],
            "PaymentMethod": data["PaymentMethod"],

            "MonthlyCharges": float(data["MonthlyCharges"]),
            "TotalCharges": float(data["TotalCharges"])
        }])

        print("\nInput received:")
        print(input_data)

        # -------------------------------------------------
        # PREDICTION PROBABILITY
        # -------------------------------------------------

        probability = model.predict_proba(input_data)[0][1]

        prediction = 1 if probability >= threshold else 0

        # Risk level
        if probability < 0.30:
            risk = "Low"
        elif probability < 0.60:
            risk = "Medium"
        else:
            risk = "High"

        return jsonify({
            "success": True,
            "prediction": int(prediction),
            "probability": round(float(probability) * 100, 2),
            "risk": risk
        })

    except Exception as e:

        print("Prediction error:", e)

        return jsonify({
            "success": False,
            "error": str(e)
        }), 400


# -----------------------------------------------------
# START SERVER
# -----------------------------------------------------

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True,

        # IMPORTANT:
        # Fixes:
        # "signal only works in main thread"
        use_reloader=False
    )