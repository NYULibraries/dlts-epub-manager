"use strict";

let fs        = require( 'fs' );
let path      = require( 'path' );
let stringify = require( 'json-stable-stringify' );
let util      = require( '../../lib/util' );

let em;

module.exports = function( vorpal ){
    em = vorpal.em;

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

                let readiumJsonFile;
                try {
                    readiumJsonFile = getReadiumJsonFile( vorpal.em.conf );
                } catch ( error ) {
                    vorpal.log( `ERROR in configuration "${args.configuration}": ${error}` );

                    callback();
                    return;
                }

                fs.writeFileSync( readiumJsonFile, '[]\n', { flag : 'w' } );

                vorpal.log( `Deleted all EPUBs from ${readiumJsonFile}.` );
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

function getReadiumJsonFile( conf ) {
    let readiumJsonFile = conf.readiumJsonFile;

    if ( readiumJsonFile ) {
        // Assume that non-absolute paths are relative to root dir
        if ( ! path.isAbsolute( readiumJsonFile ) ) {
            readiumJsonFile = `${em.rootDir}/${readiumJsonFile}`;
        }

        if ( ! fs.existsSync( readiumJsonFile ) ) {
            throw `${readiumJsonFile} does not exist!`;
        }

        return readiumJsonFile;
    } else {
        throw util.ERROR_CONF_MISSING_READIUM_JSON_FILE;
    }
}