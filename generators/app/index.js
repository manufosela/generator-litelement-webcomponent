'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(
        `Welcome to the ${chalk.red("generator-lit-element-base")} generator!`
      )
    );

    const prompts = [
      {
        type: "input",
        name: "wcname",
        message: "Lit-Element webcomponent name (in kebab-case)",
        default: "wc-name",
        validate: input => {
          return Boolean(input.match(/-/));
        }
      },
      {
        type: "confirm",
        name: "start",
        message: "Would you like to create a lit-element webcomponent?",
        default: false
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
      this.props.wcname = this.props.wcname.toLowerCase();
      const { readFileSync, writeFileSync, mkdirSync } = require("fs");
      const { join } = require("path");
      try {
        const { execSync } = require("child_process");
        execSync("rm -rf " + __dirname + "/output");
      } catch (e) {}
      mkdirSync(join(__dirname, "output"));
      mkdirSync(join(__dirname, "output", "demo"));

      const filenames = [
        "wc-name.js",
        "index.html",
        "demo/index.html",
        "package.json"
      ];
      const propCamelCase = this.props.wcname
        .split("-")
        .map(e => e.replace(e[0], e[0].toUpperCase()))
        .join("");
      filenames.forEach(filename => {
        let content = readFileSync(
          join(__dirname, "templates", filename),
          "utf8"
        );
        let goodContent = content.replace(/wc-name/gm, this.props.wcname);
        goodContent = goodContent.replace(/WcName/gm, propCamelCase);
        if (filename === "wc-name.js") {
          filename = this.props.wcname + ".js";
        }
        writeFileSync(join(__dirname, "output", filename), goodContent);
      });
    });
  }

  writing() {
    const { join } = require("path");
    this.fs.copy(
      this.templatePath(join(__dirname, "output", this.props.wcname + ".js")),
      this.destinationPath(this.props.wcname + ".js")
    );
    this.fs.copy(
      this.templatePath(join(__dirname, "output", "package.json")),
      this.destinationPath("package.json")
    );
    this.fs.copy(
      this.templatePath(join(__dirname, "output", "index.html")),
      this.destinationPath("index.html")
    );
    this.fs.copy(
      this.templatePath(join(__dirname, "output", "demo/index.html")),
      this.destinationPath("demo/index.html")
    );
  }

  install() {
    this.npmInstall();
  }
};
