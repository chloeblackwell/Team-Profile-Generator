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


// Validation for email and ID's 
let usedIDs = [];
let suggestId = 123;
const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const idValidator = async (input) => {
    if (/[^0-9]/.test(input)) {
        return 'Please enter a number.'
    } else {
        for (let i = 0; i < usedIDs.length; i++) {
            if (input === usedIDs[i]) {
                return 'This ID is already taken. Please use a unique ID.';
            }
        }
        usedIDs.push(input);
        suggestId++;

        return true;
    }
};

const emailValidator = async (input) => {
    return emailRegEx.test(input) ? true : 'Please enter a valid email address';
}

// User Input questions 
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
        validate: idValidator,
    },
    {
        type: "input",
        name: "email",
        message: "What is your email?",
        validate: emailValidator,
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
        message: "Would you like to add another team member?",
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

// Render the HTML file 
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


