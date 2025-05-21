#! /usr/bin/env node
import { exec } from "child_process";
import * as fs from "fs";
import { argv } from "process";
import { parseArgs, ParseArgsConfig } from "util";
import Papa from "papaparse";
import chalk from "chalk";
import { MctIgnore } from "./mct_ignore.js";
import picomatch from "picomatch";

type Output = {
    Test: string;
    TestId: number;
    Type: string;
    Item: string|undefined;
    Message: string;
    Data: number|undefined;
    Path: string|undefined;
}

const config: ParseArgsConfig = {
    args: argv,
    allowPositionals: true,
    options: {
        input: {
            type: "string",
            short: "i",
        },
        verbose: {
            type: "boolean",
            short: "v",
        }
    }
};

const {values} = parseArgs(config);
if (typeof values.input !== "string") {
    console.error("No input file provided");
    process.exit(1);
}

const path: string = values.input;
if (!fs.statSync(path).isDirectory()) {
    console.error("Input path is not a directory");
    process.exit(1);
}

const ignore: MctIgnore = fs.existsSync("./.mctignore") ? JSON.parse(String(fs.readFileSync("./.mctignore"))) : [];

exec(`mct validate all -i ${path}`, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error executing mct validate: ${error.message}`);
        return;
    }

    const result = Papa.parse<Output>(String(fs.readFileSync(`./out/${path}.csv`)).replace("\r", ""), {
        header: true,
        newline: "\n",
        dynamicTyping: true,
    });

    const errors: Output[] = result.data.filter((element) => element.Type === "Error" && !shouldIgnore(element, ignore));
    const warnings: Output[] = result.data.filter((element) => element.Type === "Warning" && !shouldIgnore(element, ignore));
    const recommendations: Output[] = result.data.filter((element) => element.Type === "Recommendation" && !shouldIgnore(element, ignore));

    if (recommendations.length && values.verbose) {
        recommendations.forEach(element => console.log(`[Recommendation] ${element.Test} ${element.Message} ${element.Path}`));
    }

    if (warnings.length) {
        warnings.forEach(element => console.warn(chalk.yellow(`[Warning] ${element.Test} ${element.Message} ${element.Path}`)));
    }

    if (errors.length) {
        errors.forEach(element => console.error(chalk.red(`[Error] ${element.Test} ${element.Message} ${element.Path}`)));
        process.exit(1);
    }
});

function shouldIgnore(element: Output, ignore: MctIgnore): boolean {
    for (const pattern of ignore) {
        if (pattern.category !== element.Test) continue;

        const regex = picomatch.toRegex(picomatch.parse(pattern.path).output);

        if (regex.test(element.Path || "")) {
            if (values.verbose) {
                console.log(chalk.gray(`[Ignore] ${element.Test} ${element.Message} ${element.Path} due to ${pattern.description}`));
            }

            return true;
        }
    }

    return false;
}