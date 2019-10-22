'use strict';

process.env.NODE_ENV = 'development';

/* eslint-disable import/no-extraneous-dependencies */
const fs = require('fs-extra');
const path = require('path');
const webpack = require('webpack');
const { spawn } = require('child_process');

const webpackConfig = require('react-scripts/config/webpack.config.js');
const paths = require('react-scripts/config/paths');

function log(msg) {
  console.info(msg);
}

function getConfiguration(defaultConfig) {
  const { entry, plugins } = defaultConfig;
  const { ...retVal } = defaultConfig;

  retVal.entry = entry.filter(fileName => !fileName.match(/webpackHotDevClient/));
  retVal.plugins = plugins.filter(plugin => !(plugin instanceof webpack.HotModuleReplacementPlugin));

  retVal.output.path = paths.appBuild;
  retVal.output.publicPath = '';
  retVal.output.filename = 'js/bundle.js';
  retVal.output.chunkFilename = 'js/[name].chunk.js';

  const oneOfRule = 2;
  const images = 0;
  const assets = 7;

  retVal.module.rules[oneOfRule].oneOf[images].options.name = 'media/[name].[hash:8].[ext]';
  retVal.module.rules[oneOfRule].oneOf[assets].options.name = 'media/[name].[hash:8].[ext]';

  return retVal;
}

function cleanupTargetFolder() {
  log('cleaning target folder');

  return fs.emptyDir(paths.appBuild);
}

function webpackWatch(config) {
  log('starting webpackCompiler watch');

  return new Promise((resolve, reject) => {
    const webpackCompiler = webpack(config);

    webpackCompiler.watch({}, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function copyPublicFolder() {
  log('copying output files to public folder');

  return fs.copy(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: file => file !== paths.appHtml,
  });
}

function runProcess(processPath, args) {
  let invoked = false;

  return new Promise((resolve, reject) => {
    const process = spawn(processPath, args, { shell: true });
    process.on('error', err => {
      if (invoked) return;

      invoked = true;
      err ? reject(err) : resolve();
    });

    process.on('exit', (code, signal) => {
      if (invoked) return;

      invoked = true;

      const err = code === 0 ? null : new Error(`application finished with exit code: ${code} and signal ${signal}`);
      err ? reject(err) : resolve();
    });
  });
}

async function buildElectron() {
  log('building electron');

  const babelCli = path.join(__dirname, './node_modules/.bin/babel.cmd');
  const babelArg = ['./src/electron/app.js', '-o ./build/app.js', '--source-map', '--presets=@babel/env'];

  try {
    await runProcess(babelCli, babelArg);
    return await fs.copyFile('./src/package.json', './build/package.json');
  } catch (err) {
    return console.error(err);
  }
}

async function runApp() {
  log('running application');

  const electron = path.join(__dirname, './node_modules/.bin/electron.cmd');
  const args = ['./build', '--debug'];

  await runProcess(electron, args);
}

async function watchApp() {
  const defaultConfig = webpackConfig('development');
  const config = getConfiguration(defaultConfig);

  await cleanupTargetFolder();
  await webpackWatch(config);
  await copyPublicFolder();
  await buildElectron();
  await runApp();
}

try {
  watchApp();
} catch (error) {
  console.error(error);
}

// console.info('Compiling application');
// watchApp()
//   .then(() => {
//     console.info('Building Electron');

//     return buildElectron();
//   })
//   .then(() => {
//     console.info('Running application');

//     return runApp();
//   })
//   .catch(err => console.error(err));
