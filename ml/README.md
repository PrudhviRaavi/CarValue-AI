# ML Pipeline

This folder contains preprocessing and training scripts plus generated artifacts used by the backend.

## Files

- `data_pipeline.py`: reads raw dataset, encodes categorical columns, writes train/test splits and encoder map
- `train_model.py`: trains a Random Forest regressor and saves `model.pkl`
- `encoders.pkl`: label encoders for categorical features
- `model.pkl`: trained model used during prediction
- `X_train.csv`, `X_test.csv`, `y_train.csv`, `y_test.csv`: generated splits

## Training flow

Run from `ml/`:

```bash
python data_pipeline.py
python train_model.py
```

`data_pipeline.py` expects source data at:

`../data/car_data.csv`

`train_model.py` then consumes generated split files and writes model artifacts in this folder.

## Feature mapping used by API

The backend `/predict` route maps request fields into the model feature schema:

- `brand` -> `Brand`
- `model_name` -> `Model`
- `year` -> `Year`
- `engine_size` -> `Engine_Size`
- `fuel_type` -> `Fuel_Type`
- `transmission` -> `Transmission`
- `mileage` -> `Mileage`
- `doors` -> `Doors`
- `owner_count` -> `Owner_Count`

## Notes

- Keep preprocessing and training aligned with backend feature names.
- Regenerate `encoders.pkl` and `model.pkl` together to avoid mismatches.
