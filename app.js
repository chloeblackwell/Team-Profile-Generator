const Manager = require("./lib/Manager");
const Engineer = require("./lib/Engineer");
const Intern = require("./lib/Intern");
const inquirer = require("inquirer");
const path = require("path");
const fs = require("fs");

const OUTPUT_DIR = path.resolve(__dirname, "output");
const outputPath = path.join(OUTPUT_DIR, "team.html");

const render = require("./lib/htmlRenderer");
const Employee = require("./lib/Employee");



// Write code to use inquirer to gather information about the development team members,
// and to create objects for each team member (using the correct classes as blueprints!)

const userQuestions = [
    {
        type: "list",
        name: "role",
        message: "What is your role?",
        choices: ["Manager", "Engineer", "Intern"]
    },
    {
        type: "input",
        name: "name",
        message: "What is your name?",
    },
    {
        type: "input",
        name: "id",
        message: "What is your Employee ID?",
    },
    {
        type: "input",
        name: "email",
        message: "What is your email?",
    },
    {
        type: "input",
        name: "officeNumber",
        message: "What is your office number?",
        when: function (response) {
            return response.role === "Manager";
        },
    },
    {
        type: "input",
        name: "school",
        message: "Which school do you go to?",
        when: function (response) {
            return response.role === "Intern";
        },
    },
    {
        type: "input",
        name: "github",
        message: "What is your username for GitHub?",
        when: function (response) {
            return response.role === "Engineer";
        },
    },
    {
        type: "confirm",
        message: "Would you like to add another member?",
        default: true,
        name: "addTeamMembers"
    }
];

async function teamMembers(teamMemberInput = []) {
    try {
        const { addTeamMembers, ...response } = await inquirer.prompt(userQuestions);
        const newEmployee = [...teamMemberInput, response];
        return addTeamMembers ? teamMembers(newEmployee) : newEmployee
    } catch (err) {
        throw err;
    }
}

async function renderFile() {
    try {
        const employees = [];
        const teamMemberData = await teamMembers();

        teamMemberData.map((employee) => {
            const { name, id, email, role, officeNumber, school, github } = employee;

            if (role === "Manager") {
                const newManager = new Manager(name, id, email, officeNumber);
                employees.push(newManager);
            } else if (role === "Engineer") {
                const newEngineer = new Engineer(name, id, email, github);
                employees.push(newEngineer);
            } else {
                const newIntern = new Intern(name, id, email, school);
                employees.push(newIntern);
            }
        });

        const renderEmployee = render(employees);
        fs.writeFile(outputPath, renderEmployee, () => console.log("Your file was created successfully!"));
    } catch (err) {
        throw new Error(err);
    }
}

renderFile();


