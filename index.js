const fs = require('fs');
const path = require('path');
const setting = require('./setting.json');
const core = require('@node-minify/core');
const htmlMinifier = require('@node-minify/html-minifier');
const uglifyJs = require('@node-minify/uglify-js');
const cleanCss = require('@node-minify/clean-css');


const walkdir = (_dir) => {
  const filepathList = [];
  for (const _ of fs.readdirSync(_dir)) {
    const itemPath = path.join(_dir, _);
    const isDir = fs.statSync(itemPath).isDirectory();
    if (isDir) filepathList.push(...walkdir(itemPath));
    else filepathList.push(itemPath);
  };
  return filepathList;
}

const getCompressor = (filepath) => {
  const extname = path.extname(filepath).toLowerCase();
  for (const ext in setting.extnames) {
    if (setting.extnames[ext].indexOf(extname) != -1) {
      switch (ext) {
        case 'js':
          return uglifyJs;
        case 'css':
          return cleanCss;
        case 'html':
          return htmlMinifier;
      }
    }
  }
  return false;
}

for (const inputFilepath of walkdir(setting.input_path)) {
  const outputFilepath = inputFilepath.replace(setting.input_path, setting.output_path);
  const compressor = getCompressor(inputFilepath);
  const outputFileDir = path.dirname(outputFilepath);
  if (!fs.existsSync(outputFileDir)) fs.mkdirSync(outputFileDir, {force: true, recursive: true});
  if (compressor) {
    core({
      compressor: compressor,
      input: inputFilepath,
      output: outputFilepath,
      callback: (err, min) => {
        if (err) throw err;
        console.log(`minified: ${inputFilepath}`);
      }
    });
  } else {
    fs.copyFile(inputFilepath, outputFilepath, (err) => {
      if (err) throw err;
      console.log(`copied file: ${outputFilepath}`);
    });
  }
}