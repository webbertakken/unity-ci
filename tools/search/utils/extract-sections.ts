import { cloneDeep } from 'lodash';

const determineLevel = (line) => {
  for (let level = 0; level <= 5; level += 1) {
    const char = line[level];
    if (char !== '#') {
      return level;
    }
  }

  return null;
};

const extractTitle = (line) => {
  if (!line) {
    // eslint-disable-next-line no-console
    console.log('\u001B[33m%s\u001B[0m  - %s', 'warn', 'Unable to extract title from', line);
    return '';
  }

  if (typeof line !== 'string') {
    // eslint-disable-next-line no-console
    console.error(
      `Expected heading to consist of a string. That way we can easily use them as anchors.
      The following does not adhere to this rule: "${JSON.stringify(line, null, 2)}"`,
    );
  }

  return line.replace(/^[\s#]*/, '').trim();
};

export const extractAnchorId = (line) => {
  return extractTitle(line).toLowerCase().split(' ').join('-');
};

const forceSingleLine = (content) => {
  // One space for each newline
  return content.replace(/\n/, ' ');
};

const extractSummary = (rawContent, maxLength = 100) => {
  const content = forceSingleLine(rawContent);

  if (content.length <= maxLength) {
    return content;
  }

  return `${content.slice(0, Math.min(content.length, maxLength - 3))}...`;
};

const isHeading = (line) => {
  return line.startsWith('#');
};

const parseLine = (line) => {
  return line;
};

const finalisePreviousSection = (section) => {
  const content = section.content.trimLeft('\n').trimRight('\n');

  const finalisedSection = cloneDeep(section);
  finalisedSection.content = content || '(empty)';
  finalisedSection.summary = extractSummary(content);

  return finalisedSection;
};

const createSectionCreator = (meta) => {
  return (line) => {
    const { path, version } = meta;

    return {
      title: extractTitle(line),
      level: determineLevel(line),
      path,
      version,
      anchorId: extractAnchorId(line),
      content: '',
    };
  };
};

export default function extractSections(meta, contents) {
  const createNewSectionFromLine = createSectionCreator(meta);
  const lines = contents.split('\n');
  const sections = [];

  let section;
  let skippedLines = 0;
  for (const line of lines) {
    if (isHeading(line)) {
      if (section) {
        sections.push(finalisePreviousSection(section));
      }

      section = createNewSectionFromLine(line);
      continue;
    }

    if (section) {
      section.content += `\n${parseLine(line)}`;
      continue;
    }

    skippedLines += 1;
  }

  if (section) {
    sections.push(finalisePreviousSection(section));
  }

  if (skippedLines >= 1) {
    // eslint-disable-next-line no-console
    console.log(`Skipped ${skippedLines} lines that occurred before any title`);
  }

  return sections;
}
