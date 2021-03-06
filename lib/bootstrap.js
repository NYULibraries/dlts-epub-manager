"use strict";

const fs      = require( 'fs' );
const path    = require( 'path' );
const rimraf  = require( 'rimraf' );
const util    = require( './util' );
const vorpal  = require( 'vorpal' )();

const commands = {};

const COMMANDS_DIR = './commands',
      DELIMITER    = 'em$';

function setup() {
    vorpal.em = {};

    // Dependency injection
    vorpal.em.request = util.request;

    const rootDirectory = path.dirname( __dirname );

    vorpal.em.cacheDir         = rootDirectory + '/cache';
    vorpal.em.configDir        = rootDirectory + '/config';
    vorpal.em.configPrivateDir = rootDirectory + '/config-private';
    vorpal.em.rootDir          = rootDirectory;

    vorpal.em.clearCache = clearCache;

    clearCache();
}

function clearCache() {
    try {
        rimraf.sync( vorpal.em.cacheDir + '/*' );
    } catch ( error ) {
        vorpal.log( `ERROR clearing cache: ${error}` );

        process.exit(1);
    }
}

function loadCommands( commandsDir ) {
    fs.readdirSync( commandsDir ).forEach(
        function ( file ) {
            const fullpath    = path.join( commandsDir, file );
            const commandName = path.basename( fullpath );

            if ( fs.statSync( fullpath ).isDirectory() ) {
                // Without the '../' get:
                //     "Error: Cannot find module 'commands/content'"
                const mod = require( '../' + fullpath );
                commands[ commandName ] = vorpal.use( mod );
            }
        }
    );
}

setup();

loadCommands( COMMANDS_DIR );

// Set the prompt
vorpal.delimiter( DELIMITER );

module.exports = {
    vorpal
};
