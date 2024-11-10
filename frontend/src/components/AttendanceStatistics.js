import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AttendanceStatistics() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [selectedView, setSelectedView] = useState('daily'); // 'daily' or 'monthly'

  useEffect(() => {
    fetchAttendanceStats();
    fetchMonthlyTrend();
  }, [selectedDate]);

  const fetchAttendanceStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/attendance/stats', {
        params: { date: selectedDate }
      });
      setAttendanceStats(response.data);
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
    }
  };

  const fetchMonthlyTrend = async () => {
    try {
      const endDate = new Date(selectedDate);
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 30);

      const response = await axios.get('http://localhost:5000/api/attendance/monthly-trend', {
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      });
      setMonthlyTrend(response.data);
    } catch (error) {
      console.error('Error fetching monthly trend:', error);
    }
  };

  const getPieChartData = () => {
    if (!attendanceStats) return [];
    return [
      { name: 'Present', value: attendanceStats.presentCount || 0 },
      { name: 'Absent', value: attendanceStats.absentCount || 0 },
      { name: 'Late', value: attendanceStats.lateCount || 0 },
      { name: 'Half Day', value: attendanceStats.halfDayCount || 0 }
    ];
  };

  const getBarChartData = () => {
    if (!attendanceStats) return [];
    return [
      { name: 'Morning Shift', value: attendanceStats.morningShiftCount || 0 },
      { name: 'Night Shift', value: attendanceStats.nightShiftCount || 0 }
    ];
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="font-semibold">{`${label}`}</p>
          <p>{`Count: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 bg-gray-50">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Attendance Statistics</h2>
        <div className="space-x-4">
          <select
            value={selectedView}
            onChange={(e) => setSelectedView(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="daily">Daily View</option>
            <option value="monthly">Monthly Trend</option>
          </select>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
      </div>

      {selectedView === 'daily' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Attendance Distribution</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={getPieChartData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getPieChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Shift Distribution</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={getBarChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Monthly Attendance Trend</h3>
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="attendanceRate" stroke="#8884d8" name="Attendance Rate" />
                <Line type="monotone" dataKey="avgWorkingHours" stroke="#82ca9d" name="Avg Working Hours" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {attendanceStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-semibold text-gray-500">Total Employees</h4>
            <p className="text-2xl font-bold">{attendanceStats.totalEmployees || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-semibold text-gray-500">Present Today</h4>
            <p className="text-2xl font-bold text-green-600">{attendanceStats.presentCount || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-semibold text-gray-500">Average Working Hours</h4>
            <p className="text-2xl font-bold">{attendanceStats.avgWorkingHours?.toFixed(1) || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-semibold text-gray-500">Overtime Hours</h4>
            <p className="text-2xl font-bold text-blue-600">{attendanceStats.totalOvertimeHours?.toFixed(1) || 0}</p>
          </div>
        </div>
      )}
    </div>
  );
}