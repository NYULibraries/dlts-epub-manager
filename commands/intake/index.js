"use strict";

let AdmZip   = require( 'adm-zip' );
let execSync = require( 'child_process' ).execSync;
let fs       = require( 'fs' );
let path     = require( 'path' );
let rimraf   = require( 'rimraf' );

let Epub = require( '../../lib/epub' ).Epub;
let util = require( '../../lib/util' );

let em;

const OLD_COVER_PAGE_FILE_NAME = 'cover.html';
const NEW_COVER_PAGE_FILE_NAME = 'cover.xhtml';

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

                let epubIdList = em.intakeEpubList;

                try {
                    let epubsCompleted = intakeEpubs(
                        em.conf.intakeEpubDir,
                        epubIdList,
                        em.conf.intakeOutputDir
                    );

                    vorpal.log( `Intake completed for ${epubIdList.size} EPUBs:\n` + epubsCompleted.join( '\n' ) );

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

function intakeEpubs( intakeEpubsDir, epubIdList, outputEpubsDir ) {
    try {
        rimraf.sync( outputEpubsDir + '/*' );
    } catch ( error ) {
        throw( `ERROR clearing ${outputEpubsDir}: ${error}` );
    }

    let epubsCompleted = [];

    epubIdList.forEach( ( epubId ) => {
        let intakeEpubFile = `${intakeEpubsDir}/${epubId}/data/${epubId}.epub`;
        let outputEpubDir = `${outputEpubsDir}/${epubId}`;

        try {
            unzipEpub( intakeEpubFile, outputEpubDir );

            let epub = new Epub( outputEpubDir );
            updateReferencesToCoverHtmlFile( epub );
            renameCoverHtmlFile( outputEpubDir );
            createCoverImageThumbnail(
                `${outputEpubDir}/ops/images/${epubId}.jpg`,
                `${outputEpubDir}/ops/images/${epubId}-th.jpg`
            );
        } catch( e ) {
            throw( e );
        }

        epubsCompleted.push( epubId );
    } );

    return epubsCompleted;
}

function unzipEpub( epubFile, outputEpub ) {
    let zip = new AdmZip( epubFile );

    zip.extractAllTo( outputEpub, true );
}

function renameCoverHtmlFile( explodedEpubDir ) {
    let coverHtmlFile  = `${explodedEpubDir}/ops/xhtml/${OLD_COVER_PAGE_FILE_NAME}`;
    let coverXhtmlFile = `${explodedEpubDir}/ops/xhtml/${NEW_COVER_PAGE_FILE_NAME}`;

    if ( ! fs.existsSync( coverHtmlFile ) ) {
        throw( `Cover HTML file ${coverHtmlFile} not found.` );
    }

    fs.renameSync( coverHtmlFile, coverXhtmlFile );
}

function updateReferencesToCoverHtmlFile( epub ) {
    let packageFileParentDir = path.basename( path.dirname( epub.paths.packageFile ) );

    let filesToUpdate = epub.packageFile.manifest.item
        .filter(
            ( item ) => {
                return item[ 'media-type' ].match( /text|xml/ );
            }
        )
        .map(
            ( item ) => {
                return `${epub.explodedEpubDir}/${packageFileParentDir}/${item.href}`;
            }
        );

    filesToUpdate.push( epub.paths.packageFile );
    filesToUpdate.forEach( ( fileToUpdate ) => {
            let fileContents = fs.readFileSync( fileToUpdate, 'utf8' );
            let newFileContents = fileContents.replace(
                new RegExp( OLD_COVER_PAGE_FILE_NAME, 'g' ),
                NEW_COVER_PAGE_FILE_NAME
            );
            fs.writeFileSync( fileToUpdate, newFileContents );
        }
    );
}

function createCoverImageThumbnail( fullsizeJpg, thumbnailJpg ) {
    let cmd = `convert ${fullsizeJpg} -strip -resize 160\\> ${thumbnailJpg}`;

    // From https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback:
    //    "If the process times out, or has a non-zero exit code, this method will throw.
    //     The Error object will contain the entire result from child_process.spawnSync()"
    try {
        execSync( cmd );
    } catch ( e ) {
        throw( e );
    }
}