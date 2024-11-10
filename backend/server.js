// Backend - server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');


const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/employee_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const employeeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  salary: { type: Number, required: true },
  password: { type: String, default: 'emp' }
});

const Employee = mongoose.model('Employee', employeeSchema);

const leaveSchema = new mongoose.Schema({
    employeeId: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    appliedDate: { type: Date, default: Date.now },
    responseMessage: { type: String }
  });
  
  const Leave = mongoose.model('Leave', leaveSchema);

  
  const attendanceSchema = new mongoose.Schema({
    employeeId: { type: String, required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['present', 'absent', 'half-day'], required: true },
    shift: { type: String, enum: ['day', 'night'], required: true },
    checkIn: { type: Date },
    checkOut: { type: Date },
    workingHours: { type: Number },
    remarks: { type: String }
  });
  
  const Attendance = mongoose.model('Attendance', attendanceSchema);
  
  app.post('/api/attendance', async (req, res) => {
    try {
      const { employeeId, date, status, shift, checkIn } = req.body;
      
      // Check if attendance for this employee on this date already exists
      const existingAttendance = await Attendance.findOne({ employeeId, date: new Date(date) });
      if (existingAttendance) {
        return res.status(400).json({ message: 'Attendance already marked for this date' });
      }
  
      let checkOut = new Date(checkIn);
      if (shift === 'day') {
        checkOut.setHours(18, 0, 0); // 6:00 PM
      } else {
        checkOut.setHours(23, 59, 59); // 11:59:59 PM
      }
  
      let workingHours = (checkOut - new Date(checkIn)) / (1000 * 60 * 60); // Convert to hours
      if (status === 'half-day') {
        workingHours = workingHours / 2;
      }

      const attendance = new Attendance({
        employeeId,
        date,
        status,
        shift,
        checkIn,
        checkOut,
        workingHours
      });
  
      await attendance.save();
      res.status(201).json(attendance);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.get('/api/attendance', async (req, res) => {
    try {
      const { date } = req.query;
      const attendanceRecords = await Attendance.find({ date: new Date(date) });
      res.json(attendanceRecords);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.get('/api/attendance/:employeeId', async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const attendanceRecords = await Attendance.find({
        employeeId: req.params.employeeId,
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      });
      res.json(attendanceRecords);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.get('/api/salary/:employeeId', async (req, res) => {
    try {
      const { month, year } = req.query;
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
  
      const employee = await Employee.findOne({ id: req.params.employeeId });
      const attendance = await Attendance.find({
        employeeId: req.params.employeeId,
        date: {
          $gte: startDate,
          $lte: endDate
        }
      });
  
      const workingDays = attendance.length;
      const presentDays = attendance.filter(a => a.status === 'present').length;
      const halfDays = attendance.filter(a => a.status === 'half-day').length;
      const absentDays = attendance.filter(a => a.status === 'absent').length;
      const totalWorkingHours = attendance.reduce((sum, a) => sum + (a.workingHours || 0), 0);
  
      const perDaySalary = employee.salary / 30; // Assuming 30 days per month
      const regularSalary = (presentDays * perDaySalary) + (halfDays * perDaySalary * 0.5);
      
      // Calculate overtime (assuming standard 8-hour workday)
      const standardMonthlyHours = workingDays * 8;
      const overtimeHours = Math.max(0, totalWorkingHours - standardMonthlyHours);
      const overtimeRate = perDaySalary / 8 * 1.5; // 1.5 times regular hourly rate
      const overtimePay = overtimeHours * overtimeRate;
  
      const baseSalary = regularSalary + overtimePay;
      const pfAmount = baseSalary * 0.12; // 12% PF
      const totalSalary = baseSalary * 1.1 - pfAmount; // 10% bonus minus PF
  
      res.json({
        employeeId: req.params.employeeId,
        position: employee.position,
        month,
        year,
        workingDays,
        presentDays,
        halfDays,
        absentDays,
        totalWorkingHours,
        baseSalary: employee.salary,
        regularSalary,
        overtimeHours,
        overtimePay,
        pfAmount,
        finalSalary: totalSalary
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.get('/api/employees', async (req, res) => {
    try {
      const employees = await Employee.find();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.get('/api/absentees', async (req, res) => {
    try {
      const { date } = req.query;
      const absentees = await Attendance.find({ date: new Date(date), status: 'absent' });
      const absenteeIds = absentees.map(a => a.employeeId);
      const absenteeDetails = await Employee.find({ id: { $in: absenteeIds } });
      res.json(absenteeDetails);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

app.post('/api/login', async (req, res) => {
  try {
    const { id, password } = req.body;
    const employee = await Employee.findOne({ id });
    
    if (!employee || password !== employee.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/employees', async (req, res) => {
  try {
    const employees = await Employee.find({});
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/employees/:id', async (req, res) => {
  try {
    const employee = await Employee.findOne({ id: req.params.id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  try {
    const employee = await Employee.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    const employee = await Employee.findOneAndDelete({ id: req.params.id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/leaves', async (req, res) => {
    try {
      const leave = new Leave(req.body);
      await leave.save();
      res.status(201).json(leave);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.get('/api/leaves/:employeeId', async (req, res) => {
    try {
      const leaves = await Leave.find({ employeeId: req.params.employeeId });
      res.json(leaves);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
 
  app.get('/api/leaves', async (req, res) => {
    try {
      const leaves = await Leave.find().sort({ appliedDate: -1 });
      res.json(leaves);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.put('/api/leaves/:id', async (req, res) => {
    try {
      const leave = await Leave.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!leave) {
        return res.status(404).json({ message: 'Leave request not found' });
      }
      res.json(leave);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.delete('/api/leaves/:leaveId', async (req, res) => {
    try {
      const leaveId = req.params.leaveId;
      const leave = await Leave.findByIdAndDelete(leaveId);
      if (!leave) {
        return res.status(404).send({ message: 'Leave request not found' });
      }
      res.status(200).send({ message: 'Leave request canceled successfully' });
    } catch (error) {
      res.status(500).send({ message: 'Error canceling leave request' });
    }
  });
  // Add this in server.js

// // Define the notification schema
// const notificationSchema = new mongoose.Schema({
//   employeeId: { type: String, required: true },
//   message: { type: String, required: true },
//   date: { type: Date, default: Date.now },
//   status: { type: String, enum: ['unread', 'read'], default: 'unread' }
// });

// const Notification = mongoose.model('Notification', notificationSchema);

// // Endpoint to create a notification
// app.post('/api/notifications', async (req, res) => {
//   try {
//     const { employeeId, message } = req.body;
//     const notification = new Notification({ employeeId, message });
//     await notification.save();
//     res.status(201).json({ message: 'Notification sent successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Endpoint to get notifications for a specific employee
// app.get('/api/notifications/:employeeId', async (req, res) => {
//   try {
//     const notifications = await Notification.find({ employeeId: req.params.employeeId });
//     res.json(notifications);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });
// const fetchNotifications = async (employeeId) => {
//   try {
//     const response = await axios.get(`http://localhost:5000/api/notifications/${employeeId}`);
//     return response.data; // Display these on the frontend
//   } catch (error) {
//     console.error('Error fetching notifications:', error);
//   }
// };
// // Inside the /api/notifications endpoint
// const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'jothisree77@gmail.com',
//     pass: 'admin'
//   }
// });

// app.post('/api/notifications', async (req, res) => {
//   try {
//     const { employeeId, message } = req.body;
//     const notification = new Notification({ employeeId, message });
//     await notification.save();

//     // Find employee's email
//     const employee = await Employee.findOne({ id: employeeId });
//     if (employee) {
//       const mailOptions = {
//         from: 'jothisree77@gmail.com',
//         to: employee.phone,
//         subject: 'Attendance Notification',
//         text: message
//       };
//       await transporter.sendMail(mailOptions);
//     }

//     res.status(201).json({ message: 'Notification sent successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

const PORT = 5000;
app.listen(PORT, () => {
  console.log("Started...")})