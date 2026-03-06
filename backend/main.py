from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import numpy as np
import pickle
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Car Value AI Prediction API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; refine for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define paths
ML_DIR = os.path.join("..", "ml")
MODEL_PATH = os.path.join(ML_DIR, "model.pkl")
ENCODERS_PATH = os.path.join(ML_DIR, "encoders.pkl")

# Load model and encoders
try:
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    with open(ENCODERS_PATH, 'rb') as f:
        encoders = pickle.load(f)
    print("Model and encoders loaded successfully.")
except Exception as e:
    print(f"Error loading model or encoders: {e}")
    model = None
    encoders = None

class CarDetails(BaseModel):
    brand: str
    model_name: str # Renamed to avoid confusion with the 'model' object
    year: int
    engine_size: float
    fuel_type: str
    transmission: str
    mileage: int
    doors: int
    owner_count: int

@app.get("/")
async def root():
    return {"message": "Car Value AI Prediction API is running"}

@app.get("/health")
async def health():
    return {"status": "healthy" if model and encoders else "error"}

@app.post("/predict")
async def predict(car: CarDetails):
    if not model or not encoders:
        raise HTTPException(status_code=500, detail="Model or encoders not loaded.")
    
    try:
        # Prepare input data for prediction
        input_data = {
            'Brand': car.brand,
            'Model': car.model_name,
            'Year': car.year,
            'Engine_Size': car.engine_size,
            'Fuel_Type': car.fuel_type,
            'Transmission': car.transmission,
            'Mileage': car.mileage,
            'Doors': car.doors,
            'Owner_Count': car.owner_count
        }
        
        # Convert to DataFrame
        df = pd.DataFrame([input_data])
        
        # Handle encoding
        categorical_cols = ['Brand', 'Model', 'Fuel_Type', 'Transmission']
        for col in categorical_cols:
            if col in encoders:
                le = encoders[col]
                # Handle unseen categories or case mismatch
                val = str(df[col].iloc[0])
                if val in le.classes_:
                    df[col] = le.transform([val])[0]
                else:
                    # Default to the first class or handle as error
                    print(f"Unseen category in {col}: {val}")
                    df[col] = le.transform([le.classes_[0]])[0]
        
        # Make prediction
        prediction = model.predict(df)
        
        # Return result
        return {
            "predicted_price": round(float(prediction[0]), 2),
            "currency": "USD" # Assuming USD based on dataset context
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

# To run: uvicorn main:app --reload
