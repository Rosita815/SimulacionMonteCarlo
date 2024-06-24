import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import Loader from './Loader';
import './dashborad';
import { AreaChart } from '@tremor/react';

function App() {
  const [demand, setDemand] = useState('');
  const [frequency, setFrequency] = useState('');
  const [demandData, setDemandData] = useState([]);
  const [cumulativeData, setCumulativeData] = useState([]);
  const [totalDays, setTotalDays] = useState(10);
  const [totalDemand, setTotalDemand] = useState(0);
  const [averageDemand, setAverageDemand] = useState(0);
  const [roundedAverageDemand, setRoundedAverageDemand] = useState(0); // Nuevo estado para el promedio redondeado
  const [plotImage, setPlotImage] = useState('');
  const [simulatedDemand, setSimulatedDemand] = useState([]);
  const [showPlotButton, setShowPlotButton] = useState(false);
  const [showSimulateButton, setShowSimulateButton] = useState(false);
  const [showSimulationResults, setShowSimulationResults] = useState(false);
  const [loading, setLoading] = useState(false); // Nuevo estado para el loader
  const plotSectionRef = useRef(null); // Referencia a la sección del gráfico

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
      setShowPlotButton(true); // Mostrar botón de graficar después de añadir datos
      fetchCumulativeProbability(); // Actualizar datos de probabilidad acumulada
    } catch (error) {
      console.error('Error al añadir los datos:', error);
      alert('Hubo un error al añadir los datos. Por favor, intenta de nuevo.');
    }
  };

  const handleDelete = async (index) => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/delete_row/', { index });
      setDemandData(response.data.demand_data);
      if (response.data.demand_data.length === 0) {
        setCumulativeData([]);
        setPlotImage('');
        setSimulatedDemand([]);
        setShowPlotButton(false);
        setShowSimulateButton(false);
        setShowSimulationResults(false);
      } else {
        fetchCumulativeProbability(); // Actualizar datos de probabilidad acumulada
      }
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
      if (demandData.length > 0) {
        alert('Hubo un error al obtener la probabilidad acumulada. Por favor, intenta de nuevo.');
      }
    }
  };

  const generatePlot = async () => {
    setLoading(true); // Mostrar la animación del loader
    setPlotImage(''); // Limpiar la imagen del gráfico anterior
    setShowSimulateButton(false)
    setShowSimulationResults(false)
    setTotalDays(10);
    if (plotSectionRef.current) {
      plotSectionRef.current.scrollIntoView({ behavior: 'smooth' }); // Mover el scroll hacia abajo
    }
    setTimeout(async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/generate_plot/');
        setPlotImage(response.data.image);
        setShowSimulateButton(true); // Mostrar botón de simular demanda después de graficar
        setLoading(false); // Ocultar la animación del loader
      } catch (error) {
        console.error('Error al generar el gráfico:', error);
        alert('Hubo un error al generar el gráfico. Por favor, intenta de nuevo.');
        setLoading(false); // Ocultar la animación del loader en caso de error
      }
    }, 6000); // 6 segundos de delay
  };

  const simulateDemand = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/simulate_demand/?days=${totalDays}`);
      setSimulatedDemand(response.data.simulated_demand);
      setTotalDemand(response.data.total_demand);
      setAverageDemand(response.data.average_demand);
      setRoundedAverageDemand(response.data.rounded_average_demand); // Establecer el promedio redondeado
      setShowSimulationResults(true); // Mostrar resultados de la simulación después de simular la demanda
    } catch (error) {
      console.error('Error al simular la demanda:', error);
      alert('Hubo un error al simular la demanda. Por favor, intenta de nuevo.');
    }
  };

  const handleReset = async () => {
    try {
      await axios.post('http://127.0.0.1:8000/api/reset_simulation/');
      setDemandData([]);
      setCumulativeData([]);
      setPlotImage('');
      setSimulatedDemand([]);
      setShowPlotButton(false);
      setShowSimulateButton(false);
      setShowSimulationResults(false);
      setTotalDays(10); // Reset total days to default
    } catch (error) {
      console.error('Error al resetear la simulación:', error);
      alert('Hubo un error al resetear la simulación. Por favor, intenta de nuevo.');
    }
  };

  useEffect(() => {
    if (demandData.length > 0) {
      fetchCumulativeProbability();
    }
  }, [demandData]);

  const totalFrequency = demandData.reduce((acc, item) => acc + item.frequency, 0);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Simulación Monte Carlo</h1>
        <button className="custom-button" onClick={handleReset}>Nueva Simulación</button>
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
        {showPlotButton && (
          <button className="custom-button" onClick={generatePlot}>Graficar</button>
        )}
        <div className="loader-container" ref={plotSectionRef}> {/* Referencia a la sección del gráfico */}
          {loading && <Loader />} {/* Mostrar el loader mientras se genera el gráfico */}
          {plotImage && !loading && (
            <div>
              <h2>Gráfico de Probabilidad Acumulada</h2>
              <img src={`data:image/png;base64,${plotImage}`} alt="Gráfico de Probabilidad Acumulada" />
            </div>
          )}
        </div>
        <hr />
        {showSimulateButton && (
          <>
            <label>
              Cantidad de Días a Simular:
              <input
                type="number"
                value={totalDays}
                onChange={(e) => setTotalDays(e.target.value)}
                required
              />
            </label>
            <button className="custom-button" onClick={simulateDemand}>Simular Demanda</button>
          </>
        )}
        {showSimulationResults && (
          <>
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
            <h3>Demanda Total: {totalDemand}</h3>
            <h3>Demanda Diaria Promedio: {averageDemand.toFixed(2)}</h3>
            <h3>Demanda Diaria Promedio Redondeada: {roundedAverageDemand}</h3> {/* Mostrar el promedio redondeado */}
          </>
          
        )}
      </div>
    </div>
  );
}


export default App;
