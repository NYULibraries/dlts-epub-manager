"use strict";

let fs   = require( 'fs' );
let path = require( 'path' );

const CONFIG_FILE_EXTENSION = '.json';

module.exports = function( vorpal ){
    vorpal.log( `Loaded ${ __filename }.` );

    vorpal.command( 'load <configuration>' )
        .description( 'Read in configuration file and load resources.' )
        .option( '--dry-run', 'Print actions taken but do not execute them.' )
        .autocomplete( getConfigFileBasenames( vorpal.em.configDir ) )
        .action(
            function( args, callback ) {
                let result = false;

                vorpal.log(  `\`${this.commandWrapper.command}\` run with args:`  );
                vorpal.log( args );

                // If called via `.execSync`, `callback` will be undefined,
                // and return values will be used as response.
                if ( callback ) {
                    callback();
                } else {
                    return result;
                }
            }
        );
};

function getConfigFileBasenames( dir ) {
    let filenames = fs.readdirSync( dir );

    return filenames.map(
        function( filename ) {
            return path.basename( filename, CONFIG_FILE_EXTENSION );
        }
    );
}
