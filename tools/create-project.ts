import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import * as colors from 'colors/safe';

import { getLastTwoArguments } from './utils';

class InvalidCreateProjectArguments extends Error {
  public message = colors.red(`
    You have to run command using appropriate format:
    "yarn create-project --name $PROJECT_NAME"
  `);
}

function createProject() {
  const [argument, projectName] = getLastTwoArguments<string, string>();

  if (argument !== '--name' || typeof projectName !== 'string') {
    throw new InvalidCreateProjectArguments();
  }

  const filesToUpdate = ['package.json', 'angular.json', 'src/package.json'];

  for (const file of filesToUpdate) {
    const path = join(__dirname, '..', file);
    const content = readFileSync(path).toString();
    writeFileSync(path, content.replace(/skeleton/g, projectName));
  }
}

createProject();
