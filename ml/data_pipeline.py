import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import pickle
import os

# Define paths
DATA_PATH = os.path.join("..", "data", "car_data.csv")
OUTPUT_DIR = os.path.join("..", "ml")

def run_pipeline():
    print("Loading data...")
    df = pd.read_csv(DATA_PATH)
    
    print(f"Dataset shape: {df.shape}")
    
    # Handle missing values (if any)
    df = df.dropna()
    
    # Feature Engineering
    # Encode categorical variables
    categorical_cols = ['Brand', 'Model', 'Fuel_Type', 'Transmission']
    encoders = {}
    
    for col in categorical_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        encoders[col] = le
        print(f"Encoded {col}")
        
    # Split features and target
    X = df.drop('Price', axis=1)
    y = df['Price']
    
    # Split into train and test sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Save encoders for later use in API
    with open(os.path.join(OUTPUT_DIR, 'encoders.pkl'), 'wb') as f:
        pickle.dump(encoders, f)
        
    # Save processed data
    X_train.to_csv(os.path.join(OUTPUT_DIR, 'X_train.csv'), index=False)
    X_test.to_csv(os.path.join(OUTPUT_DIR, 'X_test.csv'), index=False)
    y_train.to_csv(os.path.join(OUTPUT_DIR, 'y_train.csv'), index=False)
    y_test.to_csv(os.path.join(OUTPUT_DIR, 'y_test.csv'), index=False)
    
    print("Pipeline complete. Processed data and encoders saved.")

if __name__ == "__main__":
    run_pipeline()
