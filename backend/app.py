from flask import Flask, jsonify
from flask_cors import CORS
import numpy as np
import random
import math
import time

app = Flask(__name__)
CORS(app)

GRID_SIZE = 10
PANEL_COUNT = 5
ITERATIONS = 100


def generate_grid():
    return np.random.randint(1, 100, (GRID_SIZE, GRID_SIZE)).tolist()


def all_positions():
    return [(r, c) for r in range(GRID_SIZE) for c in range(GRID_SIZE)]


def calculate_energy(grid, panels):
    return sum(grid[r][c] for r, c in panels)


def random_panels():
    return random.sample(all_positions(), PANEL_COUNT)


def mutate_solution(solution):
    neighbor = solution.copy()
    index = random.randint(0, PANEL_COUNT - 1)
    new_pos = random.choice(all_positions())

    while new_pos in neighbor:
        new_pos = random.choice(all_positions())

    neighbor[index] = new_pos
    return neighbor


def hill_climbing(grid):
    start_time = time.time()

    current = random_panels()
    current_energy = calculate_energy(grid, current)

    best = current
    best_energy = current_energy

    history = []

    for step in range(ITERATIONS):
        neighbor = mutate_solution(current)
        neighbor_energy = calculate_energy(grid, neighbor)

        if neighbor_energy > current_energy:
            current = neighbor
            current_energy = neighbor_energy

        if current_energy > best_energy:
            best = current
            best_energy = current_energy

        history.append({
            "step": step + 1,
            "energy": current_energy
        })

    return {
        "name": "Hill Climbing",
        "best_panels": best,
        "best_energy": best_energy,
        "history": history,
        "time": round(time.time() - start_time, 4)
    }


def simulated_annealing(grid):
    start_time = time.time()

    current = random_panels()
    current_energy = calculate_energy(grid, current)

    best = current
    best_energy = current_energy

    temperature = 100
    cooling_rate = 0.95
    min_temperature = 0.01

    history = []

    for step in range(ITERATIONS):
        neighbor = mutate_solution(current)
        neighbor_energy = calculate_energy(grid, neighbor)

        delta = neighbor_energy - current_energy

        if delta > 0:
            current = neighbor
            current_energy = neighbor_energy
        else:
            probability = math.exp(delta / temperature)
            if random.random() < probability:
                current = neighbor
                current_energy = neighbor_energy

        if current_energy > best_energy:
            best = current
            best_energy = current_energy

        history.append({
            "step": step + 1,
            "energy": current_energy,
            "temperature": round(temperature, 4)
        })

        temperature = max(temperature * cooling_rate, min_temperature)

    return {
        "name": "Simulated Annealing",
        "best_panels": best,
        "best_energy": best_energy,
        "history": history,
        "time": round(time.time() - start_time, 4)
    }


def genetic_algorithm(grid):
    start_time = time.time()

    population_size = 20
    mutation_rate = 0.2
    generations = ITERATIONS

    population = [random_panels() for _ in range(population_size)]
    history = []

    def fitness(solution):
        return calculate_energy(grid, solution)

    def crossover(parent1, parent2):
        child = parent1[:PANEL_COUNT // 2] + parent2[PANEL_COUNT // 2:]
        child = list(dict.fromkeys(child))

        while len(child) < PANEL_COUNT:
            pos = random.choice(all_positions())
            if pos not in child:
                child.append(pos)

        return child

    for generation in range(generations):
        population.sort(key=fitness, reverse=True)

        best = population[0]
        best_energy = fitness(best)

        history.append({
            "step": generation + 1,
            "energy": best_energy
        })

        new_population = population[:2]

        while len(new_population) < population_size:
            parent1 = random.choice(population[:10])
            parent2 = random.choice(population[:10])
            child = crossover(parent1, parent2)

            if random.random() < mutation_rate:
                child = mutate_solution(child)

            new_population.append(child)

        population = new_population

    population.sort(key=fitness, reverse=True)
    best = population[0]
    best_energy = fitness(best)

    return {
        "name": "Genetic Algorithm",
        "best_panels": best,
        "best_energy": best_energy,
        "history": history,
        "time": round(time.time() - start_time, 4)
    }


@app.route("/")
def home():
    return jsonify({
        "message": "Solar Panel Optimizer API Running"
    })


@app.route("/optimize")
def optimize():
    grid = generate_grid()

    hc = hill_climbing(grid)
    sa = simulated_annealing(grid)
    ga = genetic_algorithm(grid)

    algorithms = [hc, sa, ga]
    best_result = max(algorithms, key=lambda x: x["best_energy"])

    return jsonify({
        "grid": grid,
        "best_algorithm": best_result["name"],
        "best_panels": best_result["best_panels"],
        "best_energy": best_result["best_energy"],
        "results": algorithms
    })


@app.route("/hill-climbing")
def run_hill_climbing():
    grid = generate_grid()
    result = hill_climbing(grid)

    return jsonify({
        "grid": grid,
        "best_panels": result["best_panels"],
        "best_energy": result["best_energy"],
        "history": result["history"]
    })


if __name__ == "__main__":
    app.run(debug=True)