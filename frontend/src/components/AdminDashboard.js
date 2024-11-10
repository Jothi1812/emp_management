import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';
import AbsenteesList from './AbsenteesList';
import AdminAttendance from './AdminAttendance';


export default function AdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    department: '',
    email: '',
    phone: '',
    salary: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [activeSection, setActiveSection] = useState('createEmployee');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empResponse, leavesResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/employees'),
          axios.get('http://localhost:5000/api/leaves')
        ]);
        setEmployees(empResponse.data);
        setLeaves(leavesResponse.data);
      } catch (error) {
        alert('Error fetching data');
      }
    };
    fetchData();
  }, []);

  const handleLeaveAction = async (leaveId, status, responseMessage) => {
    try {
      await axios.put(`http://localhost:5000/api/leaves/${leaveId}`, { status, responseMessage });
      setLeaves(leaves.map(leave =>
        leave._id === leaveId
          ? { ...leave, status, responseMessage }
          : leave
      ));
    } catch (error) {
      alert('Error updating leave status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(`http://localhost:5000/api/employees/${formData.id}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/employees', formData);
      }
      fetchEmployees();
      setFormData({
        id: '',
        name: '',
        department: '',
        email: '',
        phone: '',
        salary: ''
      });
      setEditMode(false);
    } catch (error) {
      alert('Error saving employee');
    }
  };

  const fetchEmployees = async () => {
    const response = await axios.get('http://localhost:5000/api/employees');
    setEmployees(response.data);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/employees/${id}`);
      fetchEmployees();
    } catch (error) {
      alert('Error deleting employee');
    }
  };

  const handleEdit = (employee) => {
    setFormData(employee);
    setEditMode(true);
  };

  return (
    <div className="flex">
      {/* Left Sidebar */}
      <div className="w-1/4 bg-gray-800 text-white h-screen p-6">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-300">Admin Dashboard</h2>
        <div className="space-y-4">
          <button
            onClick={() => setActiveSection('createEmployee')}
            className="w-full text-left py-3 px-4 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none transition duration-200"
          >
            <i className="fas fa-plus-circle mr-3"></i>Add Employee
          </button>
          <button
            onClick={() => setActiveSection('employeeList')}
            className="w-full text-left py-3 px-4 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none transition duration-200"
          >
            <i className="fas fa-users mr-3"></i>Employee List
          </button>
          <button
            onClick={() => setActiveSection('leaveRequests')}
            className="w-full text-left py-3 px-4 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none transition duration-200"
          >
            <i className="fas fa-calendar-check mr-3"></i>Leave Requests
          </button>
          <button
            onClick={() => setActiveSection('attendance')}
            className="w-full text-left py-3 px-4 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none transition duration-200"
          >
            <i className="fas fa-calendar-check mr-3"></i>Attendance Management
          </button>
             
        </div>
      </div>

      {/* Content Area */}
      <div className="w-3/4 p-8">
        {/* Add/Edit Employee Form */}
        {activeSection === 'createEmployee' && (
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 text-gray-800">{editMode ? 'Edit Employee' : 'Add Employee'}</h3>
            <form onSubmit={handleSubmit} className="max-w-md bg-white p-6 rounded-lg shadow-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">ID</label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Salary</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-4 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-200"
              >
                {editMode ? 'Update Employee' : 'Add Employee'}
              </button>
            </form>
          </div>
        )}

        {/* Employee List */}
        {activeSection === 'employeeList' && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Employee List</h3>
            <table className="min-w-full table-auto">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-6 py-3 border-b text-left">ID</th>
                  <th className="px-6 py-3 border-b text-left">Name</th>
                  <th className="px-6 py-3 border-b text-left">Department</th>
                  <th className="px-6 py-3 border-b text-left">Email</th>
                  <th className="px-6 py-3 border-b text-left">Phone</th>
                  <th className="px-6 py-3 border-b text-left">Salary</th>
                  <th className="px-6 py-3 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee._id}>
                    <td className="px-6 py-3 border-b">{employee.id}</td>
                    <td className="px-6 py-3 border-b">{employee.name}</td>
                    <td className="px-6 py-3 border-b">{employee.department}</td>
                    <td className="px-6 py-3 border-b">{employee.email}</td>
                    <td className="px-6 py-3 border-b">{employee.phone}</td>
                    <td className="px-6 py-3 border-b">{employee.salary}</td>
                    <td className="px-6 py-3 border-b">
                      <button onClick={() => handleEdit(employee)} className="text-blue-500 hover:text-blue-700">Edit</button>
                      <button onClick={() => handleDelete(employee._id)} className="ml-4 text-red-500 hover:text-red-700">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Leave Requests */}
        {activeSection === 'leaveRequests' && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Leave Requests</h3>
            <table className="min-w-full table-auto">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-6 py-3 border-b text-left">ID</th>
                  <th className="px-6 py-3 border-b text-left">Reason</th>
                  <th className="px-6 py-3 border-b text-left">Status</th>
                  <th className="px-6 py-3 border-b text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave._id} className="border-b">
                    <td className="px-6 py-4">{leave.employeeId}</td>
                    <td className="px-6 py-4">{leave.reason}</td>
                    <td className="px-6 py-4">{leave.status}</td>
                    <td className="px-6 py-4">
                      {leave.status === 'pending' ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleLeaveAction(leave._id, 'Approved', 'Leave Approved')}
                            className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition duration-200"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleLeaveAction(leave._id, 'Rejected', 'Leave Rejected')}
                            className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition duration-200"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="text-gray-500">Actions Disabled</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Attendance Management */}
        {activeSection === 'attendance' && (
          <div>
            <AdminAttendance />
            <AbsenteesList />
          </div>
        )}
      </div>
    </div>
  );
}