"use strict";

import chalk from "chalk";

import Generator from "yeoman-generator";
import yosay from "yosay";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readFileSync, writeFileSync } from "node:fs";

const whoami = execSync("whoami").toString().replace(/\n/, "");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class extends Generator {
  /** * AUXILIARY METHODS */
  installWC() {
    try {
      execSync("npm init @open-wc", { stdio: "inherit" });
      console.log("npm init @open-wc ejecutado correctamente.");
    } catch (error) {
      console.error("Error al ejecutar npm init @open-wc:", error.message);
    }
  }

  putIntoWCDirectory() {
    const dir = execSync("ls -t | head -n1").toString().replace(/\n/, "");
    console.log("\nDirectorio creado: " + dir);
    process.chdir(dir);
  }

  getWCName() {
    console.log("Nombre del webcomponent: " + this.packageJson.name);
    return this.packageJson.name;
  }

  updatePackageJsonInfo() {
    this.packageJson.author = this.props.author;
    this.packageJson.license = this.props.license;
    this.packageJson.version = "1.0.0";
    this.packageJson.main = `${this.props.wcname}.js`;
  }

  updateMoreInfoPackageJson() {
    const repoBase = `https://github.com/${this.props.author}/${this.props.wcname}`;
    this.packageJson.home = repoBase;
    this.packageJson.repository = `git+${repoBase}.git`;
    this.packageJson.bugs = `${repoBase}/issues`;
  }

  installNewPackageJson() {
    try {
      execSync("npm install", { stdio: "inherit" });
      console.log("Dependencias actualizadas correctamente.");
    } catch (error) {
      console.error("Error al actualizar las dependencias:", error.message);
    }
  }

  fixPackageJsonVulnerabilities() {
    try {
      execSync("npm audit fix", { stdio: "inherit" });
      console.log("Vulnerabilidades arregladas correctamente.");
    } catch (error) {
      console.error("Error al arreglar las vulnerabilidades:", error.message);
    }
  }

  getWCClassName(wcname) {
    return wcname
      .split("-")
      .map((part) => {
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join("");
  }

  generateWCStyleFile(directorioWC) {
    const WCClassName = this.props.WCClassName;
    console.log(`Generando ${WCClassName}Style.js...`);
    let content = readFileSync(
      path.join(__dirname, "templates", "src", "wc-name-style.js"),
      "utf8"
    );
    let WCStylesFilename = WCClassName + "Styles.js";
    let goodContent = content.replace(/wcName/gm, WCClassName);
    writeFileSync(
      path.join(directorioWC, "src", WCStylesFilename),
      goodContent
    );
  }

  updateWCStyleFile(directorioWC) {
    const WCFilename = this.props.WCClassName + ".js";
    const WCStylesFilename = this.props.WCClassName + "Styles.js";

    let WCFileContent = readFileSync(
      path.join(directorioWC, "src", WCFilename),
      "utf8"
    );
    const pattern = /static styles = css`[^`]*`;/g;
    WCFileContent = WCFileContent.replace(
      pattern,
      "static styles = [" + this.props.WCClassName + "Styles];"
    );
    WCFileContent = WCFileContent.replace(
      "import { html, css, LitElement } from 'lit';",
      "import { html, LitElement } from 'lit';\nimport { " +
        this.props.WCClassName +
        "Styles } from './" +
        WCStylesFilename +
        "';"
    );
    writeFileSync(path.join(directorioWC, "src", WCFilename), WCFileContent);
  }

  updateLicenseFile(directorioWC) {
    const licenseContent = readFileSync(
      path.join(
        __dirname,
        "templates",
        "LICENSE_" + this.props.license.toUpperCase() + ".md"
      ),
      "utf8"
    );
    writeFileSync(path.join(directorioWC, "LICENSE"), licenseContent);
  }

  replacePackageVersion(deps) {
    const depsMap = this.packageJson[deps];
    if (!depsMap) {
      return;
    }
    console.log(depsMap);
    Object.keys(depsMap).forEach((depName) => {
      console.log("check version for " + depName);
      const npmCommand = `npm view ${depName} version`;
      const packageVersion = execSync(npmCommand).toString().replace(/\n/, "");
      const newValue = "^" + packageVersion;
      console.log(`${depName}: ${depsMap[depName]} -> ${newValue}`);
      depsMap[depName] = newValue;
    });
  }

  updateDependenciesVersions() {
    this.replacePackageVersion("dependencies");
    this.replacePackageVersion("devDependencies");
  }

  /** * MAIN METHODS */
  prompting() {
    this.log(
      yosay(`Welcome to the ${chalk.red("Lit-base")} generator (v1.3.8)!`)
    );

    const prompts = [
      {
        type: "input",
        name: "author",
        message: "Github user or author's name",
        default: whoami,
      },
      {
        type: "input",
        name: "license",
        message: "LICENSE (MIT, Apache-2.0, ISC, GPL-3.0)",
        default: "Apache-2.0",
      },
      {
        type: "confirm",
        name: "start",
        message: "Would you like to create a Lit webcomponent?",
        default: false,
      },
    ];

    return this.prompt(prompts).then((props) => {
      // To access props later use this.props.someAnswer;
      this.props = props;

      if (this.props.start) {
        /* Instalar el paquete npm init @open-wc para crear el web-component base */
        console.log("1.- Install WC");
        this.installWC();

        /* Leer el directorio actual el directorio creado mas recientemente y entrar en él */
        console.log("2.- Move to WC directory");
        this.putIntoWCDirectory();

        /* Leer el fichero package.json */
        console.log("3.- Read package.json");
        this.packageJson = JSON.parse(
          readFileSync("package.json", "utf8")
        );

        /* Leer el fichero package.json y extraer el nombre del webcomponent de la propiedad name */
        console.log("4.- Get WC name from package.json");
        this.props.wcname = this.getWCName(this);

        /* Actualizar datos de package.json */
        console.log("5.- Update package.json information");
        this.updatePackageJsonInfo();

        /* Actualizar las versiones de las dependencias */
        console.log("6.- Update dependencies versions");
        this.updateDependenciesVersions();

        /* Añadir las referencias a home, repositorio y bugs */
        console.log("7.- Update more info of package.json");
        this.updateMoreInfoPackageJson();

        /* Escribir el neuvo fichero package.json */
        console.log("8.- Write new package.json");
        writeFileSync(
          "package.json",
          JSON.stringify(this.packageJson, null, 2) + "\n",
          "utf8"
        );

        /* Arreglar posibles vulnerabilidades del package.json */
        console.log("9.- Fix package.json vulnerabilities");
        this.fixPackageJsonVulnerabilities();

        /* Instalar las dependencias */
        console.log("10.- Install new package.json");
        this.installNewPackageJson();

        /* Generar nombre del webcomponent en camelCase */
        console.log("11.- Get WCClassName");
        this.props.WCClassName = this.getWCClassName(this.props.wcname);

        /* Obtener directorio de trabajo del script */
        console.log("12.- Get working directory");
        const directorioWC = process.cwd();

        /* Generar fichero src/wc-name-style.js */
        console.log("13.- Generate WCStyleFile from template");
        this.generateWCStyleFile(directorioWC);

        /* Insertar el fichero src/wc-name-style.js en el fichero src/wc-name.js */
        console.log("14.- Update WCStyleFile");
        this.updateWCStyleFile(directorioWC);

        /* Modificar el fichero LICENSE con la licencia seleccionada */
        console.log("15.- Update LICENSE file");
        this.updateLicenseFile(directorioWC);
      } else {
        this.log(
          "\n\n* * *   STOPED Generator Lit Element Base by User   * * *\n"
        );
        process.exit(0);
      }
    });
  }
}
