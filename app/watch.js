'use strict';

process.env.NODE_ENV = 'development'; // eslint-disable-line no-process-env

/* eslint-disable import/no-extraneous-dependencies */
const fs = require('fs-extra');
const path = require('path');
const webpack = require('webpack');
const ora = require('ora');
const { spawn } = require('child_process');

const webpackConfig = require('react-scripts/config/webpack.config.js');
const paths = require('react-scripts/config/paths');

function configure(config) {
  const { entry, plugins } = config;

  /* eslint-disable no-param-reassign */
  config.entry = entry.filter(fileName => !fileName.match(/webpackHotDevClient/));
  config.plugins = plugins.filter(plugin => !(plugin instanceof webpack.HotModuleReplacementPlugin));

  config.output.path = paths.appBuild;
  config.output.publicPath = '';
  config.output.filename = 'js/bundle.js';
  config.output.chunkFilename = 'js/[name].chunk.js';

  const oneOfRule = 2;
  const images = 0;
  const assets = 7;

  config.module.rules[oneOfRule].oneOf[images].options.name = 'media/[name].[hash:8].[ext]';
  config.module.rules[oneOfRule].oneOf[assets].options.name = 'media/[name].[hash:8].[ext]';

  /* eslint-enable no-param-reassign */
}

function cleanupTargetFolder() {
  return fs.emptyDir(paths.appBuild);
}

function webpackWatch(config) {
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
  return fs.copy(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: file => file !== paths.appHtml,
  });
}

function watchApp() {
  const config = webpackConfig('development');
  configure(config);

  return cleanupTargetFolder()
    .then(() => webpackWatch(config))
    .then(() => copyPublicFolder());
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

function buildElectron() {
  const babelCli = path.join(__dirname, './node_modules/.bin/babel.cmd');
  const babelArg = ['./src/electron/app.js', '-o ./build/app.js', '--source-map', '--presets=@babel/env'];

  return runProcess(babelCli, babelArg).then(() => fs.copyFile('./src/package.json', './build/package.json'), err => console.error(err));
}

function runApp() {
  const electron = path.join(__dirname, './node_modules/.bin/electron.cmd');
  const args = ['./build', '--debug'];

  runProcess(electron, args);
}

console.info('Compiling application');
watchApp()
  .then(() => {
    console.info('Building Electron');

    return buildElectron();
  })
  .then(() => {
    console.info('Running application');

    return runApp();
  })
  .catch(err => console.error(err));
