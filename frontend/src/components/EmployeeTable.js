import React from 'react';
import './EmployeeTable.css';

const EmployeeTable = ({ employees, setSelectedEmployee, onDelete }) => {
  return (
    <div className="employee-container">
      {employees.map((employee) => (
        <div key={employee._id} className="employee-card">
          <h3>{employee.name}</h3>
          <p><strong>Email:</strong> {employee.email}</p>
          <p><strong>Phone:</strong> {employee.phone}</p>
          <p><strong>Job Title:</strong> {employee.jobTitle}</p>
          <p><strong>Department:</strong> {employee.department}</p>
          <p><strong>Salary:</strong> {employee.salary}</p>
          <div className="actions">
            <button onClick={() => setSelectedEmployee(employee)}>Edit</button> 
            
            <button onClick={() => onDelete(employee._id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmployeeTable;
