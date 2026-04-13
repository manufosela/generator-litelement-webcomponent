"use strict";

import chalk from "chalk";

import Generator from "yeoman-generator";
import yosay from "yosay";
import path from "path";
import process from "child_process";
import nodeprocess from "node:process";
import { fileURLToPath } from "url";
import { readFileSync, writeFileSync } from "fs";

const whoami = process.execSync("whoami").toString().replace(/\n/, "");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class extends Generator {
  /** * AUXILIARY METHODS */
  installWC() {
    try {
      process.execSync("npm init @open-wc", { stdio: "inherit" });
      console.log("npm init @open-wc ejecutado correctamente.");
    } catch (error) {
      console.error("Error al ejecutar npm init @open-wc:", error.message);
    }
  }

  putIntoWCDirectory() {
    const dir = process
      .execSync("ls -t | head -n1")
      .toString()
      .replace(/\n/, "");
    console.log("\nDirectorio creado: " + dir);
    nodeprocess.chdir(dir);
  }

  getWCName() {
    const jsonPackage = JSON.parse(this.packageJsonContent);
    console.log("Nombre del webcomponent: " + jsonPackage.name);
    return jsonPackage.name;
  }

  updatePackageJsonInfo() {
    const regExp = new RegExp('"author": "' + this.props.wcname + '"', "gm");
    this.packageJsonContent = this.packageJsonContent.replace(
      regExp,
      '"author": "' + this.props.author + '"'
    );
    this.packageJsonContent = this.packageJsonContent.replace(
      /"license": "MIT"/gm,
      '"license": "' + this.props.license + '"'
    );
    this.packageJsonContent = this.packageJsonContent.replace(
      /"version": "0.0.0"/gm,
      '"version": "1.0.0"'
    );
    this.packageJsonContent = this.packageJsonContent.replace(
      /"main": "index.js"/gm,
      '"main": "' + this.props.wcname + '.js"'
    );
  }

  updateMoreInfoPackageJson() {
    const home = `  "home": "https://github.com/${this.props.author}/${this.props.wcname}"`;
    const repository = `  "repository": "git+https://github.com/${this.props.author}/${this.props.wcname}.git"`;
    const bugs = `  "bugs": "https://github.com/${this.props.author}/${this.props.wcname}/issues"`;

    this.packageJsonContent = this.packageJsonContent.replace(
      '"customElements": "custom-elements.json",',
      '"customElements": "custom-elements.json",\n' +
        home +
        ",\n" +
        repository +
        ",\n" +
        bugs +
        ","
    );
  }

  installNewPackageJson() {
    try {
      process.execSync("npm install", { stdio: "inherit" });
      console.log("Dependencias actualizadas correctamente.");
    } catch (error) {
      console.error("Error al actualizar las dependencias:", error.message);
    }
  }

  fixPackageJsonVulnerabilities() {
    try {
      process.execSync("npm audit fix", { stdio: "inherit" });
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

  replacePackageVersion(jsonString, jsonPackage, deps) {
    let jsonStringNew = jsonString;
    const depsName = Object.keys(jsonPackage[deps]);
    console.log(jsonPackage[deps]);
    depsName.forEach((depName) => {
      console.log("check version for " + depName);
      const npmCommand = `npm view ${depName} version`;
      const packageVersion = process
        .execSync(npmCommand)
        .toString()
        .replace(/\n/, "");
      const searched =
        '"' + depName + '": "' + jsonPackage[deps][depName] + '"';
      const replacedby = '"' + depName + '": "^' + packageVersion + '"';
      console.log("searched: " + searched);
      console.log("replacedby: " + replacedby);
      jsonStringNew = jsonStringNew.replace(searched, replacedby);
    });
    return jsonStringNew;
  }

  updateDependenciesVersions() {
    const jsonPackageParsed = JSON.parse(this.packageJsonContent);
    let jsonStringNew = this.replacePackageVersion(
      this.packageJsonContent,
      jsonPackageParsed,
      "dependencies"
    );
    jsonStringNew = this.replacePackageVersion(
      this.packageJsonContent,
      jsonPackageParsed,
      "devDependencies"
    );

    return jsonStringNew;
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
        this.packageJsonContent = readFileSync("package.json", "utf8");

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
        writeFileSync("package.json", this.packageJsonContent, "utf8");

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
        const directorioWC = nodeprocess.cwd();

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
        nodeprocess.exit(0);
      }
    });
  }
}
