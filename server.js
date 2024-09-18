const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// שמירת נתונים של עובדים
app.post('/addEmployee', (req, res) => {
    const { code, name } = req.body;
    const employees = JSON.parse(fs.readFileSync('employees.json', 'utf8'));
    if (employees.find(emp => emp.code === code)) {
        return res.status(400).json({ message: 'Employee already exists' });
    }
    employees.push({ code, name });
    fs.writeFileSync('employees.json', JSON.stringify(employees));
    res.status(200).json({ message: 'Employee added successfully' });
});

// שמירת נתונים של פרויקטים
app.post('/addProject', (req, res) => {
    const { code, name } = req.body;
    const projects = JSON.parse(fs.readFileSync('projects.json', 'utf8'));
    if (projects.find(proj => proj.code === code)) {
        return res.status(400).json({ message: 'Project already exists' });
    }
    projects.push({ code, name });
    fs.writeFileSync('projects.json', JSON.stringify(projects));
    res.status(200).json({ message: 'Project added successfully' });
});

// שמירת זמני הטיימר
app.post('/saveTimer', (req, res) => {
    const { employeeCode, projectCode, time, date } = req.body;
    const timeEntries = JSON.parse(fs.readFileSync('timeEntries.json', 'utf8'));
    timeEntries.push({ employeeCode, projectCode, time, date });
    fs.writeFileSync('timeEntries.json', JSON.stringify(timeEntries));
    res.status(200).json({ message: 'Time saved successfully' });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
