let employees = [];
let projects = [];
let activeTimers = {}; // אובייקט לאחסון טיימרים פעילים
let timerIntervals = {}; // אובייקט לאחסון של מחזורי הטיימר
let timeEntries = []; // אובייקט לאחסון זמני עבודה

// טעינת נתונים מה-localStorage בעת טעינת הדף
window.addEventListener('load', function() {
    loadEmployees();
    loadProjects();
    loadActiveTimers();
    loadTimeEntries();
});

// הוספת עובד
document.getElementById('addEmployeeForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const code = document.getElementById('employeeCode').value;
    const name = document.getElementById('employeeName').value;

    if (employees.find(emp => emp.code === code)) {
        alert('עובד עם קוד זה כבר קיים.');
    } else {
        employees.push({ code, name });
        updateEmployeeSelect();
        updateEmployeeList();
        saveEmployees();
        alert('העובד נוסף בהצלחה.');
    }
});



// מחיקת עובד
function deleteEmployee(code) {
    employees = employees.filter(emp => emp.code !== code);
    updateEmployeeSelect();
    updateEmployeeList();
    saveEmployees();
    alert('העובד נמחק בהצלחה.');
}

// הוספת פרויקט
document.getElementById('addProjectForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const code = document.getElementById('projectCode').value;
    const name = document.getElementById('projectName').value;

    if (projects.find(proj => proj.code === code)) {
        alert('פרויקט עם קוד זה כבר קיים.');
    } else {
        projects.push({ code, name });
        updateProjectSelect();
        updateProjectList();
        saveProjects();
        alert('הפרויקט נוסף בהצלחה.');
    }
});



// מחיקת פרויקט
function deleteProject(code) {
    projects = projects.filter(proj => proj.code !== code);
    updateProjectSelect();
    updateProjectList();
    saveProjects();
    alert('הפרויקט נמחק בהצלחה.');
}

// עדכון רשימת עובדים
function updateEmployeeSelect() {
    const select = document.getElementById('employeeSelect');
    if (select) {
        select.innerHTML = '';
        employees.forEach(emp => {
            const option = document.createElement('option');
            option.value = emp.code;
            option.textContent = emp.name;
            select.appendChild(option);
        });
    }
}

// עדכון רשימת פרויקטים
function updateProjectSelect() {
    const select = document.getElementById('projectSelect');
    if (select) {
        select.innerHTML = '';
        projects.forEach(proj => {
            const option = document.createElement('option');
            option.value = proj.code;
            option.textContent = proj.name;
            select.appendChild(option);
        });
    }
}

// עדכון רשימת עובדים בדף הבית
function updateEmployeeList() {
    const ul = document.getElementById('employeeListUl');
    if (ul) {
        ul.innerHTML = '';
        employees.forEach(emp => {
            const li = document.createElement('li');
            li.innerHTML = `${emp.name} (${emp.code}) 
                <button class="delete-button" onclick="deleteEmployee('${emp.code}')">מחק</button>`;
            ul.appendChild(li);
        });
    }
}


function updateProjectList() {
    const ul = document.getElementById('projectListUl');
    if (ul) {
        ul.innerHTML = '';
        projects.forEach(proj => {
            const li = document.createElement('li');
            li.innerHTML = `${proj.name} (${proj.code}) 
                <button class="delete-button" onclick="deleteProject('${proj.code}')">מחק</button>`;
            ul.appendChild(li);
        });
    }
}


// הוספת טיימר
document.getElementById('startButton')?.addEventListener('click', function() {
    const employeeCode = document.getElementById('employeeSelect').value;
    const projectCode = document.getElementById('projectSelect').value;

    if (!employeeCode || !projectCode) {
        alert('אנא בחר עובד ופרויקט.');
        return;
    }

    const timerKey = `${employeeCode}_${projectCode}`;
    const now = new Date();

    if (activeTimers[timerKey]) {
        alert('טיימר כבר פועל עבור עובד ופרויקט אלו.');
        return;
    }

    activeTimers[timerKey] = { start: now };
    timerIntervals[timerKey] = setInterval(() => {
        // אין צורך לעדכן את התצוגה של הטיימר כאן, לפי הדרישה הנוכחית
    }, 1000);

    updateActiveTimersDisplay();
    saveActiveTimers();
});

// הפסקת טיימר
function stopTimer(timerKey) {
    clearInterval(timerIntervals[timerKey]);
    const now = new Date();
    const startTime = new Date(activeTimers[timerKey]?.start);
    const elapsed = now - startTime;
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);

    // הוספת נתונים לדוח
    const existingEntry = timeEntries.find(entry => entry.employeeCode === timerKey.split('_')[0] && entry.projectCode === timerKey.split('_')[1] && entry.date === now.toISOString().split('T')[0]);
    if (existingEntry) {
        existingEntry.time = formatTime(
            ...addTimes(existingEntry.time, formatTime(hours, minutes, seconds)).split(':').map(Number)
        );
    } else {
        timeEntries.push({
            employeeCode: timerKey.split('_')[0],
            projectCode: timerKey.split('_')[1],
            time: formatTime(hours, minutes, seconds),
            date: now.toISOString().split('T')[0]
        });
    }

    delete activeTimers[timerKey];
    clearInterval(timerIntervals[timerKey]);
    saveTimeEntries();
    updateReportTable();
    updateActiveTimersDisplay();
    saveActiveTimers();
}

