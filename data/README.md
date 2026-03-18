# <p align="center">📦 Data | Source Repository</p>

---

## 🌟 Overview
This folder serves as the storage hub for the raw datasets used to train and calibrate the CarValue AI model.

---

## 🚀 Managed Assets
- **📄 car_data.csv**: The primary dataset containing historical car sales, features, and pricing used as the ground truth for training.

---

## 🔧 Maintenance Guidelines
- **Consistency**: Ensure column headers remain unchanged to prevent breaking the ML pipeline.
- **Privacy**: Never commit personally identifiable information (PII) to this directory.
- **Updates**: When adding new data, re-run the `ml/data_pipeline.py` script to regenerate the trained artifacts.

---

## 📄 License
This module is part of the CarValue AI project and is licensed under the **MIT License**.
