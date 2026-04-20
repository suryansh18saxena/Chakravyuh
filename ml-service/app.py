import os
from flask import Flask, request, jsonify
from sklearn.ensemble import IsolationForest
import numpy as np

app = Flask(__name__)

# Train a dummy IsolationForest model since we don't have the 12,000 samples here.
# In a real environment, we would load a pre-trained model using joblib.
model = IsolationForest(contamination=0.1, random_state=42)

# Generate some synthetic training data for numerical stability
# Features: [entropy, special_char_ratio, keyword_frequency, encoding_depth, body_length]
X_train = np.random.rand(100, 5) 
model.fit(X_train)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    
    # Extract features from incoming request
    entropy = data.get('entropy', 0.0)
    special_char_ratio = data.get('special_char_ratio', 0.0)
    keyword_freq = data.get('keyword_freq', 0.0)
    encoding_depth = data.get('encoding_depth', 0.0)
    body_length = data.get('body_length', 0)
    
    # Normalize lengths relative to our synthetic training set
    bl_normalized = min(body_length / 1000.0, 1.0)
    
    features = np.array([[entropy, special_char_ratio, keyword_freq, encoding_depth, bl_normalized]])
    
    # Predict (-1 is anomaly, 1 is normal)
    prediction = model.predict(features)[0]
    
    # Score is related to decision_function. Lower is more anomalous
    score = model.decision_function(features)[0]
    
    # Map score to a 0-100 anomaly scale roughly
    # If prediction is 1 (normal), anomaly score is low (0-30)
    # If prediction is -1 (anomaly), anomaly score is high (70-100)
    if prediction == 1:
        anomaly_score = int(max(0, 30 - score * 30))
    else:
        anomaly_score = int(min(100, 70 + abs(score) * 30))
    
    return jsonify({
        'is_anomaly': bool(prediction == -1),
        'anomaly_score': anomaly_score
    })

if __name__ == '__main__':
    app.run(port=5000)
