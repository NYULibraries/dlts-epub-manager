"use strict";

let fs     = require( 'fs' );
let path   = require( 'path' );
let util   = require( 'util' );
let vorpal = require( 'vorpal' )();

let commands = {};

const COMMANDS_DIR = './commands',
      DELIMITER    = 'em$';

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

loadCommands( COMMANDS_DIR );

// Set the prompt
vorpal.delimiter( DELIMITER );

if ( process.argv.length > 2 ) {
    /// Remove path to node and path to script file
    let args = process.argv.slice( 2);

    // Process command immediately
    vorpal.parse( args );
} else {
    // Enter interactive shell
    vorpal
        .show();
}
