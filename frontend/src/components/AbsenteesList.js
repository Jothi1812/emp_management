import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AbsenteesList() {
  const [absentees, setAbsentees] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAbsentees();
  }, [selectedDate]);

  const fetchAbsentees = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/absentees', {
        params: { date: selectedDate }
      });
      setAbsentees(response.data);
    } catch (error) {
      console.error('Error fetching absentees:', error);
    }
  };

  return (
    <div className="absentees-list">
      <h2>Absentees List</h2>
      <div className="date-picker">
        <label htmlFor="absentees-date">Select Date: </label>
        <input
          type="date"
          id="absentees-date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
        />
      </div>
      <table className="absentees-table">
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Name</th>
            <th>Department</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {absentees.map((employee) => (
            <tr key={employee.id}>
              <td>{employee.id}</td>
              <td>{employee.name}</td>
              <td>{employee.department}</td>
              <td>{employee.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Notifications have been sent to all absentees.</p>
    </div>
  );
}