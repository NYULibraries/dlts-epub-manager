"use strict";

let AdmZip = require( 'adm-zip' );
let fs     = require( 'fs' );
let path   = require( 'path' );

let util  = require( '../../lib/util' );

let em;

module.exports = function( vorpal ){
    em = vorpal.em;

    vorpal.command( 'intake add [configuration]' )
        .description( 'Intake EPUBs and generate Readium versions and associated metadata files.' )
        .autocomplete( util.getConfigFileBasenames( vorpal.em.configDir ) )
        .action(
            function( args, callback ) {
                if ( args.configuration ) {
                    let loadSucceeded = vorpal.execSync( `load ${args.configuration}`, { fatal : true } );

                    if ( ! loadSucceeded ) {
                        vorpal.log( `ERROR: \`load ${args.configuration}\` failed.` );

                        return false;
                    }
                }

                let intakeOutputDir = em.conf.intakeOutputDir;
                if ( ! intakeOutputDir ) {
                    vorpal.log( util.ERROR_CONF_MISSING_INTAKE_OUTPUT_DIR );

                    return false;
                }

                if ( ! fs.existsSync( intakeOutputDir ) ) {
                    vorpal.log( `ERROR: intakeOutputDir "${intakeOutputDir}" does not exist.`);

                    return false;
                }

                let stats = fs.statSync( intakeOutputDir );
                if ( ! stats.isDirectory() ) {
                    vorpal.log( `ERROR: intakeOutputDir "${intakeOutputDir}" is not a directory.`);

                    return false;
                }

                if ( ! em.intakeEpubList ) {
                    vorpal.log( util.ERROR_INTAKE_EPUB_LIST_NOT_LOADED );

                    return false;
                }

                let epubs = em.intakeEpubList;

                try {
                    let epubsCompleted = intakeEpubs(
                        em.conf.intakeEpubDir,
                        epubs,
                        em.conf.intakeOutputDir
                    );

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

function intakeEpubs( epubDir, epubs, epubOutputDir ) {
    let epubsCompleted = [];

    epubs.forEach( ( epub ) => {
        let epubFile = `${epubDir}/${epub}/data/${epub}.epub`;

        try {
            unzipEpub( epubFile, epubOutputDir );
        } catch( e ) {
            throw( e );
        }

        epubsCompleted.push( epub );
    } );

    return epubsCompleted;
}

function unzipEpub( epubFile, epubOutputDir ) {
    let epubId      = path.basename( epubFile, '.epub' );
    let destination = `${epubOutputDir}/${epubId}`;
    let zip         = new AdmZip( epubFile );

    zip.extractAllTo( destination, true );
}
