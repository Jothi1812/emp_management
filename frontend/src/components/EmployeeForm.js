import React, { useState, useEffect } from 'react';
import './EmployeeForm.css'
const EmployeeForm = ({ onSubmit, selectedEmployee, setSelectedEmployee, employees }) => {
  const [employee, setEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    jobTitle: '',
    department: '',
    joiningDate: '',
    salary: '',
    employeeId: '',
  });

  useEffect(() => {
    if (selectedEmployee) {
      setEmployee(selectedEmployee);
    }
  }, [selectedEmployee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee({ ...employee, [name]: value });
  };

  const generateEmployeeId = (department) => {
    // Find the employees in the same department and count them
    const departmentEmployees = employees.filter(emp => emp.department === department);
    const newEmployeeNumber = departmentEmployees.length + 1;
    return `${department}-${newEmployeeNumber}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Generate employeeId if it's not already provided (for new employee)
    if (!employee.employeeId) {
      employee.employeeId = generateEmployeeId(employee.department);
    }

    // Call the onSubmit function to pass the employee data
    onSubmit(employee);

    // Clear the form
    setEmployee({
      name: '',
      email: '',
      phone: '',
      address: '',
      jobTitle: '',
      department: '',
      joiningDate: '',
      salary: '',
      employeeId: '',
    });
    setSelectedEmployee(null);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={employee.name}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={employee.email}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="phone"
        placeholder="Phone"
        value={employee.phone}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="address"
        placeholder="Address"
        value={employee.address}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="jobTitle"
        placeholder="Job Title"
        value={employee.jobTitle}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="department"
        placeholder="Department"
        value={employee.department}
        onChange={handleChange}
        required
      />
      <input
        type="date"
        name="joiningDate"
        value={employee.joiningDate}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="salary"
        placeholder="Salary"
        value={employee.salary}
        onChange={handleChange}
        required
      />
      <button type="submit">{selectedEmployee ? 'Update' : 'Add'} Employee</button>
    </form>
  );
};

export default EmployeeForm;
