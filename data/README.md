# Data

This folder stores source dataset files for model training.

## Current dataset

- `car_data.csv`: base dataset consumed by `ml/data_pipeline.py`

## Usage

The file is read by the ML pipeline and transformed into encoded train/test data under `ml/`.

## Guidelines

- Keep column names compatible with the ML pipeline.
- If dataset schema changes, update `ml/data_pipeline.py` and validate backend inference.
- Avoid committing sensitive or private user data.
