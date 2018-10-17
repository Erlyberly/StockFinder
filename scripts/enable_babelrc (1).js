// Workaround for buggy transform of uninitialized class properties in react-scripts

const fs = require('fs');

const path = 'node_modules/react-scripts/config/webpack.config.dev.js';

fs.readFile(path, 'utf8', (error, data) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }

  let result = data.replace(/babelrc: false/g, 'babelrc: true');
  fs.writeFile(path, result, 'utf8', error => {
    if (error) {
      console.error(error);
      process.exit(1);
    }
  });
});
