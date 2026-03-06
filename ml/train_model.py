import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
import pickle
import os

# Define paths
ML_DIR = os.path.join("..", "ml")

def train_model():
    print("Loading processed data...")
    X_train = pd.read_csv(os.path.join(ML_DIR, 'X_train.csv'))
    y_train = pd.read_csv(os.path.join(ML_DIR, 'y_train.csv'))
    X_test = pd.read_csv(os.path.join(ML_DIR, 'X_test.csv'))
    y_test = pd.read_csv(os.path.join(ML_DIR, 'y_test.csv'))
    
    print("Training Random Forest model...")
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train.values.ravel())
    
    print("Evaluating model...")
    predictions = model.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)
    
    print(f"Mean Absolute Error: {mae}")
    print(f"R2 Score: {r2}")
    
    # Save the model
    with open(os.path.join(ML_DIR, 'model.pkl'), 'wb') as f:
        pickle.dump(model, f)
        
    print("Model trained and saved to model.pkl")

if __name__ == "__main__":
    train_model()
