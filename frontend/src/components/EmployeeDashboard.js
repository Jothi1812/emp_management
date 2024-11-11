import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './EmployeeDashboard.css';
import profile from '../images/profile.jpg';
import { FaUser, FaCalendar, FaListAlt, FaClipboardList,FaSignOutAlt } from 'react-icons/fa';  // Add FaClipboardList for attendance section
import EmployeeAttendance from './EmployeeAttendance'; // Import EmployeeAttendance component

function EmployeeDashboard() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [leaveForm, setLeaveForm] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [resignationForm, setResignationForm] = useState({
    reason: '',
    lastWorkingDay: ''
  });
  const [activeSection, setActiveSection] = useState('profile');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empResponse, leavesResponse] = await Promise.all([
          axios.get(`https://emp-management-hbon.onrender.com/api/employees/${id}`),
          axios.get(`https://emp-management-hbon.onrender.com/api/leaves/${id}`)
        ]);
        setEmployee(empResponse.data);
        setLeaves(leavesResponse.data);
      } catch (error) {
        alert('Error fetching data');
      }
    };
    fetchData();
  }, [id]);

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://emp-management-hbon.onrender.com/api/leaves', {
        ...leaveForm,
        employeeId: id
      });
      setLeaves([response.data, ...leaves]);
      setLeaveForm({ startDate: '', endDate: '', reason: '' });
    } catch (error) {
      alert('Error applying for leave');
    }
  };

  const handleResignationSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://emp-management-hbon.onrender.com/api/resignations', {
        ...resignationForm,
        employeeId: id
      });
      alert('Resignation submitted successfully');
      setResignationForm({ reason: '', lastWorkingDay: '' });
    } catch (error) {
      alert('Error submitting resignation');
    }
  };

  const handleCancelLeave = async (leaveId) => {
    try {
      await axios.delete(`https://emp-management-hbon.onrender.com/api/leaves/${leaveId}`);
      setLeaves(leaves.filter(leave => leave._id !== leaveId));
    } catch (error) {
      alert('Error cancelling leave request');
    }
  };

  if (!employee) {
    return <div>Loading...</div>;
  }

  const totalLeaveDays = employee.leaveBalance || 0;
  const usedLeaveDays = leaves.reduce((acc, leave) => {
    if (leave.status !== 'pending') {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const diff = (end - start) / (1000 * 3600 * 24) + 1; 
      return acc + diff;
    }
    return acc;
  }, 0);
  const remainingLeaveDays = totalLeaveDays - usedLeaveDays;

  const pastLeaves = leaves.filter(leave => leave.status !== 'pending');
  const pendingLeaves = leaves.filter(leave => leave.status === 'pending');

  return (
    <div className="flex">
      <div className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-4">Dashboard</h2>
        <button
          onClick={() => setActiveSection('profile')}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mb-2"
        ><FaUser className="icon" />
          Employee Profile
        </button>
        <button
          onClick={() => setActiveSection('applyLeave')}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mb-2"
        ><FaCalendar className="icon" />
          Apply for Leave
        </button>
        <button
          onClick={() => setActiveSection('resignation')}
          className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 mb-2"
        >
          <FaSignOutAlt className="inline-block mr-2" />
          Apply for Resignation
        </button>
        <button
          onClick={() => setActiveSection('leaveHistory')}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mb-2"
        ><FaListAlt className="icon" />
          Leave History
        </button>
        <button
          onClick={() => setActiveSection('attendance')}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        ><FaClipboardList className="icon" />
          Attendance
        </button>
      </div>

      <div className="flex-1 p-8">
        {activeSection === 'profile' && (
          <div className="profile-card">
            <div className="profile-image">
              <img src={profile} alt="Profile" className="w-32 h-32 rounded-full object-cover mx-auto" />
            </div>
            <h2>Employee Profile</h2>
            <div className="profile-item"><div className="profile-label">Employee ID:</div><div className="profile-data">{employee.id}</div></div>
            <div className="profile-item"><div className="profile-label">Name:</div><div className="profile-data">{employee.name}</div></div>
            <div className="profile-item"><div className="profile-label">Email:</div><div className="profile-data">{employee.email}</div></div>
            <div className="profile-item"><div className="profile-label">Phone Number:</div><div className="profile-data">{employee.phone}</div></div>
            <div className="profile-item"><div className="profile-label">Department:</div><div className="profile-data">{employee.department}</div></div>
            <div className="profile-item"><div className="profile-label">Salary Per Month:</div><div className="profile-data">{employee.salary}</div></div>
            <div className="profile-item"><div className="profile-label">Remaining Leave Days:</div><div className="profile-data">{remainingLeaveDays}</div></div>
          </div>
        )}

        {activeSection === 'applyLeave' && (
          <div>
            <h3 className="text-xl font-bold mb-4">Apply for Leave</h3>
            <form onSubmit={handleLeaveSubmit} className="max-w-md bg-white p-6 rounded-lg shadow-md">
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Reason</label>
                  <textarea
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    className="w-full p-2 border rounded"
                    rows="3"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                  Apply for Leave
                </button>
              </div>
            </form>

            {pendingLeaves.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-bold mb-2">Pending Leave Requests</h4>
                {pendingLeaves.map(leave => (
                  <div key={leave._id} className="bg-yellow p-4 rounded mb-2">
                    <p><strong>Start:</strong> {new Date(leave.startDate).toLocaleDateString()}</p>
                    <p><strong>End:</strong> {new Date(leave.endDate).toLocaleDateString()}</p>
                    <p><strong>Reason:</strong> {leave.reason}</p>
                    <button
                      onClick={() => handleCancelLeave(leave._id)}
                      className="mt-2 bg-red text-white p-2 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
       {activeSection === 'resignation' && (
          <div>
            <h3 className="text-xl font-bold mb-4">Apply for Resignation</h3>
            <form onSubmit={handleResignationSubmit} className="max-w-md bg-white p-6 rounded-lg shadow-md">
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Reason for Resignation</label>
                  <textarea
                    value={resignationForm.reason}
                    onChange={(e) => setResignationForm({ ...resignationForm, reason: e.target.value })}
                    className="w-full p-2 border rounded"
                    rows="3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Last Working Day</label>
                  <input
                    type="date"
                    value={resignationForm.lastWorkingDay}
                    onChange={(e) => setResignationForm({ ...resignationForm, lastWorkingDay: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
                >
                  Submit Resignation
                </button>
              </div>
            </form>
          </div>
        )}
        {activeSection === 'leaveHistory' && (
          <div>
            <h3 className="text-xl font-bold mb-4">Leave History</h3>
            {pastLeaves.length === 0 ? (
              <p>No past leave records available.</p>
            ) : (
              pastLeaves.map(leave => (
                <div key={leave._id} className="bg-white p-4 mb-4 shadow-md rounded">
                  <p><strong>Start:</strong> {new Date(leave.startDate).toLocaleDateString()}</p>
                  <p><strong>End:</strong> {new Date(leave.endDate).toLocaleDateString()}</p>
                  <p><strong>Reason:</strong> {leave.reason}</p>
                  <p><strong>Status:</strong> {leave.status}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeSection === 'attendance' && (
          <EmployeeAttendance employeeId={id} />
        )}
      </div>
    </div>
  );
}

export default EmployeeDashboard;
