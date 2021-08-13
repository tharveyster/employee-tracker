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
        message: "What would you like to do?",
        choices: [
            "View all departments",
            "View all roles",
            "View all employees",
            "Add a new department",
            "Add a new role",
            "Add a new employee",
            "Update employee role",
            "Update employee manager",
            "View employees by department",
            "Delete a department",
            "Delete a role",
            "Delete an employee",
            "View department budgets",
            "Quit"
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
            case "Add a new department":
                addDepartment();
                break;
            case "Add a new role":
                addRole();
                break;
            case "Add a new employee":
                addEmployee();
                break;
            case "Update employee role":
                updateRole();
                break;
            case "Update employee manager":
                updateManager();
                break;
            case "View employees by department":
                viewByDepartment();
                break;
            case "Delete a department":
                deleteDepartment();
                break;
            case "Delete a role":
                deleteRole();
                break;
            case "Delete an employee":
                deleteEmployee();
                break;
            case "View department budgets":
                departmentBudget();
                break;
            case "Quit":
                exitApp();
                break;
        }
    })
}

const viewAllDepartments = async () => {
    db.query('SELECT name AS "DEPARTMENT NAME", id AS ID FROM department', function(err, res) {
        if (err) {
            console.log(err);
        } else {
            console.table(res);
            mainMenu();
        }
    });
}

const viewAllRoles = async () => {
    db.query('SELECT a.title AS TITLE, a.id AS ID, b.name AS "DEPARTMENT", a.salary AS SALARY FROM role a LEFT JOIN department b ON a.department_id = b.id', function(err, res) {
        if (err) {
            console.log(err);
        } else {
            console.table(res);
            mainMenu();
        }
    })
}

const viewAllEmployees = async () => {
    db.query('SELECT a.id AS ID, a.first_name AS "FIRST NAME", a.last_name AS "LAST NAME", b.title AS "JOB TITLE", c.name AS DEPARTMENT, b.salary AS SALARY, CONCAT(d.first_name, " ", d.last_name) AS MANAGER FROM employee a LEFT JOIN role b ON a.role_id = b.id LEFT JOIN department c ON b.department_id = c.id LEFT JOIN employee d ON a.manager_id = d.id', function(err, res) {
        if (err) {
            console.log(err);
        } else {
            console.table(res);
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
        db.query(`INSERT INTO department (name) VALUES (?)`, `${answer.newDepartment}`, function(err, res) {
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
    db.query('SELECT * FROM department', function (err, res) {
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
                        for (let i = 0; i < res.length; i++) {
                            departmentArray.push(res[i].name);
                        }
                        return departmentArray;
                    },
                }
            ])
            .then((answer) => {
                let department_id;
                for (let j = 0; j < res.length; j++) {
                    if (res[j].name == answer.newRoleDepartment) {
                        department_id = res[j].id;
                    }
                }
                db.query('INSERT INTO role SET ?',
                    {
                        title: answer.newRoleTitle,
                        salary: answer.newRoleSalary,
                        department_id: department_id
                    },
                ), function (err, res) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(res);
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
        db.query('SELECT id, title FROM role', (err, res) => {
            if (err) {
                console.log(err);
            } else {
                const roles = res.map(({ id, title }) => ({ name: title, value: id }));
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

                    db.query('SELECT * FROM employee', (err, res) => {
                        if (err) {
                            console.log(err);
                        } else {
                            const managers = res.map(({ id, first_name, last_name }) => ({ name: first_name + ' ' + last_name, value: id }));
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

                                db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', names, (err, res) => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log(`${answer.newEmployeeFirstName} ${answer.newEmployeeLastName} successfully added.`);
                                    }

                                    mainMenu();
                                });
                            });
                        }
                    })
                })
            }
        })
    })
}

const updateRole = async () => {
    db.query('SELECT * FROM employee', (err, res) => {
        if (err) {
            console.log(err);
        } else {
            const employeeList = res.map(({ id, first_name, last_name }) => ({ name: first_name + ' ' + last_name, value: id }));

            inquirer
            .prompt([
                {
                    name: "name",
                    type: "list",
                    choices: employeeList,
                    message: "Which employee do you want to change?"
                }
            ])
            .then(answer => {
                const nameList = [answer.name];
                
                db.query('SELECT id, title FROM role', (err, res) => {
                    if (err) {
                        console.log(err);
                    } else {
                        const roles = res.map(({ id, title }) => ({ name: title, value: id }));
                        inquirer.prompt([
                            {
                                name: "role",
                                type: "list",
                                choices: roles,
                                message: "New role for this employee:"
                            }
                        ])
                        .then(roleChoice => {
                            db.query('UPDATE employee SET role_id = ? WHERE id = ?', [roleChoice.role, answer.name], (err, res) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log('Employee role successfully updated.');
                                    mainMenu();
                                }
                            })
                        })
                    }
                })
            })
        }
    })
}

