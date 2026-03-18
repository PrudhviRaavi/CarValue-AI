# <p align="center">🧠 ML Pipeline | Predictive Modeling</p>

---

## 🌟 Overview
This module handles the core intelligence of CarValue AI. It transforms raw automotive datasets into high-performance prediction models capable of estimating resale value with high precision.

---

## 🚀 Pipeline Components
- **🛠️ Data Pipeline**: Cleaning, encoding, and splitting raw data into train/test sets (`data_pipeline.py`).
- **🎓 Model Training**: Calibrating a **Random Forest Regressor** to maximize R² and minimize MAE (`train_model.py`).
- **💎 Model Artifacts**: Serialized encoders (`encoders.pkl`) and models (`model.pkl`) used by the API in real-time.

---

## 📊 Model Performance
Verified metrics from the latest training run:
- **R² Score**: `0.9762` (97.6% variance explained)
- **MAE**: `$370.67` (Average deviation from actual price)

---

## 🔧 Training Workflow

### **1. Data Preparation**
Run from the root or `ml/` folder:
```bash
python data_pipeline.py
```
*Input: `../data/car_data.csv` | Output: `X_train.csv`, `X_test.csv`, `y_train.csv`, `y_test.csv`, `encoders.pkl`*

### **2. Model Recalibration**
```bash
python train_model.py
```
*Output: `model.pkl`*

---

## 📄 Schema Mapping
The API maps request fields to the model features as follows:
- `brand` ➔ `Brand`
- `model_name` ➔ `Model`
- `year` ➔ `Year`
- `mileage` ➔ `Mileage`
- ...and others including engine size and fuel type.

---

## 📄 License
This module is part of the CarValue AI project and is licensed under the **MIT License**.
