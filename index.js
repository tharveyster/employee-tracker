const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

const db = mysql.createConnection(
    {
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'employee_db'
    },
    console.log(`Connected to the employee_db database.`)
);

const mainMenu = () => {
    inquirer
    .prompt({
        name: "action",
        type: "list",
        message: "MAIN MENU",
        choices: [
            "View all departments",
            "View all roles",
            "View all employees",
            "Add department",
            "Add role",
            "Add employee",
            "Update employee role",
            "Update employee manager",
            "View employees by department",
            "Delete department",
            "Delete role",
            "Delete employee",
            "View department budget"
        ]
    })
    .then((answer) => {
        switch (answer.action) {
            case "View all departments":
                viewAllDepartments();
                break;
            case "View all roles":
                viewAllRoles();
                break;
            case "View all employees":
                viewAllEmployees();
                break;
            case "Add department":
                addDepartment();
        }
    })
}

const viewAllDepartments = () => {
    db.query('SELECT name AS "DEPARTMENT NAME", id AS ID FROM department', function(err, results) {
        if (err) {
            console.log(err);
        } else {
            console.table(results);
            mainMenu();
        }
    });
}

const viewAllRoles = () => {
    db.query('SELECT a.title AS TITLE, a.id AS ID, b.name AS "DEPARTMENT", a.salary AS SALARY FROM role a JOIN department b ON a.department_id = b.id', function(err, results) {
        if (err) {
            console.log(err);
        } else {
            console.table(results);
            mainMenu();
        }
    })
}

const viewAllEmployees = () => {
    db.query('SELECT a.id AS ID, a.first_name AS "FIRST NAME", a.last_name AS "LAST NAME", b.title AS "JOB TITLE", c.name AS DEPARTMENT, b.salary AS SALARY, CONCAT(d.first_name, " ", d.last_name) AS MANAGER FROM employee a JOIN role b ON a.role_id = b.id JOIN department c ON b.department_id = c.id LEFT JOIN employee d on a.manager_id = d.id', function(err, results) {
        if (err) {
            console.log(err);
        } else {
            console.table(results);
            mainMenu();
        }
    })
}

const addDepartment = () => {
    inquirer
    .prompt({
        name: "newDepartment",
        type: "input",
        message: "New department name:"
    })
    .then((answer) => {
        db.query(`INSERT INTO department (name) VALUES ("${answer.newDepartment}")`, function(err, results) {
            if (err) {
                console.log(err);
            } else {
                console.log(`${answer.newDepartment} successfully added.`);
                mainMenu();
            }
        })
    })
}

const addRole = () => {
    const roleTitle = "Test Role";
    const roleSalary = 8.00;
    const roleDepId = 1
    db.query(`INSERT INTO role (title, salary, department_id) VALUES ("${roleTitle}", ${roleSalary}, ${roleDepId})`, function(err, results) {
        if (err) {
            console.log(err);
        } else {
            console.log(results);
            console.log(`${roleTitle} successfully added.`);
        }
    })
}

// TODO - Add employee

// TODO - Change employee role

// TODO - Change employee manager

// TODO - View employees by department

// TODO - Delete departments

// TODO - Delete roles

// TODO - Delete employees

// TODO - View department budget

//addRole();

mainMenu();