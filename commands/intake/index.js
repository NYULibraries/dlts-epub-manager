"use strict";

let AdmZip  = require( 'adm-zip' );
let fs      = require( 'fs' );
let path    = require( 'path' );
let rimraf  = require( 'rimraf' );

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

                        if ( callback ) { callback(); }
                        return false;
                    }
                }

                let intakeOutputDir = em.conf.intakeOutputDir;
                if ( ! intakeOutputDir ) {
                    vorpal.log( util.ERROR_CONF_MISSING_INTAKE_OUTPUT_DIR );

                    if ( callback ) { callback(); }
                    return false;
                }

                if ( ! fs.existsSync( intakeOutputDir ) ) {
                    vorpal.log( `ERROR: intakeOutputDir "${intakeOutputDir}" does not exist.`);

                    if ( callback ) { callback(); }
                    return false;
                }

                let stats = fs.statSync( intakeOutputDir );
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

                let epubs = em.intakeEpubList;

                try {
                    let epubsCompleted = intakeEpubs(
                        em.conf.intakeEpubDir,
                        epubs,
                        em.conf.intakeOutputDir
                    );

                    vorpal.log( `Intake completed for ${epubs.size} EPUBs:\n` + epubsCompleted.join( '\n' ) );

                    if ( callback ) { callback(); }
                    return false;
                } catch ( error ) {
                    vorpal.log( 'ERROR in intake of EPUB:\n' +
                                error );

                    if ( callback ) { callback(); }
                    return false;
                }
            }
        );

};

function intakeEpubs( epubDir, epubs, intakeOutputDir ) {
    try {
        rimraf.sync( intakeOutputDir + '/*' );
    } catch ( error ) {
        throw( `ERROR clearing ${intakeOutputDir}: ${error}` );
    }

    let epubsCompleted = [];

    epubs.forEach( ( epub ) => {
        let intakeEpubFile = `${epubDir}/${epub}/data/${epub}.epub`;
        // This is actually a directory, but naming it outputEpubDir might be
        // confusing due to existing param intakeOutputDir.
        let outputEpub     = `${intakeOutputDir}/${epub}`;

        try {
            unzipEpub( intakeEpubFile, outputEpub );
            renameCoverHtmlFile( outputEpub );
        } catch( e ) {
            throw( e );
        }

        epubsCompleted.push( epub );
    } );

    return epubsCompleted;
}

function unzipEpub( epubFile, outputEpub ) {
    let zip = new AdmZip( epubFile );

    zip.extractAllTo( outputEpub, true );
}

function renameCoverHtmlFile( epubDir ) {
    let coverHtmlFile  = `${epubDir}/ops/xhtml/cover.html`;
    let coverXhtmlFile = `${epubDir}/ops/xhtml/cover.xhtml`;

    if ( ! fs.existsSync( coverHtmlFile ) ) {
        throw( `Cover HTML file ${coverHtmlFile} not found.` );
    }

    fs.renameSync( coverHtmlFile, coverXhtmlFile );
}