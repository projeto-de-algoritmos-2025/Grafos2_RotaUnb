from flask import Flask
from flask_cors import CORS

app = Flask(__name__, static_folder='../frontend', static_url_path='', template_folder='../frontend')
CORS(app)

if __name__ == '__main__':
    app.run(debug=True, port=5000)