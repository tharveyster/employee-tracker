INSERT INTO department (name)
VALUES ("Sales"),
       ("Engineering"),
       ("Finance"),
       ("Legal");

INSERT INTO role (title, salary, department_id)
VALUES ("Sales Manager", 130000.00, 1)
       ("Salesperson", 80000.00, 1),
       ("Lead Engineer", 150000.00, 2),
       ("Software Engineer", 120000.00, 2),
       ("Account Manager", 160000.00, 3),
       ("Accountant" 125000.00, 3),
       ("Legal Team Lead", 250000.00, 4),
       ("Lawyer", 190000.00, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Marge", "Simpson", 1,),
       ("Homer", "Simpson", 2, 1),
       ("Apu", "Nahasapeemapetilon", 2, 1),
       ("Patty", "Bouvier", 2, 1),
       ("Lisa", "Simpson", 3,),
       ("Bart", "Simpson", 4, 3),
       ("Maggie", "Simpson", 4, 3),
       ("Tony", "D\'Amico", 5,),
       ("Selma", "Bouvier", 6, 5),
       ("Dan", "Gillick", 6, 5),
       ("Luvum", "Burnham", 7,),
       ("Lionel", "Hutz", 8, 7);