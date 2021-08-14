const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');
const chalk = require('chalk');
const { bold } = require('chalk');

// Database connection information
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'employee_db'
    },
    console.log(chalk.green.bold('Connected to the employee_db database.'))
);

// App header
console.log(chalk.cyan.bold('======================================'));
console.log(``);
console.log(chalk.green.bold('           EMPLOYEE TRACKER           '));
console.log(``);
console.log(chalk.cyan.bold('======================================'));

// Inquirer main menu options
const mainMenu = () => {
    inquirer
    .prompt({
        name: 'action',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
            'View All Departments',
            'View All Roles',
            'View All Employees',
            'Add New Department',
            'Add New Role',
            'Add New Employee',
            'Update Employee Role',
            'Update Employee Manager',
            'View Employees By Department',
            'Delete Department',
            'Delete Role',
            'Delete Employee',
            'View Department Budgets',
            'Quit'
        ]
    })
    // List of functions to run for each answer
    .then((answer) => {
        switch (answer.action) {
            case 'View All Departments':
                viewAllDepartments();
                break;
            case 'View All Roles':
                viewAllRoles();
                break;
            case 'View All Employees':
                viewAllEmployees();
                break;
            case 'Add New Department':
                addDepartment();
                break;
            case 'Add New Role':
                addRole();
                break;
            case 'Add New Employee':
                addEmployee();
                break;
            case 'Update Employee Role':
                updateRole();
                break;
            case 'Update Employee Manager':
                updateManager();
                break;
            case 'View Employees By Department':
                viewByDepartment();
                break;
            case 'Delete Department':
                deleteDepartment();
                break;
            case 'Delete Role':
                deleteRole();
                break;
            case 'Delete Employee':
                deleteEmployee();
                break;
            case 'View Department Budgets':
                departmentBudget();
                break;
            case 'Quit':
                exitApp();
                break;
        }
    })
}

// View all departments function
const viewAllDepartments = async () => {
    db.query('SELECT name AS "DEPARTMENT NAME", id AS ID FROM department', function(err, res) {
        if (err) {
            console.log(err);
        } else {
            console.log('');
            console.log(chalk.green('==================='));
            console.log(chalk.yellow('  DEPARTMENT LIST  '));
            console.log(chalk.green('==================='));
            console.table(res);
            console.log('');
            mainMenu();
        }
    });
}

// View all roles function
const viewAllRoles = async () => {
    db.query('SELECT a.title AS TITLE, a.id AS ID, b.name AS "DEPARTMENT", a.salary AS SALARY FROM role a LEFT JOIN department b ON a.department_id = b.id', function(err, res) {
        if (err) {
            console.log(err);
        } else {
            console.log('');
            console.log(chalk.green('============================================='));
            console.log(chalk.yellow('             CURRENT ROLE LIST               '));
            console.log(chalk.green('============================================='));
            console.table(res);
            console.log('');
            mainMenu();
        }
    })
}

// View all employees function
const viewAllEmployees = async () => {
    db.query('SELECT a.id AS ID, a.first_name AS "FIRST NAME", a.last_name AS "LAST NAME", b.title AS "JOB TITLE", c.name AS DEPARTMENT, b.salary AS SALARY, CONCAT(d.first_name, " ", d.last_name) AS MANAGER FROM employee a LEFT JOIN role b ON a.role_id = b.id LEFT JOIN department c ON b.department_id = c.id LEFT JOIN employee d ON a.manager_id = d.id', function(err, res) {
        if (err) {
            console.log(err);
        } else {
            console.log('');
            console.log(chalk.green('=============================================================================================='));
            console.log(chalk.yellow('                                    CURRENT EMPLOYEE LIST                                    '));
            console.log(chalk.green('=============================================================================================='));
            console.table(res);
            console.log('');
            mainMenu();
        }
    })
}

// Add a new department function
const addDepartment = async () => {
    inquirer
    .prompt({
        name: 'newDepartment',
        type: 'input',
        message: 'New department name:',
        validate: (name) => {
            if (name.length < 1) {
                return console.log(chalk.yellow('The department name is required.'));
            } else if (name.length > 30) {
                return console.log(chalk.yellow('The department name must be 30 characters or less.'));
            } else {
                return true;
            }
        }
    })
    .then((answer) => {
        const newDepartment = answer.newDepartment;
        db.query(`INSERT INTO department (name) VALUES (?)`, newDepartment, (err, res) => {
            if (err) {
                console.log(err);
            } else {
                console.log('');
                console.log(chalk.green(`${newDepartment} department successfully added.`));
                console.log('');
                mainMenu();
            }
        })
    })
}

