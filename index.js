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

function viewAllDepartments() {
    db.query('SELECT * FROM department', function(err, results) {
        console.log(err);
        console.table(results);
    });
}

function viewAllRoles() {
    db.query('SELECT * FROM role', function(err, results) {
        console.log(err);
        console.table(results);
    })
}

function viewAllEmployees() {
    db.query('SELECT * FROM employee', function(err, results) {
        console.log(err);
        console.table(results);
    })
}

viewAllDepartments();
viewAllRoles();
viewAllEmployees();