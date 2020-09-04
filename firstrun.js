const fs = require("fs");
const chalk = require("chalk");

var data = JSON.stringify({
    username: "",
    password: ""
})

if (fs.existsSync("config.json")) {
    fs.unlinkSync("config.json")
}

fs.appendFileSync("config.json", data);
console.log(chalk.green("success! please continue the instructions left in the instascrape readme to continue"))