// Add a new role function
const addRole = async () => {
    db.query('SELECT * FROM department', function (err, res) {
        if (err) {
            console.log(err);
        } else {
            const department = res.map(({ id, name }) => ({ name: name, value: id }));
            inquirer
            .prompt([
                {
                    name: 'newRoleTitle',
                    type: 'input',
                    message: 'New role title:',
                    validate: (name) => {
                        if (name.length < 1) {
                            return console.log(chalk.yellow('The role title is required.'));
                        } else if (name.length > 30) {
                            return console.log(chalk.yellow('The role title must be 30 characters or less.'));
                        } else {
                            return true;
                        }
                    }
                },
                {
                    name: 'newRoleSalary',
                    type: 'input',
                    message: 'New role salary:',
                    validate: (name) => {
                        if (name.length < 1) {
                            return console.log(chalk.yellow('The salary is required.'))
                        } else if (isNaN(name)) {
                            return console.log(chalk.yellow('The salary must be a number.'))
                        } else {
                            return true;
                        }
                    }
                },
                {
                    name: 'newRoleDepartment',
                    type: 'list',
                    choices: department,
                    message: "New role department"
                }
            ])
            .then((answer) => {
                const newRole = [answer.newRoleTitle, answer.newRoleSalary, answer.newRoleDepartment];
                const newRoleTitle = answer.newRoleTitle;
                db.query('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', newRole, (err, res) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('');
                        console.log(chalk.green(`${newRoleTitle} role successfully added.`));
                        console.log('');
                        mainMenu();
                    }
                });
            });
        }
    })
}

// Add a new employee function
const addEmployee = async () => {
    inquirer
    .prompt([
        {
            name: 'newEmployeeFirstName',
            type: 'input',
            message: 'New employee first name:',
            validate: (name) => {
                if (name.length < 1) {
                    return console.log(chaclk.yellow('The employee first name is required.'));
                } else if (name.length > 30) {
                    return console.log(chalk.yellow('The employee first name must be 30 characters or less.'));
                } else {
                    return true;
                }
            }
        },
        {
            name: 'newEmployeeLastName',
            type: 'input',
            message: 'New employee last name:',
            validate: (name) => {
                if (name.length < 1) {
                    return console.log(chalk.yellow('The employee last name is required.'));
                } else if (name.length > 30) {
                    return console.log(chalk.yellow('The employee last name must be 30 characters or less.'));
                } else {
                    return true;
                }
            }
        }
    ])
    .then(answer => {
        const names = [answer.newEmployeeFirstName, answer.newEmployeeLastName];
        const employeeName = answer.newEmployeeFirstName + " " + answer.newEmployeeLastName;
        db.query('SELECT id, title FROM role', (err, res) => {
            if (err) {
                console.log(err);
            } else {
                const roles = res.map(({ id, title }) => ({ name: title, value: id }));
                inquirer.prompt([
                    {
                        name: 'role',
                        type: 'list',
                        choices: roles,
                        message: 'New employee role:'
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
                                    name: 'manager',
                                    type: 'list',
                                    choices: managers,
                                    message: 'New employee manager:'
                                }
                            ])
                            .then(managerChoice => {
                                const manager = managerChoice.manager;
                                names.push(manager);

                                db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', names, (err, res) => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log('');
                                        console.log(chalk.green(`${employeeName} successfully added.`));
                                        console.log('');
                                        mainMenu();
                                    }
                                });
                            });
                        }
                    })
                })
            }
        })
    })
}

