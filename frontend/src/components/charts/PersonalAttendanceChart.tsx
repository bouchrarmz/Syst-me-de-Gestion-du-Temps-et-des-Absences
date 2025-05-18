
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PersonalAttendanceChart = () => {
  // Données fictives pour l'exemple - à remplacer par des données réelles de l'API
  const data = [
    {
      date: '01/04',
      heures: 8,
    },
    {
      date: '02/04',
      heures: 8.5,
    },
    {
      date: '03/04',
      heures: 7.5,
    },
    {
      date: '04/04',
      heures: 8,
    },
    {
      date: '05/04',
      heures: 8,
    },
    {
      date: '06/04',
      heures: 0, // Absence ou weekend
    },
    {
      date: '07/04',
      heures: 0, // Absence ou weekend
    },
  ];

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="heures" 
            stroke="#008000" 
            activeDot={{ r: 8 }} 
            name="Heures travaillées"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PersonalAttendanceChart;
