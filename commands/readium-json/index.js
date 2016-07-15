"use strict";

let fs        = require( 'fs' );
let stringify = require( 'json-stable-stringify' );
let util      = require( '../../lib/util' );

module.exports = function( vorpal ){
    vorpal.log( `Loaded ${ __filename }.` );

    vorpal.command( 'readium-json' )
        .description( 'Manage `epub_library.json` file.' )
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

    vorpal.command( 'readium-json add' )
        .description( 'Add EPUBs to `epub_library.json` file.' )
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

    vorpal.command( 'readium-json delete' )
        .description( 'Delete EPUBs from `epub_library.json` file.' )
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

    vorpal.command( 'readium-json delete all [configuration]' )
        .description( 'Delete all EPUBs from `epub_library.json` file.' )
        .action(
            function( args, callback ) {
                if ( args.configuration ) {
                    let loadSucceeded = vorpal.execSync( `load ${args.configuration}`, { fatal : true } );

                    if ( ! loadSucceeded ) {
                        vorpal.log( `ERROR: \`load ${args.configuration}\` failed.` );

                        callback();
                        return;
                    }
                }

                let readiumJsonFile = vorpal.em.conf.readiumJsonFile;
                if ( ! readiumJsonFile ) {
                    vorpal.log( util.ERROR_CONF_MISSING_READIUM_JSON_FILE );

                    callback();
                    return;
                }

                fs.writeFileSync( readiumJsonFile, '[]\n', { flag : 'w' } );

                vorpal.log( `Deleted all EPUBs from ${readiumJsonFile} file.` );
            }
        );

    vorpal.command( 'readium-json full-replace' )
        .description( 'Replace entire `epub_library.json` file.' )
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
