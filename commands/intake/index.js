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

                let epubs   = em.intakeEpubList;

                try {
                    let epubsCompleted = intakeEpubs( em.conf.intakeEpubDir, epubs );

                    vorpal.log( `Intake completed for ${epubs.size} EPUBs:\n` + epubsCompleted.join( '\n' ) );

                    if ( callback ) { callback(); } else { return true; }
                } catch ( error ) {
                    vorpal.log( 'ERROR in intake of EPUB:\n' +
                                error );

                    if ( callback ) { callback(); } else { return false; }
                }
            }
        );

};

function intakeEpubs( epubDir, epubs ) {
    let epubsCompleted = [];

    epubs.forEach( ( epub ) => {
        console.log( `Intake of ${epubDir}/${epub}` );

        epubsCompleted.push( epub );
    } );

    return epubsCompleted;
}