"use strict";

const fs       = require( 'fs' );

const helpers  = require( '../../lib/command-helpers/intake' );
const util     = require( '../../lib/util' );

let em;

module.exports = function( vorpal ){
    em = vorpal.em;

    vorpal.command( 'intake add [configuration]' )
        .description( 'Intake EPUBs and generate Readium versions.' )
        .autocomplete( util.getConfigFileBasenames( vorpal.em.configDir ) )
        .action(
            function( args, callback ) {
                if ( args.configuration ) {
                    const loadSucceeded = vorpal.execSync( `load ${args.configuration}`, { fatal : true } );

                    if ( ! loadSucceeded ) {
                        vorpal.log( `ERROR: \`load ${args.configuration}\` failed.` );

                        if ( callback ) { callback(); }
                        return false;
                    }
                }

                let intakeEpubDir;
                try {
                    intakeEpubDir = helpers.getIntakeEpubDir( em.rootDir, em.conf );
                } catch( error ) {
                    vorpal.log( `ERROR: ${error}` );

                    if ( callback ) { callback(); }
                    return false;
                }

                let stats = fs.statSync( intakeEpubDir );
                if ( ! stats.isDirectory() ) {
                    vorpal.log( `ERROR: intakeEpubDir "${intakeEpubDir}" is not a directory.`);

                    if ( callback ) { callback(); }
                    return false;
                }

                let intakeOutputDir;
                try {
                    intakeOutputDir = helpers.getIntakeOutputDir( em.rootDir, em.conf );
                } catch( error ) {
                    vorpal.log( `ERROR: ${error}` );

                    if ( callback ) { callback(); }
                    return false;
                }

                stats = fs.statSync( intakeOutputDir );
                if ( ! stats.isDirectory() ) {
                    vorpal.log( `ERROR: intakeOutputDir "${intakeOutputDir}" is not a directory.`);

                    if ( callback ) { callback(); }
                    return false;
                }

                if ( ! em.intakeEpubList ) {
                    vorpal.log( util.ERROR_INTAKE_EPUB_LIST_NOT_LOADED );

                    if ( callback ) { callback(); }
                    return false;
                }

                const epubIdList = em.intakeEpubList;

                try {
                    const epubsCompleted = helpers.intakeEpubs(
                        intakeEpubDir,
                        epubIdList,
                        intakeOutputDir,
                        args.options
                    );

                    vorpal.log( `Intake completed for ${epubIdList.length} EPUBs:\n` + epubsCompleted.join( '\n' ) );

                    if ( callback ) { callback(); }
                    return true;
                } catch ( error ) {
                    vorpal.log( 'ERROR in intake of EPUBs:\n' +
                                error );

                    if ( callback ) { callback(); }
                    return false;
                }
            }
        );

};
