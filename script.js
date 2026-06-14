let categoryChart;
let currentUser = localStorage.getItem("loggedUser") || null;
let users = JSON.parse(localStorage.getItem("users")) || {};
let expenses = [];
let chart;

function saveUsers() {
    localStorage.setItem("users", JSON.stringify(users));
}

function showApp() {
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("appPage").style.display = "block";
    loadExpenses();
}

function registerUser() {
    let user = document.getElementById("username").value;
    let pass = document.getElementById("password").value;
    if (!user || !pass) return alert("Enter details");
    if (users[user]) return alert("User already exists");

    users[user] = { password: pass, expenses: [] };
    saveUsers();
    alert("Registered!");
}

function loginUser() {
    let user = document.getElementById("username").value;
    let pass = document.getElementById("password").value;

    if (!users[user] || users[user].password !== pass) {
        loginMsg.innerHTML = "Invalid Credentials";
        return;
    }

    currentUser = user;
    localStorage.setItem("loggedUser", user);
    showApp();
}

function logout() {
    localStorage.removeItem("loggedUser");
    location.reload();
}

function loadExpenses() {
    expenses = users[currentUser].expenses;
    showExpenses();
    updateChart();
}

function addExpense() {
    let exp = {
        title: title.value,
        amount: parseFloat(amount.value),
        date: date.value,
        category: category.value
    };

    if (!exp.title || !exp.amount || !exp.date) return alert("Fill details");

    expenses.push(exp);
    users[currentUser].expenses = expenses;
    saveUsers();

    title.value = amount.value = date.value = "";

    showExpenses();
    updateChart();
}

function showExpenses() {
    let table = document.getElementById("expenseTable");
    table.innerHTML = "";
    let total = 0;

    expenses.forEach((e, index) => {
        total += e.amount;
        table.innerHTML += `
            <tr>
                <td>${e.title}</td>
                <td>₹${e.amount}</td>
                <td>${e.date}</td>
                <td>${e.category}</td>
                <td><button class="delete-btn" onclick="deleteExpense(${index})">Delete</button></td>
            </tr>`;
    });

    document.getElementById("total").innerText = total;
}

function deleteExpense(i) {
    expenses.splice(i, 1);
    users[currentUser].expenses = expenses;
    saveUsers();
    showExpenses();
    updateChart();
}

function updateChart() {
    let monthly = {};
    let categoryTotals = {};

    expenses.forEach(e => {
        let month = e.date.slice(0, 7);
        monthly[month] = (monthly[month] || 0) + e.amount;
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    if (chart) chart.destroy();
    chart = new Chart(document.getElementById("expenseChart"), {
        type: "bar",
        data: {
            labels: Object.keys(monthly),
            datasets: [{ label: "Monthly Expense", data: Object.values(monthly) }]
        }
    });

    if (categoryChart) categoryChart.destroy();
    const catCanvas = document.getElementById("categoryChart");
    if (catCanvas) {
        categoryChart = new Chart(catCanvas, {
            type: "pie",
            data: {
                labels: Object.keys(categoryTotals),
                datasets: [{ data: Object.values(categoryTotals) }]
            }
        });
    }
}
    

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Expense Report", 10, 10);

    let y = 20;

    expenses.forEach((e, i) => {
        doc.setFontSize(12);
        doc.text(
            `${i + 1}. ${e.title} | ₹${e.amount} | ${e.date} | ${e.category}`,
            10,
            y
        );
        y += 8;

        if (y > 280) {
            doc.addPage();
            y = 20;
        }
    });

    doc.save("Expense_Report.pdf");
}

if (currentUser) showApp();
