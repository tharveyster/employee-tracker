const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');
const { listenerCount } = require('events');

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
        message: "What would you like to do?",
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
                break;
            case "Add role":
                addRole();
                break;
            case "Add employee":
                addEmployee();
                break;
            case "Delete employee":
                deleteEmployee();
                break;
        }
    })
}

const viewAllDepartments = async () => {
    db.query('SELECT name AS "DEPARTMENT NAME", id AS ID FROM department', function(err, results) {
        if (err) {
            console.log(err);
        } else {
            console.table(results);
            mainMenu();
        }
    });
}

const viewAllRoles = async () => {
    db.query('SELECT a.title AS TITLE, a.id AS ID, b.name AS "DEPARTMENT", a.salary AS SALARY FROM role a JOIN department b ON a.department_id = b.id', function(err, results) {
        if (err) {
            console.log(err);
        } else {
            console.table(results);
            mainMenu();
        }
    })
}

const viewAllEmployees = async () => {
    db.query('SELECT a.id AS ID, a.first_name AS "FIRST NAME", a.last_name AS "LAST NAME", b.title AS "JOB TITLE", c.name AS DEPARTMENT, b.salary AS SALARY, CONCAT(d.first_name, " ", d.last_name) AS MANAGER FROM employee a JOIN role b ON a.role_id = b.id JOIN department c ON b.department_id = c.id LEFT JOIN employee d on a.manager_id = d.id', function(err, results) {
        if (err) {
            console.log(err);
        } else {
            console.table(results);
            mainMenu();
        }
    })
}

const addDepartment = async () => {
    inquirer
    .prompt({
        name: "newDepartment",
        type: "input",
        message: "New department name:"
    })
    .then((answer) => {
        db.query(`INSERT INTO department (name) VALUES (?)`, `${answer.newDepartment}`, function(err, results) {
            if (err) {
                console.log(err);
            } else {
                console.log(`${answer.newDepartment} department successfully added.`);
                mainMenu();
            }
        })
    })
}

const addRole = async () => {
    db.query('SELECT * FROM department', function (err, results) {
        if (err) {
            console.log(err);
        } else {
            inquirer
            .prompt([
                {
                    name: "newRoleTitle",
                    type: "input",
                    message: "New role title:"
                },
                {
                    name: "newRoleSalary",
                    type: "input",
                    message: "New role salary:"
                },
                {
                    name: "newRoleDepartment",
                    type: "list",
                    choices: function() {
                        let departmentArray = [];
                        for (let i = 0; i < results.length; i++) {
                            departmentArray.push(results[i].name);
                        }
                        return departmentArray;
                    },
                }
            ])
            .then((answer) => {
                let department_id;
                for (let j = 0; j < results.length; j++) {
                    if (results[j].name == answer.newRoleDepartment) {
                        department_id = results[j].id;
                    }
                }
                db.query('INSERT INTO role SET ?',
                    {
                        title: answer.newRoleTitle,
                        salary: answer.newRoleSalary,
                        department_id: department_id
                    },
                ), function (err, results) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(results);
                    }
                }
                console.log(`${answer.newRoleTitle} role successfully added.`);
                mainMenu();
            })
        }
    })
}

const addEmployee = async () => {
    inquirer
    .prompt([
        {
            name: "newEmployeeFirstName",
            type: "input",
            message: "New employee first name:"
        },
        {
            name: "newEmployeeLastName",
            type: "input",
            message: "New employee last name:"
        }
    ])
    .then(answer => {
        const names = [answer.newEmployeeFirstName, answer.newEmployeeLastName];
        db.query('SELECT id, title FROM role', (err, results) => {
            if (err) {
                console.log(err);
            } else {
                const roles = results.map(({ id, title }) => ({ name: title, value: id }));
                inquirer.prompt([
                    {
                        name: "role",
                        type: "list",
                        choices: roles,
                        message: "New employee role:"
                    }
                ])
                .then(roleChoice => {
                    const role = roleChoice.role;
                    names.push(role);

                    db.query('SELECT * FROM employee', (err, results) => {
                        if (err) throw err;

                        const managers = results.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));
                        managers.push({ name: 'None', value: null });

                        inquirer.prompt([
                            {
                                name: "manager",
                                type: "list",
                                choices: managers,
                                message: "New employee manager:"
                            }
                        ])
                        .then(managerChoice => {
                            const manager = managerChoice.manager;
                            names.push(manager);

                            db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', names, (err, results) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(`${answer.newEmployeeFirstName} ${answer.newEmployeeLastName} successfully added.`);
                                }

                                mainMenu();
                            });
                        });
                    })
                })
            }
        })
    })
}

const deleteEmployee = () => {
    db.query('SELECT * FROM employee', (err, results) => {
        if (err) {
            console.log(err);
        } else {
            const employeeList = results.map(({ id, first_name, last_name }) => ({ name: first_name + ' ' + last_name, value: id}));

            inquirer
            .prompt([
                {
                    name: "name",
                    type: "list",
                    choices: employeeList,
                    message: "Employee to delete:"
                }
            ])
            .then(answer => {
                db.query('DELETE FROM employee WHERE id = ?', answer.name, (err, results) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Employee successfully deleted.')
                        mainMenu();
                    }
                })
            })
        }
    })
}

// TODO - Change employee role

// TODO - Change employee manager

// TODO - View employees by department

// TODO - Delete departments

// TODO - Delete roles

// TODO - View department budget

mainMenu();