// הוספת זמנים
function addTimes(time1, time2) {
    const [h1, m1, s1] = time1.split(':').map(Number);
    const [h2, m2, s2] = time2.split(':').map(Number);
    const totalSeconds = (h1 * 3600 + m1 * 60 + s1) + (h2 * 3600 + m2 * 60 + s2);
    return formatTime(
        Math.floor(totalSeconds / 3600),
        Math.floor((totalSeconds % 3600) / 60),
        totalSeconds % 60
    );
}

// עיצוב זמן לפורמט
function formatTime(hours, minutes, seconds) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// עדכון תצוגת טיימרים פעילים
function updateActiveTimersDisplay() {
    const ul = document.getElementById('activeTimers');
    if (ul) {
        ul.innerHTML = '';
        Object.keys(activeTimers).forEach(key => {
            const [empCode, projCode] = key.split('_');
            const empName = employees.find(e => e.code === empCode)?.name || 'לא נמצא';
            const projName = projects.find(p => p.code === projCode)?.name || 'לא נמצא';
            const li = document.createElement('li');
            li.textContent = `עובד: ${empName}, פרויקט: ${projName}`;
            const stopButton = document.createElement('button');
            stopButton.className = 'stop-button'; // הוספת המחלקה החדשה
            stopButton.textContent = 'הפסק טיימר';
            stopButton.onclick = () => stopTimer(key);
            li.appendChild(stopButton);
            ul.appendChild(li);
        });
    }
}


// עדכון דוח
function updateReportTable() {
    const tbody = document.querySelector('#reportTable tbody');
    if (tbody) {
        tbody.innerHTML = '';
        const groupedEntries = timeEntries.reduce((acc, entry) => {
            const key = `${entry.employeeCode}_${entry.projectCode}_${entry.date}`;
            if (!acc[key]) {
                acc[key] = { ...entry };
            } else {
                const [hours, minutes, seconds] = entry.time.split(':').map(Number);
                const [accHours, accMinutes, accSeconds] = acc[key].time.split(':').map(Number);
                const totalSeconds = (hours * 3600 + minutes * 60 + seconds) + (accHours * 3600 + accMinutes * 60 + accSeconds);
                acc[key].time = formatTime(
                    Math.floor(totalSeconds / 3600),
                    Math.floor((totalSeconds % 3600) / 60),
                    totalSeconds % 60
                );
            }
            return acc;
        }, {});
        Object.values(groupedEntries).forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.employeeCode}</td>
                <td>${employees.find(e => e.code === entry.employeeCode)?.name || 'לא נמצא'}</td>
                <td>${entry.projectCode}</td>
                <td>${projects.find(p => p.code === entry.projectCode)?.name || 'לא נמצא'}</td>
                <td>${entry.time}</td>
                <td>${entry.date}</td>
            `;
            tbody.appendChild(row);
        });
    }
}

// ניקוי נתונים מה-localStorage
function clearData() {
    localStorage.removeItem('employees');
    localStorage.removeItem('projects');
    localStorage.removeItem('activeTimers');
    localStorage.removeItem('timeEntries');
    employees = [];
    projects = [];
    activeTimers = {};
    timeEntries = [];
    updateEmployeeList();
    updateProjectList();
    updateReportTable();
    updateActiveTimersDisplay();
}

// ניקוי טבלה
document.getElementById('clearReportTable')?.addEventListener('click', function() {
    if (confirm('האם אתה בטוח שברצונך לנקות את הטבלה?')) {
        timeEntries = [];
        updateReportTable();
        saveTimeEntries();
        alert('הטבלה נוקתה בהצלחה.');
    }
});

// שמירה ב-localStorage
function saveEmployees() {
    localStorage.setItem('employees', JSON.stringify(employees));
}

function saveProjects() {
    localStorage.setItem('projects', JSON.stringify(projects));
}

function saveActiveTimers() {
    localStorage.setItem('activeTimers', JSON.stringify(activeTimers));
}

function saveTimeEntries() {
    localStorage.setItem('timeEntries', JSON.stringify(timeEntries));
}

function loadEmployees() {
    employees = JSON.parse(localStorage.getItem('employees')) || [];
    updateEmployeeSelect();
    updateEmployeeList();
}

function loadProjects() {
    projects = JSON.parse(localStorage.getItem('projects')) || [];
    updateProjectSelect();
    updateProjectList();
}

function loadActiveTimers() {
    activeTimers = JSON.parse(localStorage.getItem('activeTimers')) || {};
    updateActiveTimersDisplay();
}

function loadTimeEntries() {
    timeEntries = JSON.parse(localStorage.getItem('timeEntries')) || [];
    updateReportTable();
}
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('exportToExcel').addEventListener('click', function () {
        const table = document.getElementById('reportTable');
        let csvContent = "data:text/csv;charset=utf-8,\ufeff"; // BOM for UTF-8

        // Extract rows and columns
        const rows = table.querySelectorAll('tr');

        rows.forEach(row => {
            const cols = row.querySelectorAll('td, th');
            const rowData = Array.from(cols).map(col => {
                let text = col.textContent.trim();
                // Escape double quotes in text
                text = text.replace(/"/g, '""');
                return `"${text}"`;
            }).join(',');
            csvContent += rowData + "\n";
        });

        // Create and download the CSV file
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'report.csv');
        link.style.display = 'none'; // Ensure the link is not visible
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});