const updateManager = async () => {
    db.query('SELECT * FROM employee', (err, res) => {
        if (err) {
            console.log(err);
        } else {
            const employeeList = res.map(({ id, first_name, last_name }) => ({ name: first_name + ' ' + last_name, value: id }));

            inquirer
            .prompt([
                {
                    name: "name",
                    type: "list",
                    choices: employeeList,
                    message: "Which employee do you want to change?"
                }
            ])
            .then(answer => {
                const nameList = [answer.name];
                
                db.query('SELECT * FROM employee', (err, res) => {
                    if (err) {
                        console.log(err);
                    } else {
                        const managers = res.map(({ id, first_name, last_name }) => ({ name: first_name + ' ' + last_name, value: id }));
                        inquirer.prompt([
                            {
                                name: "manager",
                                type: "list",
                                choices: managers,
                                message: "New manager for this employee:"
                            }
                        ])
                        .then(managerChoice => {
                            db.query('UPDATE employee SET manager_id = ? WHERE id = ?', [managerChoice.manager, answer.name], (err, res) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log('Employee manager successfully updated.');
                                    mainMenu();
                                }
                            })
                        })
                    }
                })
            })
        }
    })
}

const viewByDepartment = async () => {
    db.query('SELECT * FROM department', (err, res) => {
        if (err) {
            console.log(err);
        } else {
            const departmentList = res.map(({ id, name }) => ({ name: name, value: id}));

            inquirer
            .prompt([
                {
                    name: "name",
                    type: "list",
                    choices: departmentList,
                    message: "Department to view:"
                }
            ])
            .then(answer => {
                db.query('SELECT DISTINCT a.id AS ID, CONCAT(a.first_name, " ", a.last_name) AS NAME, b.title AS TITLE, b.salary AS SALARY, CONCAT(d.first_name, " ", d.last_name) AS MANAGER FROM employee a JOIN role b ON a.role_id = b.id JOIN department c ON b.department_id = ? LEFT JOIN employee d ON a.manager_id = d.id ORDER BY a.id ASC', answer.name, (err, res) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.table(res);
                        mainMenu();
                    }
                })
            })
        }
    })
}

const deleteDepartment = async () => {
    db.query('SELECT * FROM department', (err, res) => {
        if (err) {
            console.log(err);
        } else {
            const departmentList = res.map(({ id, name }) => ({ name: name, value: id}));

            inquirer
            .prompt([
                {
                    name: "name",
                    type: "list",
                    choices: departmentList,
                    message: "Department to delete:"
                }
            ])
            .then(answer => {
                db.query('DELETE FROM department WHERE id = ?', answer.name, (err, res) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Department successfully deleted.')
                        mainMenu();
                    }
                })
            })
        }
    })
}

const deleteRole = async () => {
    db.query('SELECT * FROM role', (err, res) => {
        if (err) {
            console.log(err);
        } else {
            const roleList = res.map(({ id, title }) => ({ name: title, value: id}));

            inquirer
            .prompt([
                {
                    name: "name",
                    type: "list",
                    choices: roleList,
                    message: "Role to delete:"
                }
            ])
            .then(answer => {
                db.query('DELETE FROM role WHERE id = ?', answer.name, (err, res) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Role successfully deleted.')
                        mainMenu();
                    }
                })
            })
        }
    })
}

const deleteEmployee = async () => {
    db.query('SELECT * FROM employee', (err, res) => {
        if (err) {
            console.log(err);
        } else {
            const employeeList = res.map(({ id, first_name, last_name }) => ({ name: first_name + ' ' + last_name, value: id}));

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
                db.query('DELETE FROM employee WHERE id = ?', answer.name, (err, res) => {
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

const departmentBudget = async () => {
    db.query('SELECT DISTINCT a.name AS DEPARTMENT, SUM(b.salary) AS BUDGET FROM department a JOIN role b ON a.id = b.department_id JOIN employee c ON b.id = c.role_id GROUP BY a.name', function(err, res) {
        if (err) {
            console.log(err);
        } else {
            console.table(res);
            mainMenu();
        }
    })
}

const exitApp = async () => {
    console.log("Goodbye!");
    process.exit(0);
};

mainMenu();