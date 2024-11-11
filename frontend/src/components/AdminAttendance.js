import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminAttendance.css';

export default function AdminAttendance() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [salaryData, setSalaryData] = useState({});

  useEffect(() => {
    fetchEmployees();
    fetchAttendance();
  }, [selectedDate]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('https://emp-management-hbon.onrender.com/api/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await axios.get('https://emp-management-hbon.onrender.com/api/attendance', {
        params: { date: selectedDate }
      });
      setAttendance(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const markAttendance = async (employeeId, status, shift, checkIn) => {
    try {
      const checkOut = new Date(checkIn);
      if (shift === 'night') {
        checkOut.setHours(23, 59, 59); // Set to 11:59:59 PM
      } else {
        checkOut.setHours(18, 0, 0); // Set to 6:00 PM for day shift
      }

      // Adjust working hours for half-day
      let workingHours = (checkOut - checkIn) / (1000 * 60 * 60);
      if (status === 'half-day') {
        workingHours = workingHours / 2;
      }

      await axios.post('https://emp-management-hbon.onrender.com/api/attendance', {
        employeeId,
        date: selectedDate,
        status,
        shift,
        checkIn,
        checkOut,
        workingHours
      });
      fetchAttendance();
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert(error.response?.data?.message || 'Error marking attendance');
    }
  };

  const calculateSalary = async (employeeId) => {
    try {
      const date = new Date(selectedDate);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const response = await axios.get(`https://emp-management-hbon.onrender.com/api/salary/${employeeId}`, {
        params: { month, year }
      });
      setSalaryData(prev => ({ ...prev, [employeeId]: response.data }));
    } catch (error) {
      console.error('Error calculating salary:', error);
    }
  };

  const handleAttendanceChange = (employeeId, field, value) => {
    setAttendance(prev => 
      prev.map(a => 
        a.employeeId === employeeId 
          ? { ...a, [field]: value } 
          : a
      )
    );
  };

  return (
    <div className="admin-attendance">
      <h2 className="text-2xl font-bold mb-4">Attendance Management</h2>
      <div className="date-picker mb-4">
        <label htmlFor="attendance-date" className="mr-2">Select Date: </label>
        <input
          type="date"
          id="attendance-date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="border rounded p-1"
        />
      </div>

      <table className="attendance-table w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Employee ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Shift</th>
            <th className="border p-2">Check In</th>
            <th className="border p-2">Check Out</th>
            <th className="border p-2">Working Hours</th>
            <th className="border p-2">Actions</th>
            <th className="border p-2">Salary Details</th>
          </tr>
        </thead>
        <tbody>
        {employees.map((employee) => {
            const employeeAttendance = attendance.find(a => a.employeeId === employee.id) || {};
            const isAbsent = employeeAttendance.status === 'absent';
            const isHalfDay = employeeAttendance.status === 'half-day';
            const employeeSalary = salaryData[employee.id];
            return (
              <tr key={employee.id} className="border-b">
                <td className="border p-2">{employee.id}</td>
                <td className="border p-2">{employee.name}</td>
                <td className="border p-2">
                <select
                    value={employeeAttendance.status || ''}
                    onChange={(e) => markAttendance(employee.id, e.target.value, employeeAttendance.shift || 'day', new Date())}
                    disabled={!!employeeAttendance.status}
                    className="w-full p-1 border rounded"
                  >
                    <option value="">Select</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="half-day">Half Day</option>
                </select>
                </td>
                <td className="border p-2">
                <select
                    value={employeeAttendance.shift || 'day'}
                    onChange={(e) => markAttendance(employee.id, employeeAttendance.status || 'present', e.target.value, new Date())}
                    disabled={isAbsent || !!employeeAttendance.shift}
                    className="w-full p-1 border rounded"
                  >
                    <option value="day">Day</option>
                    <option value="night">Night</option>
                  </select>
                </td>
                <td className="border p-2">
                  <input
                     type="time"
                     value={employeeAttendance.checkIn ? new Date(employeeAttendance.checkIn).toTimeString().slice(0,5) : ''}
                     onChange={(e) => {
                       const [hours, minutes] = e.target.value.split(':');
                       const checkIn = new Date(selectedDate);
                       checkIn.setHours(hours, minutes);
                       markAttendance(employee.id, employeeAttendance.status || 'present', employeeAttendance.shift || 'day', checkIn);
                     }}
                     disabled={isAbsent || !!employeeAttendance.checkIn}
                     className="w-full p-1 border rounded"
                  />
                </td>
                <td className="border p-2">
                  {employeeAttendance.checkOut ? new Date(employeeAttendance.checkOut).toLocaleTimeString() : '-'}
                </td>
                <td className="border p-2">
                  {isAbsent ? '-' : (employeeAttendance.workingHours?.toFixed(2) || '-')}
                </td>
                <td className="border p-2">
                  <button 
                    onClick={() => calculateSalary(employee.id)} 
                    className="calculate-salary-btn bg-blue-500 text-white px-2 py-1 rounded"
                    disabled={isAbsent}
                  >
                    Calculate Salary
                  </button>
                </td>
                <td className="border p-2">
                  {employeeSalary && (
                    <div className="salary-details text-sm">
                      <p>Working Days: {employeeSalary.workingDays}</p>
                      <p>Present: {employeeSalary.presentDays}</p>
                      <p>Half Days: {employeeSalary.halfDays}</p>
                      <p>Total Hours: {employeeSalary.totalWorkingHours?.toFixed(2)}</p>
                      <p>Overtime: {employeeSalary.overtimeHours?.toFixed(2)} hours</p>
                      <p>Overtime Pay: ₹{employeeSalary.overtimePay?.toFixed(2)}</p>
                      <p>PF Amount: ₹{employeeSalary.pfAmount?.toFixed(2)}</p>
                      <p>Final Salary: ₹{employeeSalary.finalSalary?.toFixed(2)}</p>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}