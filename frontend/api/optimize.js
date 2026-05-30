const GRID_SIZE = 10;
const PANEL_COUNT = 5;
const ITERATIONS = 100;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateGrid() {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => randomInt(1, 99))
  );
}

function allPositions() {
  const positions = [];

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      positions.push([r, c]);
    }
  }

  return positions;
}

function calculateEnergy(grid, panels) {
  return panels.reduce((total, [r, c]) => total + grid[r][c], 0);
}

function randomPanels() {
  const positions = allPositions();
  const selected = [];

  while (selected.length < PANEL_COUNT) {
    const pos = positions[randomInt(0, positions.length - 1)];
    const exists = selected.some(([r, c]) => r === pos[0] && c === pos[1]);

    if (!exists) {
      selected.push(pos);
    }
  }

  return selected;
}

function mutateSolution(solution) {
  const neighbor = solution.map((pos) => [...pos]);
  const index = randomInt(0, PANEL_COUNT - 1);

  let newPos;
  let exists;

  do {
    newPos = [randomInt(0, GRID_SIZE - 1), randomInt(0, GRID_SIZE - 1)];
    exists = neighbor.some(([r, c]) => r === newPos[0] && c === newPos[1]);
  } while (exists);

  neighbor[index] = newPos;
  return neighbor;
}

function hillClimbing(grid) {
  const start = Date.now();

  let current = randomPanels();
  let currentEnergy = calculateEnergy(grid, current);

  let best = current;
  let bestEnergy = currentEnergy;

  const history = [];

  for (let step = 1; step <= ITERATIONS; step++) {
    const neighbor = mutateSolution(current);
    const neighborEnergy = calculateEnergy(grid, neighbor);

    if (neighborEnergy > currentEnergy) {
      current = neighbor;
      currentEnergy = neighborEnergy;
    }

    if (currentEnergy > bestEnergy) {
      best = current;
      bestEnergy = currentEnergy;
    }

    history.push({
      step,
      energy: currentEnergy,
    });
  }

  return {
    name: "Hill Climbing",
    best_panels: best,
    best_energy: bestEnergy,
    history,
    time: ((Date.now() - start) / 1000).toFixed(4),
  };
}

function simulatedAnnealing(grid) {
  const start = Date.now();

  let current = randomPanels();
  let currentEnergy = calculateEnergy(grid, current);

  let best = current;
  let bestEnergy = currentEnergy;

  let temperature = 100;
  const coolingRate = 0.95;

  const history = [];

  for (let step = 1; step <= ITERATIONS; step++) {
    const neighbor = mutateSolution(current);
    const neighborEnergy = calculateEnergy(grid, neighbor);

    const delta = neighborEnergy - currentEnergy;

    if (delta > 0 || Math.random() < Math.exp(delta / temperature)) {
      current = neighbor;
      currentEnergy = neighborEnergy;
    }

    if (currentEnergy > bestEnergy) {
      best = current;
      bestEnergy = currentEnergy;
    }

    history.push({
      step,
      energy: currentEnergy,
    });

    temperature *= coolingRate;
  }

  return {
    name: "Simulated Annealing",
    best_panels: best,
    best_energy: bestEnergy,
    history,
    time: ((Date.now() - start) / 1000).toFixed(4),
  };
}

function geneticAlgorithm(grid) {
  const start = Date.now();

  const populationSize = 20;
  const mutationRate = 0.2;

  let population = Array.from({ length: populationSize }, () => randomPanels());

  const history = [];

  function fitness(solution) {
    return calculateEnergy(grid, solution);
  }

  function crossover(parent1, parent2) {
    let child = [
      ...parent1.slice(0, Math.floor(PANEL_COUNT / 2)),
      ...parent2.slice(Math.floor(PANEL_COUNT / 2)),
    ];

    child = child.filter(
      (pos, index, self) =>
        index === self.findIndex(([r, c]) => r === pos[0] && c === pos[1])
    );

    while (child.length < PANEL_COUNT) {
      const pos = [randomInt(0, GRID_SIZE - 1), randomInt(0, GRID_SIZE - 1)];
      const exists = child.some(([r, c]) => r === pos[0] && c === pos[1]);

      if (!exists) {
        child.push(pos);
      }
    }

    return child;
  }

  for (let generation = 1; generation <= ITERATIONS; generation++) {
    population.sort((a, b) => fitness(b) - fitness(a));

    const best = population[0];
    const bestEnergy = fitness(best);

    history.push({
      step: generation,
      energy: bestEnergy,
    });

    const newPopulation = population.slice(0, 2);

    while (newPopulation.length < populationSize) {
      const parent1 = population[randomInt(0, 9)];
      const parent2 = population[randomInt(0, 9)];

      let child = crossover(parent1, parent2);

      if (Math.random() < mutationRate) {
        child = mutateSolution(child);
      }

      newPopulation.push(child);
    }

    population = newPopulation;
  }

  population.sort((a, b) => fitness(b) - fitness(a));

  const best = population[0];
  const bestEnergy = fitness(best);

  return {
    name: "Genetic Algorithm",
    best_panels: best,
    best_energy: bestEnergy,
    history,
    time: ((Date.now() - start) / 1000).toFixed(4),
  };
}

export default function handler(req, res) {
  const grid = generateGrid();

  const hc = hillClimbing(grid);
  const sa = simulatedAnnealing(grid);
  const ga = geneticAlgorithm(grid);

  const results = [hc, sa, ga];
  const bestResult = results.reduce((best, item) =>
    item.best_energy > best.best_energy ? item : best
  );

  res.status(200).json({
    grid,
    best_algorithm: bestResult.name,
    best_panels: bestResult.best_panels,
    best_energy: bestResult.best_energy,
    results,
  });
}