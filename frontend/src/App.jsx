import { useEffect, useState } from "react";
import "./App.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [grid, setGrid] = useState([]);
  const [bestPanels, setBestPanels] = useState([]);
  const [bestEnergy, setBestEnergy] = useState(0);
  const [bestAlgorithm, setBestAlgorithm] = useState("");
  const [results, setResults] = useState([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("Hill Climbing");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runOptimization = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://127.0.0.1:5000/optimize");

      if (!response.ok) {
        throw new Error("Backend tidak merespons");
      }

      const data = await response.json();

      setGrid(data.grid);
      setBestPanels(data.best_panels);
      setBestEnergy(data.best_energy);
      setBestAlgorithm(data.best_algorithm);
      setResults(data.results);
      setSelectedAlgorithm(data.best_algorithm);
    } catch (err) {
      setError("Backend Flask belum berjalan. Jalankan python app.py dulu.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runOptimization();
  }, []);

  const sortedResults = [...results].sort(
    (a, b) => b.best_energy - a.best_energy
  );

  const winner = sortedResults[0];

  const activeResult =
    results.find((item) => item.name === selectedAlgorithm) || results[0];

  const isPanel = (row, col) => {
    return bestPanels.some((panel) => panel[0] === row && panel[1] === col);
  };

  const convergenceChart = {
    labels: activeResult?.history.map((item) => item.step) || [],
    datasets: [
      {
        label: activeResult?.name || "Energi",
        data: activeResult?.history.map((item) => item.energy) || [],
        borderColor: "#38bdf8",
        backgroundColor: "#38bdf8",
        tension: 0.35,
        borderWidth: 3,
        pointRadius: 1.8,
      },
    ],
  };

  const comparisonChart = {
    labels: results.map((item) => item.name),
    datasets: [
      {
        label: "Energi Terbaik",
        data: results.map((item) => item.best_energy),
        backgroundColor: ["#38bdf8", "#22c55e", "#f97316"],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "white",
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "white" },
        grid: { color: "#334155" },
      },
      y: {
        ticks: { color: "white" },
        grid: { color: "#334155" },
      },
    },
  };

  return (
    <div className="container">
      <div className="hero">
        <div className="badge">AI Local Search & Optimization</div>

        <h1>Solar Panel Optimization Simulator</h1>

        <p>
          Simulasi optimasi penempatan panel surya menggunakan Hill Climbing,
          Simulated Annealing, dan Genetic Algorithm berbasis web.
        </p>

        <button onClick={runOptimization} disabled={loading}>
          {loading ? "Mengoptimasi..." : "Jalankan Semua Algoritma"}
        </button>

        {error && <div className="error-box">{error}</div>}
      </div>

      <div className="winner-banner">
        <h2>🏆 Pemenang Simulasi</h2>
        <h3>{winner ? winner.name : "-"}</h3>
        <p>
          Algoritma ini menghasilkan energi tertinggi sebesar{" "}
          <strong>{winner ? winner.best_energy : 0}</strong>.
        </p>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <span>Algoritma Terbaik</span>
          <strong>{bestAlgorithm || "-"}</strong>
        </div>

        <div className="summary-card">
          <span>Total Energi Terbaik</span>
          <strong>{bestEnergy}</strong>
        </div>

        <div className="summary-card">
          <span>Jumlah Panel</span>
          <strong>5</strong>
        </div>

        <div className="summary-card">
          <span>Ukuran Atap</span>
          <strong>10 x 10</strong>
        </div>
      </div>

      <div className="main-layout">
        <div className="grid-card">
          <h2>Visualisasi Penempatan Panel Surya</h2>

          <div className="grid">
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={isPanel(rowIndex, colIndex) ? "cell panel" : "cell"}
                >
                  <div className="icon">
                    {isPanel(rowIndex, colIndex) ? "🔋" : "☀️"}
                  </div>
                  <span>{cell}</span>
                </div>
              ))
            )}
          </div>

          <div className="legend">
            <div>
              <span className="sun-box"></span>
              Area Atap / Intensitas Matahari
            </div>

            <div>
              <span className="panel-box"></span>
              Panel Surya Terpilih
            </div>
          </div>
        </div>

        <div className="side-card">
          <h2>Posisi Panel Terbaik</h2>

          <div className="panel-list">
            {bestPanels.map((panel, index) => (
              <div className="panel-item" key={index}>
                <span>Panel {index + 1}</span>
                <strong>
                  Baris {panel[0] + 1}, Kolom {panel[1] + 1}
                </strong>
              </div>
            ))}
          </div>

          <h2>Ranking Algoritma</h2>

          <div className="ranking-list">
            {sortedResults.map((item, index) => (
              <div
                className={index === 0 ? "ranking-item rank-one" : "ranking-item"}
                key={item.name}
              >
                <span>
                  {index + 1}. {item.name}
                </span>
                <strong>{item.best_energy}</strong>
              </div>
            ))}
          </div>

          <h2>Perbandingan Algoritma</h2>

          <table>
            <thead>
              <tr>
                <th>Algoritma</th>
                <th>Energi</th>
                <th>Waktu</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item) => (
                <tr
                  key={item.name}
                  className={item.name === bestAlgorithm ? "winner-row" : ""}
                >
                  <td>{item.name}</td>
                  <td>{item.best_energy}</td>
                  <td>{item.time}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="charts-layout">
        <div className="chart-box">
          <div className="chart-header">
            <h2>Grafik Konvergensi</h2>

            <select
              value={selectedAlgorithm}
              onChange={(e) => setSelectedAlgorithm(e.target.value)}
            >
              {results.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {activeResult && (
            <Line data={convergenceChart} options={chartOptions} />
          )}
        </div>

        <div className="chart-box">
          <h2>Grafik Perbandingan Energi</h2>

          {results.length > 0 && (
            <Bar data={comparisonChart} options={chartOptions} />
          )}
        </div>
      </div>

      <div className="analysis-box">
        <h2>Kesimpulan Otomatis</h2>

        {winner ? (
          <p>
            Berdasarkan hasil simulasi, algoritma{" "}
            <strong>{winner.name}</strong> menjadi algoritma terbaik karena
            menghasilkan total energi tertinggi sebesar{" "}
            <strong>{winner.best_energy}</strong>. Hal ini menunjukkan bahwa
            algoritma tersebut paling efektif dalam mencari kombinasi posisi
            panel surya terbaik pada grid atap 10x10 dibandingkan algoritma
            lainnya pada percobaan ini.
          </p>
        ) : (
          <p>Belum ada data simulasi.</p>
        )}

        <ul>
          {sortedResults.map((item) => (
            <li key={item.name}>
              {item.name} menghasilkan energi {item.best_energy} dalam waktu{" "}
              {item.time} detik.
            </li>
          ))}
        </ul>
      </div>

      <div className="explanation">
        <h2>Penjelasan Singkat</h2>

        <p>
          Aplikasi ini mensimulasikan atap rumah dalam bentuk grid 10x10.
          Setiap kotak memiliki nilai intensitas matahari. Algoritma optimasi
          bertugas mencari lima posisi panel surya terbaik agar total energi
          yang diperoleh menjadi maksimum.
        </p>

        <p>
          Hill Climbing memilih solusi yang lebih baik secara bertahap,
          Simulated Annealing dapat menerima solusi yang lebih buruk dengan
          probabilitas tertentu agar tidak mudah terjebak pada local optimum,
          sedangkan Genetic Algorithm menggunakan mekanisme populasi, seleksi,
          crossover, dan mutasi.
        </p>
      </div>
    </div>
  );
}

export default App;