"use strict";

let AdmZip = require( 'adm-zip' );

let util  = require( '../../lib/util' );

let em;

module.exports = function( vorpal ){
    em = vorpal.em;

    vorpal.command( 'intake add' )
        .description( 'Intake EPUBs and generate Readium versions and associated metadata files.' )
        .action(
            function( args, callback ) {
                if ( args.configuration ) {
                    let loadSucceeded = vorpal.execSync( `load ${args.configuration}`, { fatal : true } );

                    if ( ! loadSucceeded ) {
                        vorpal.log( `ERROR: \`load ${args.configuration}\` failed.` );

                        if ( callback ) { callback(); } else { return false; }
                    }
                }

                if ( ! em.intakeEpubList ) {
                    vorpal.log( util.ERROR_INTAKE_EPUB_LIST_NOT_LOADED );

                    if ( callback ) { callback(); } else { return false; }
                }

                try {
                    if ( callback ) { callback(); } else { return true; }
                } catch ( error ) {
                    if ( callback ) { callback(); } else { return false; }
                }
            }
        );

};
