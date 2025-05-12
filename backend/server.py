from flask import Flask, jsonify

from flask_cors import CORS
import os
import json
from flask import render_template

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_PATH = os.path.join(BASE_DIR, '../data/grafo.json')
app = Flask(__name__, static_folder='../frontend', static_url_path='', template_folder='../frontend')
CORS(app)

if __name__ == '__main__':
    app.run(debug=True, port=5000)

def load_campus_data():
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/locations')
def get_locations():
    try:
        data = load_campus_data()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500