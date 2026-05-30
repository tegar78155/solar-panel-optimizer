from flask import Flask, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return jsonify({
        "status": "online",
        "message": "Backend Flask berjalan di Vercel"
    })

@app.route("/hill-climbing")
def hill_climbing():
    return jsonify({
        "algorithm": "Hill Climbing",
        "best_energy": random.randint(400, 500)
    })

@app.route("/simulated-annealing")
def simulated_annealing():
    return jsonify({
        "algorithm": "Simulated Annealing",
        "best_energy": random.randint(400, 500)
    })

@app.route("/genetic-algorithm")
def genetic_algorithm():
    return jsonify({
        "algorithm": "Genetic Algorithm",
        "best_energy": random.randint(400, 500)
    })

app = app