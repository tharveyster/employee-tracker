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

const viewAllDepartments = () => {
    db.query('SELECT name AS "DEPARTMENT NAME", id AS ID FROM department', function(err, results) {
        if (err) {
            console.log(err);
        } else {
            console.table(results);
        }
    });
}

const viewAllRoles = () => {
    db.query('SELECT a.title AS TITLE, a.id AS ID, b.name AS "DEPARTMENT", a.salary AS SALARY FROM role a JOIN department b ON a.department_id = b.id', function(err, results) {
        if (err) {
            console.log(err);
        } else {
            console.table(results);
        }
    })
}

const viewAllEmployees = () => {
    db.query('SELECT a.id AS ID, a.first_name AS "FIRST NAME", a.last_name AS "LAST NAME", b.title AS "JOB TITLE", c.name AS DEPARTMENT, b.salary AS SALARY, CONCAT(d.first_name, " ", d.last_name) AS MANAGER FROM employee a JOIN role b ON a.role_id = b.id JOIN department c ON b.department_id = c.id LEFT JOIN employee d on a.manager_id = d.id', function(err, results) {
        if (err) {
            console.log(err);
        } else {
            console.table(results);
        }
    })
}

function addDepartment() {
    db.query('INSERT INTO department (name) VALUES (?)')
}

viewAllDepartments();
viewAllRoles();
viewAllEmployees();