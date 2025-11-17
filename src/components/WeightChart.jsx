import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import './WeightChart.css'

function WeightChart({ weights }) {
  if (weights.length === 0) {
    return (
      <div className="chart-empty">
        <p>📊 Registre pelo menos um peso para ver o gráfico</p>
      </div>
    )
  }

  // Preparar dados para o gráfico
  const chartData = weights
    .sort((a, b) => new Date(a.data) - new Date(b.data))
    .map(w => ({
      data: new Date(w.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      peso: w.peso
    }))

  const minWeight = Math.min(...weights.map(w => w.peso)) - 2
  const maxWeight = Math.max(...weights.map(w => w.peso)) + 2

  return (
    <div className="weight-chart">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="data" 
            stroke="rgba(255,255,255,0.7)"
            style={{ fontSize: '0.85rem' }}
          />
          <YAxis 
            domain={[minWeight, maxWeight]}
            stroke="rgba(255,255,255,0.7)"
            style={{ fontSize: '0.85rem' }}
          />
          <Tooltip 
            contentStyle={{ 
              background: 'rgba(255,255,255,0.95)', 
              border: 'none',
              borderRadius: '10px',
              color: '#333'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="peso" 
            stroke="#fff" 
            strokeWidth={3}
            dot={{ fill: '#fff', r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default WeightChart