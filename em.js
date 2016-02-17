"use strict";

let fs     = require( 'fs' ),
    path   = require( 'path' ),
    // For debugging
    util   = require( 'util' ),
    vorpal = require( 'vorpal' )();

const COMMANDS_DIR = './commands',
      DELIMITER    = 'em$';

function loadCommands( commandsDir ) {
    var commandDirectories = fs.readdirSync( commandsDir ).forEach(
        function ( file ) {
            let fullpath = path.join( commandsDir, file );
            if ( fs.statSync( fullpath ).isDirectory() ) {
                // Without the './' get:
                //     "Error: Cannot find module 'commands/content'"
                require( './' + fullpath );
            }
        }
    );
}

loadCommands( COMMANDS_DIR );

// Set the prompt
vorpal.delimiter( DELIMITER );

if ( process.argv ) {
    // Process command immediately
    vorpal.parse( process.argv );
} else {
    // Enter interactive shell
    vorpal
        .show();
}
