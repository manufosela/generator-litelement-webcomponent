"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");
const path = require("path");
const process = require('child_process');

const pwd = process.execSync("pwd").toString();
const whoami = process.execSync("whoami").toString();
const dirname = pwd.split("/").pop();
const wcn = dirname.toLowerCase();

module.exports = class extends Generator {
  prompting() {
    this.log(
      yosay(
        `Welcome to the ${chalk.red("lit-element-base")} generator (v1.3.2)!`
      )
    );

    const prompts = [
      {
        type: "input",
        name: "wcname",
        message: "Lit-Element webcomponent name (in kebab-case)",
        default: wcn,
        validate: input => {
          return Boolean(input.match(/-/));
        }
      },
      {
        type: "input",
        name: "author",
        message: "Author of web component?",
        default: whoami
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
      this.props.wcname = this.props.wcname.toLowerCase().replace(/\n/, "");
      const { readFileSync, writeFileSync, mkdirSync } = require("fs");
      const { join } = require("path");
      try {
        const { execSync } = require("child_process");
        execSync("rm -rf " + path.join(__dirname, "output"));
      } catch (e) {}
      mkdirSync(join(__dirname, "output"));
      mkdirSync(join(__dirname, "output", "demo"));

      const filenames = [
        "wc-name.js",
        "index.html",
        "demo/index.html",
        "package.json",
        "rollup.config.js",
        "LICENSE",
        "README.md"
      ];
      const propCamelCase = this.props.wcname
        .split("-")
        .map(part => {
          return part.charAt(0).toUpperCase() + part.slice(1);
        })
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
        goodContent = goodContent.replace(/WcName/gm, propCamelCase);
        goodContent = goodContent.replace(/"user"/gm, whoami);
        writeFileSync(join(__dirname, "output", filename), goodContent);

        /** FILE package.json */
        let packageContent = readFileSync(
          join(__dirname, "templates", "package.json"),
          "utf8"
        );
        let goodContent2 = packageContent.replace(/user/gm, whoami);
        goodContent2 = goodContent2.replace(/wc-name/gm, this.props.wcname);
        writeFileSync(join(__dirname, "output", "package.json"), goodContent2);

        /** FILE README.md */
        let readmeContent = readFileSync(
          join(__dirname, "templates", "README.md"),
          "utf8"
        );
        let goodContent3 = readmeContent.replace(
          /wc-name/gm,
          this.props.wcname
        );
        writeFileSync(join(__dirname, "output", "README.md"), goodContent3);
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
    this.fs.copy(
      this.templatePath(join(__dirname, "output", "rollup.config.js")),
      this.destinationPath("rollup.config.js")
    );
    this.fs.copy(
      this.templatePath(join(__dirname, "output", "LICENSE")),
      this.destinationPath("LICENSE")
    );
    this.fs.copy(
      this.templatePath(join(__dirname, "output", "README.md")),
      this.destinationPath("README.md")
    );
    this.fs.copy(
      this.templatePath(join(__dirname, "templates", "babel.config.js")),
      this.destinationPath("babel.config.js")
    );
    this.fs.copy(
      this.templatePath(join(__dirname, "templates", "gitignorefile")),
      this.destinationPath(".gitignore")
    );
  }

  install() {
    this.npmInstall();
  }
};
