import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EmployeeAttendance.css';

export default function EmployeeAttendance({ employeeId }) {
  const [attendance, setAttendance] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().split('T')[0].substring(0, 7));
  const [salaryData, setSalaryData] = useState(null);

  const fetchAttendance = async () => {
    try {
      const [year, month] = selectedMonth.split('-');
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      const response = await axios.get(`http://localhost:5000/api/attendance/${employeeId}`, {
        params: { startDate, endDate }
      });
      setAttendance(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchSalary = async () => {
    try {
      const [year, month] = selectedMonth.split('-');
      const response = await axios.get(`http://localhost:5000/api/salary/${employeeId}`, {
        params: { month, year }
      });
      setSalaryData(response.data);
    } catch (error) {
      console.error('Error fetching salary:', error);
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetchSalary();
  }, [selectedMonth, employeeId]);

  return (
    <div className="employee-attendance">
      <h2>My Attendance</h2>
      <div className="month-picker">
        <label htmlFor="month-select">Select Month: </label>
        <input
          type="month"
          id="month-select"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          max={new Date().toISOString().split('T')[0].substring(0, 7)}
        />
      </div>

      {salaryData && (
        <div className="monthly-summary">
          <h3>Monthly Summary</h3>
          <div className="summary-grid">
            <div>Position: {salaryData.position}</div>
            <div>Working Days: {salaryData.workingDays}</div>
            <div>Present Days: {salaryData.presentDays}</div>
            <div>Half Days: {salaryData.halfDays}</div>
            <div>Absent Days: {salaryData.absentDays}</div>
            <div>Total Working Hours: {salaryData.totalWorkingHours?.toFixed(2)}</div>
            <div>Overtime Hours: {salaryData.overtimeHours?.toFixed(2)}</div>
            <div>Base Salary: ₹{salaryData.baseSalary?.toFixed(2)}</div>
            <div>Overtime Pay: ₹{salaryData.overtimePay?.toFixed(2)}</div>
            <div>PF Amount: ₹{salaryData.pfAmount?.toFixed(2)}</div>
            <div className="monthly-salary">Final Monthly Salary: ₹{salaryData.finalSalary?.toFixed(2)}</div>
          </div>
        </div>
      )}

      <table className="attendance-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Status</th>
            <th>Shift</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Working Hours</th>
          </tr>
        </thead>
        <tbody>
          {attendance.map((record) => (
            <tr key={record._id}>
              <td>{new Date(record.date).toLocaleDateString()}</td>
              <td>{record.status}</td>
              <td>{record.shift}</td>
              <td>{record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-'}</td>
              <td>{record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}</td>
              <td>{record.workingHours?.toFixed(2) || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}