// Update employee role function
const updateRole = async () => {
    db.query('SELECT * FROM employee', (err, res) => {
        if (err) {
            console.log(err);
        } else {
            const employeeList = res.map(({ id, first_name, last_name }) => ({ name: first_name + ' ' + last_name, value: id }));

            inquirer
            .prompt([
                {
                    name: 'name',
                    type: 'list',
                    choices: employeeList,
                    message: 'Which employee do you want to change?'
                }
            ])
            .then(answer => {
                db.query('SELECT id, title FROM role', (err, res) => {
                    if (err) {
                        console.log(err);
                    } else {
                        const roles = res.map(({ id, title }) => ({ name: title, value: id }));
                        inquirer.prompt([
                            {
                                name: 'role',
                                type: 'list',
                                choices: roles,
                                message: 'New role for this employee:'
                            }
                        ])
                        .then(roleChoice => {
                            let updatedEmployee;
                            db.query('SELECT CONCAT(first_name, " ", last_name, "\'s") AS employeeName FROM employee WHERE id = ?', answer.name, (err, res) => {
                                updatedEmployee = res[0].employeeName;
                            });
                            db.query('UPDATE employee SET role_id = ? WHERE id = ?', [roleChoice.role, answer.name], (err, res) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log('');
                                    console.log(chalk.green(`${updatedEmployee} role successfully updated.`));
                                    console.log('');
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

// Update employee manager function
const updateManager = async () => {
    db.query('SELECT * FROM employee', (err, res) => {
        if (err) {
            console.log(err);
        } else {
            const employeeList = res.map(({ id, first_name, last_name }) => ({ name: first_name + ' ' + last_name, value: id }));

            inquirer
            .prompt([
                {
                    name: 'name',
                    type: 'list',
                    choices: employeeList,
                    message: 'Which employee do you want to change?'
                }
            ])
            .then(answer => {
                db.query('SELECT * FROM employee', (err, res) => {
                    if (err) {
                        console.log(err);
                    } else {
                        const managers = res.map(({ id, first_name, last_name }) => ({ name: first_name + ' ' + last_name, value: id }));
                        inquirer.prompt([
                            {
                                name: 'manager',
                                type: 'list',
                                choices: managers,
                                message: 'New manager for this employee:'
                            }
                        ])
                        .then(managerChoice => {
                            let updatedEmployee;
                            db.query('SELECT CONCAT(first_name, " ", last_name, "\'s") AS employeeName FROM employee WHERE id = ?', answer.name, (err, res) => {
                                updatedEmployee = res[0].employeeName;
                            });
                            db.query('UPDATE employee SET manager_id = ? WHERE id = ?', [managerChoice.manager, answer.name], (err, res) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log('');
                                    console.log(chalk.green(`${updatedEmployee} manager successfully updated.`));
                                    console.log('');
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

// View employees by department function
const viewByDepartment = async () => {
    db.query('SELECT * FROM department', (err, res) => {
        if (err) {
            console.log(err);
        } else {
            const departmentList = res.map(({ id, name }) => ({ name: name, value: id}));

            inquirer
            .prompt([
                {
                    name: 'name',
                    type: 'list',
                    choices: departmentList,
                    message: 'Department to view:'
                }
            ])
            .then(answer => {
                let departmentName; 
                db.query('SELECT name FROM department WHERE id = ?', answer.name, (err, res) => {
                    departmentName = res[0].name;
                    departmentName = departmentName.toUpperCase();
                })
                db.query('SELECT DISTINCT a.id AS ID, CONCAT(a.first_name, " ", a.last_name) AS NAME, b.title AS TITLE, b.salary AS SALARY, CONCAT(d.first_name, " ", d.last_name) AS MANAGER FROM employee a JOIN role b ON a.role_id = b.id JOIN department c ON b.department_id = ? LEFT JOIN employee d ON a.manager_id = d.id ORDER BY a.id ASC', answer.name, (err, res) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('');
                        console.log(chalk.green('============================================================='));
                        console.log(chalk.yellow(`             ${departmentName} DEPARTMENT EMPLOYEE LIST                   `));
                        console.log(chalk.green('============================================================='));
                        console.table(res);
                        console.log('');
                        mainMenu();
                    }
                })
            })
        }
    })
}

// Delete department function
const deleteDepartment = async () => {
    db.query('SELECT * FROM department', (err, res) => {
        if (err) {
            console.log(err);
        } else {
            const departmentList = res.map(({ id, name }) => ({ name: name, value: id}));

            inquirer
            .prompt([
                {
                    name: 'name',
                    type: 'list',
                    choices: departmentList,
                    message: 'Department to delete:'
                }
            ])
            .then(answer => {
                db.query('DELETE FROM department WHERE id = ?', answer.name, (err, res) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('');
                        console.log(chalk.green('Department successfully deleted.'));
                        console.log('');
                        mainMenu();
                    }
                })
            })
        }
    })
}

// Delete role function
const deleteRole = async () => {
    db.query('SELECT * FROM role', (err, res) => {
        if (err) {
            console.log(err);
        } else {
            const roleList = res.map(({ id, title }) => ({ name: title, value: id}));

            inquirer
            .prompt([
                {
                    name: 'name',
                    type: 'list',
                    choices: roleList,
                    message: 'Role to delete:'
                }
            ])
            .then(answer => {
                db.query('DELETE FROM role WHERE id = ?', answer.name, (err, res) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('');
                        console.log(chalk.green('Role successfully deleted.'));
                        console.log('');
                        mainMenu();
                    }
                })
            })
        }
    })
}

// Delete employee function
const deleteEmployee = async () => {
    db.query('SELECT * FROM employee', (err, res) => {
        if (err) {
            console.log(err);
        } else {
            const employeeList = res.map(({ id, first_name, last_name }) => ({ name: first_name + ' ' + last_name, value: id}));

            inquirer
            .prompt([
                {
                    name: 'name',
                    type: 'list',
                    choices: employeeList,
                    message: 'Employee to delete:'
                }
            ])
            .then(answer => {
                let deletedEmployee;
                db.query('SELECT CONCAT(first_name, " ", last_name) AS employeeName FROM employee WHERE id = ?', answer.name, (err, res) => {
                    deletedEmployee = res[0].employeeName;
                });
                db.query('DELETE FROM employee WHERE id = ?', answer.name, (err, res) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('');
                        console.log(chalk.green(`${deletedEmployee} successfully deleted.`));
                        console.log('');
                        mainMenu();
                    }
                })
            })
        }
    })
}

// Show department budgets function
const departmentBudget = async () => {
    db.query('SELECT DISTINCT a.name AS DEPARTMENT, SUM(b.salary) AS BUDGET FROM department a JOIN role b ON a.id = b.department_id JOIN employee c ON b.id = c.role_id GROUP BY a.name', function(err, res) {
        if (err) {
            console.log(err);
        } else {
            console.log('');
            console.log(chalk.green('========================'));
            console.log(chalk.yellow('   DEPARTMENT BUDGETS   '));
            console.log(chalk.green('========================'));
            console.table(res);
            console.log('');
            mainMenu();
        }
    })
}

// Quit the application function
const exitApp = async () => {
    console.log(chalk.green('Goodbye!'));
    process.exit(0);
};

// Call to start the main menu
mainMenu();