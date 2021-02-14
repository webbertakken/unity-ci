import path from 'path';
import { writeFileSync } from 'fs';
import { set } from 'lodash';
import { normaliseTitle, replaceAll } from '../text';

export const menuVersionBranch = '<versions>';
export const versionPartRegex = /^v?\d+(\.\d+)*$/;

export default function generateMenuStructureFromFiles(fileNames: string[]) {
  // eslint-disable-next-line no-console
  console.log('event - generating menu structure');

  const documentationStructure = {};

  for (const name of fileNames) {
    const fileName = name.replace(/\.md$/, '');
    const parts = fileName.split('/');

    const [topLevelFolder, ...otherParts] = parts;

    let key = topLevelFolder;
    let lastPart: string = otherParts.join();
    for (const rawPart of otherParts) {
      // Sanitise to use as lodash set key
      const part = replaceAll(rawPart, '.', '-');
      // Make version parts identifiable
      const isVersionPart = versionPartRegex.test(rawPart);
      if (isVersionPart) {
        set(documentationStructure, `${key}.${menuVersionBranch}.meta`, {
          section: key,
          // Note, this will overwrite v1 with v2 and so on, as directory is read alphabetically.
          currentVersion: part,
        });
      }
      key += isVersionPart ? `.${menuVersionBranch}.${part}` : `.${part}`;
      lastPart = part;
    }

    set(documentationStructure, key, {
      key: fileName,
      name: normaliseTitle(lastPart),
    });
  }

  const menuStructure = `${JSON.stringify({ docs: documentationStructure }, null, 2)}\n`;
  writeFileSync(path.resolve('core/menu-structure.json'), menuStructure, { encoding: 'utf8' });
}
