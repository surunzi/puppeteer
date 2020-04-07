const fs = require('fs');
const path = require('path');

const file = process.argv.slice(2)[0];

const filePath = path.resolve(path.join(__dirname, file));
console.log(filePath);

const contents = fs.readFileSync(filePath, {encoding: 'utf8'});

const regex = /async\({(.+)}\) => {/g;

const newContents = contents.replace(regex, (match, group1) => {
  console.log('here', group1);

  const replacementLines = `async() => {
    const { ${group1} } = getTestState();
  `;
  return replacementLines;
});

fs.writeFileSync(filePath, newContents, { encoding: 'utf8'});
