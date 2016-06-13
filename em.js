"use strict";

let fs     = require( 'fs' );
let path   = require( 'path' );
let rimraf = require( 'rimraf' );
let util   = require( './lib/util' );
let vorpal = require( 'vorpal' )();

let commands = {};

const COMMANDS_DIR = './commands',
      DELIMITER    = 'em$';

function setup() {
    vorpal.em = {};

    vorpal.em.cacheDir  = __dirname + '/cache';
    vorpal.em.configDir = __dirname + '/config';

    clearCache();
}

function clearCache() {
    try {
        rimraf.sync( vorpal.em.cacheDir + '/*' );
        vorpal.log( 'Cleared cache.' );
    } catch ( error ) {
        vorpal.log( `ERROR clearing cache: ${error}` );

        process.exit(1);
    }
}

function loadCommands( commandsDir ) {
    fs.readdirSync( commandsDir ).forEach(
        function ( file ) {
            let fullpath    = path.join( commandsDir, file );
            let commandName = path.basename( fullpath );

            if ( fs.statSync( fullpath ).isDirectory() ) {
                // Without the './' get:
                //     "Error: Cannot find module 'commands/content'"
                const mod = require( './' + fullpath );
                commands[ commandName ] = vorpal.use( mod );
            }
        }
    );
}

setup();

loadCommands( COMMANDS_DIR );

// Set the prompt
vorpal.delimiter( DELIMITER );

if ( process.argv.length > 2 ) {
    // Process command immediately
    vorpal.parse( process.argv );
} else {
    // Enter interactive shell
    vorpal
        .show();
}
