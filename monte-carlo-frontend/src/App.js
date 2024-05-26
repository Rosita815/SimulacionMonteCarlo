import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [demand, setDemand] = useState('');
  const [frequency, setFrequency] = useState('');
  const [demandData, setDemandData] = useState([]);
  const [normalDist, setNormalDist] = useState([]);
  const [poissonDist, setPoissonDist] = useState([]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/calculate_probability/', {
        demand: parseInt(demand),
        frequency: parseInt(frequency),
      });
      setDemandData(response.data.demand_data);
      setDemand('');
      setFrequency('');
    } catch (error) {
      console.error('Error al añadir los datos:', error);
    }
  };

  const handleDelete = async (index) => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/delete_row/', { index });
      setDemandData(response.data.demand_data);
    } catch (error) {
      console.error('Error al eliminar la fila:', error);
    }
  };

  const handleGenerateDistributions = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/generate_distributions/');
      setNormalDist(response.data.normal_distribution);
      setPoissonDist(response.data.poisson_distribution);
    } catch (error) {
      console.error('Error al generar las distribuciones:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Simulación de Demanda</h1>
      </header>

      <div>
        <h2>Datos de Demanda</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Demanda:
            <input
              type="number"
              value={demand}
              onChange={(e) => setDemand(e.target.value)}
              required
            />
          </label>
          <label>
            Frecuencia (Días):
            <input
              type="number"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              required
            />
          </label>
          <button type="submit">Añadir</button>
        </form>
        <table>
          <thead>
            <tr>
              <th>Demanda</th>
              <th>Frecuencia (Días)</th>
              <th>Probabilidad de Ocurrencia</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {demandData.map((row, index) => (
              <tr key={index}>
                <td>{row.demand}</td>
                <td>{row.frequency}</td>
                <td>{row.probability.toFixed(2)}</td>
                <td>
                  <button onClick={() => handleDelete(index)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr />
        <button onClick={handleGenerateDistributions}>Generar Distribuciones</button>
        <h2>Distribuciones</h2>
        <div>
          <h3>Distribución Normal</h3>
          <pre>{JSON.stringify(normalDist.slice(0, 10), null, 2)} ...</pre>
          <h3>Distribución de Poisson</h3>
          <pre>{JSON.stringify(poissonDist.slice(0, 10), null, 2)} ...</pre>
        </div>
      </div>
    </div>
  );
}

export default App;
