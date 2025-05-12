from flask import Flask, jsonify
from flask_cors import CORS
import os
import json
from flask import render_template
from flask import request
from algorithms import Graph, dijkstra

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_PATH = os.path.join(BASE_DIR, '../data/grafo.json')
app = Flask(__name__, static_folder='../frontend', static_url_path='', template_folder='../frontend')
CORS(app)

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
    
@app.route('/api/calculate-path', methods=['POST'])
def calculate_path():
    try:
        data = load_campus_data()
        req_data = request.get_json()
        start = int(req_data['start'])
        end = int(req_data['end'])
        
        graph = Graph()
        
        for loc in data:
            graph.add_vertex(loc['índice'])
        
        for loc in data:
            for neighbor in loc['vizinhos']:
                graph.add_edge(loc['índice'], neighbor['índice'], neighbor['distancia'])
        
        previous_nodes, shortest_path = dijkstra(graph, start)
        
        path = []
        node = end
        while node is not None:
            path.insert(0, node)
            node = previous_nodes.get(node)
        
        if not path or path[0] != start:
            return jsonify({'error': 'Path not found'}), 404
        
        distance = shortest_path.get(end, 0)
        
        path_details = []
        for idx in path:
            loc = next((x for x in data if x['índice'] == idx), None)
            if loc:
                path_details.append({
                    'index': loc['índice'],
                    'name': loc['nome'],
                    'sigla': loc['sigla']
                })
        
        return jsonify({
            'path': path,
            'distance': distance,
            'path_details': path_details
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

if __name__ == '__main__':
    app.run(debug=True, port=5000)