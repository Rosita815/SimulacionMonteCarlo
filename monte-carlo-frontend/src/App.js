import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [demand, setDemand] = useState('');
  const [frequency, setFrequency] = useState('');
  const [demandData, setDemandData] = useState([]);
  const [cumulativeData, setCumulativeData] = useState([]);
  const [plotImage, setPlotImage] = useState('');
  const [simulatedDemand, setSimulatedDemand] = useState([]);

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
      alert('Hubo un error al añadir los datos. Por favor, intenta de nuevo.');
    }
  };

  const handleDelete = async (index) => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/delete_row/', { index });
      setDemandData(response.data.demand_data);
    } catch (error) {
      console.error('Error al eliminar la fila:', error);
      alert('Hubo un error al eliminar la fila. Por favor, intenta de nuevo.');
    }
  };

  const fetchCumulativeProbability = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/calculate_cumulative_probability/');
      setCumulativeData(response.data.demand_data);
    } catch (error) {
      console.error('Error al obtener la probabilidad acumulada:', error);
      alert('Hubo un error al obtener la probabilidad acumulada. Por favor, intenta de nuevo.');
    }
  };

  const generatePlot = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/generate_plot/');
      setPlotImage(response.data.image);
    } catch (error) {
      console.error('Error al generar el gráfico:', error);
      alert('Hubo un error al generar el gráfico. Por favor, intenta de nuevo.');
    }
  };

  const simulateDemand = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/simulate_demand/');
      setSimulatedDemand(response.data.simulated_demand);
    } catch (error) {
      console.error('Error al simular la demanda:', error);
      alert('Hubo un error al simular la demanda. Por favor, intenta de nuevo.');
    }
  };

  useEffect(() => {
    fetchCumulativeProbability();
  }, [demandData]);

  const totalFrequency = demandData.reduce((acc, item) => acc + item.frequency, 0);

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
                <td>
                  {`${row.frequency}/${totalFrequency} = ${row.probability.toFixed(2)}`}
                </td>
                <td>
                  <button onClick={() => handleDelete(index)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr />
        <h2>Distribución de Probabilidad Acumulada</h2>
        <table>
          <thead>
            <tr>
              <th>Demanda Diaria</th>
              <th>Probabilidad</th>
              <th>Probabilidad Acumulada</th>
            </tr>
          </thead>
          <tbody>
            {cumulativeData.map((row, index) => (
              <tr key={index}>
                <td>{row.demand}</td>
                <td>{row.probability !== undefined ? row.probability.toFixed(2) : 'N/A'}</td>
                <td>{row.cumulative_probability !== undefined ? row.cumulative_probability.toFixed(2) : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr />
        <h2>Intervalos de Números Aleatorios</h2>
        <table>
          <thead>
            <tr>
              <th>Demanda Diaria</th>
              <th>Probabilidad</th>
              <th>Probabilidad Acumulada</th>
              <th>Intervalo de Números Aleatorios</th>
            </tr>
          </thead>
          <tbody>
            {cumulativeData.map((row, index) => {
              const lowerBound = index === 0 ? 1 : cumulativeData[index - 1].cumulative_probability * 100 + 1;
              const upperBound = row.cumulative_probability * 100;
              return (
                <tr key={index}>
                  <td>{row.demand}</td>
                  <td>{row.probability !== undefined ? row.probability.toFixed(2) : 'N/A'}</td>
                  <td>{row.cumulative_probability !== undefined ? row.cumulative_probability.toFixed(2) : 'N/A'}</td>
                  <td>{`${lowerBound.toFixed(0).padStart(2, '0')} a ${upperBound.toFixed(0).padStart(2, '0')}`}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <hr />
        <button onClick={generatePlot}>Graficar</button>
        {plotImage && (
          <div>
            <h2>Gráfico de Probabilidad Acumulada</h2>
            <img src={`data:image/png;base64,${plotImage}`} alt="Gráfico de Probabilidad Acumulada" />
          </div>
        )}
        <button onClick={simulateDemand}>Simular Demanda</button>
        <h2>Simulación de Demanda Diaria</h2>
        <table>
          <thead>
            <tr>
              <th>Día</th>
              <th>Número Aleatorio</th>
              <th>Demanda Diaria Simulada</th>
            </tr>
          </thead>
          <tbody>
            {simulatedDemand.map((row, index) => (
              <tr key={index}>
                <td>{row.day}</td>
                <td>{row.random_number}</td>
                <td>{row.demand}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
