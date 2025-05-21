# MCTools Validator Wrapper
This is a simple wrapper for [Mojang's Minecraft Creator Tools](https://www.npmjs.com/package/@minecraft/creator-tools). The `mct` command-line tool returns many false-postive errors that make it difficult to integrate into a CI/CD workflow as you need to either supress broad categories of errors, or accept that all pull requests are going to incorrectly flag as broken. This wrapper solves that issue by reading a JSON file `.mctignore` at your project root that provides more detailed information about what types of errors to ignore for specific files, then running `npx mct` and parsing the output to ignore the pre-defined errors.

## Installation
Add to your project with
```
npm install mct_validator
```

## VSCode Setup
1. Configure a schema for the `.mctignore` file. The `.vscode` directory in this project is set up as an example.
2. Add your `.mctignore` file to the project root, an example file may look like this:
```json
[
    {
        "category": "SHARING",
        "path": "*.texture_set.json",
        "description": "Ignore Vibrant Visuals Error"
    },
    {
        "category": "UNLINK",
        "path": "*.png",
        "description": "Ignore unused images as they are used in JavaScript files"
    }
]
```
That's all the required setup to run locally.

## GitHub Actions
If you are setting up the wrapper to use within a GitHub action, you can use the following workflow as a starting point:
`.github/workflows/pull_request.yml`
```yml
name: Run Tests

on:
    pull_request:
        branches:
            - 'main'

jobs:
    validate:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - name: Use Node.js
              uses: actions/setup-node@v4
              with:
                node-version: '20.x'
            - name: Prepare Directory
              run: |
                mkdir dist
                mv Content dist
                mv "Marketing Art" dist
                mv "Store Art" dist
            - name: Validate Project
              run: |
                npx mct_validator --verbose --input ./dist
```
Running `mct` requires that the validated directory has only the `Content`, `Marketing Art` and `Store Art` directories. In this example we use a few simple commands to create a `dist` containing only those directories and validate it. You may create the `dist` another way depending on your development environment.
