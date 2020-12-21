"use strict";

const AdmZip   = require( 'adm-zip' );
const execSync = require( 'child_process' ).execSync;
const fs       = require( 'fs' );
const path     = require( 'path' );
const rimraf   = require( 'rimraf' );

const DltsEpub = require( '../../lib/epub/DltsEpub' ).DltsEpub;
const util     = require( '../../lib/util' );

let em;

const OLD_COVER_PAGE_FILE_NAME = 'cover.html';
const NEW_COVER_PAGE_FILE_NAME = 'cover.xhtml';

// This handle stuff needs to be redone.  See comment in load command file in
// getMetadataForEpub() function.
const HANDLE_SERVER = 'http://hdl.handle.net';

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
                    intakeEpubDir = getIntakeEpubDir( em.conf );
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
                    intakeOutputDir = getIntakeOutputDir( em.conf );
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
                    const epubsCompleted = intakeEpubs(
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

function getIntakeEpubDir( conf ) {
    let intakeEpubDir = conf.intakeEpubDir;
    if ( ! intakeEpubDir ) {
        throw util.ERROR_CONF_MISSING_INTAKE_EPUB_DIR;
    }

    try {
        intakeEpubDir = getNormalizedIntakeDir( intakeEpubDir );
    } catch( e ) {
        throw( e );
    }

    return intakeEpubDir;
}

function getIntakeOutputDir( conf ) {
    let intakeOutputDir = conf.intakeOutputDir;
    if ( ! intakeOutputDir ) {
        throw util.ERROR_CONF_MISSING_INTAKE_OUTPUT_DIR;
    }

    try {
        intakeOutputDir = getNormalizedIntakeDir( intakeOutputDir );
    } catch( e ) {
        throw( e );
    }

    return intakeOutputDir;
}

function getNormalizedIntakeDir( dir ) {
    let normalizedIntakeDir = dir;

    // Assume that non-absolute paths are relative to root dir
    if ( ! path.isAbsolute( normalizedIntakeDir ) ) {
        normalizedIntakeDir = `${em.rootDir}/${normalizedIntakeDir}`;
    }

    if ( ! fs.existsSync( normalizedIntakeDir ) ) {
        throw `${normalizedIntakeDir} does not exist!`;
    }

    return normalizedIntakeDir;
}

function intakeEpubs( intakeEpubsDir, epubIdList, outputEpubsDir, options ) {
    const epubsCompleted = [];

    epubIdList.forEach( ( epubId ) => {
        const intakeEpubDir  = `${intakeEpubsDir}/${epubId}`;
        const intakeEpubFile = `${intakeEpubDir}/data/${epubId}.epub`;
        const outputEpubDir = `${outputEpubsDir}/${epubId}`;

        try {
            rimraf.sync( outputEpubDir );

            unzipEpub( intakeEpubFile, outputEpubDir );

            const epub = new DltsEpub( outputEpubDir );

            const coverHtmlFile  = `${outputEpubDir}/ops/xhtml/${OLD_COVER_PAGE_FILE_NAME}`;
            const coverXhtmlFile = `${outputEpubDir}/ops/xhtml/${NEW_COVER_PAGE_FILE_NAME}`;

            if ( ! fs.existsSync( coverHtmlFile ) && ! fs.existsSync( coverXhtmlFile ) ) {
                throw( `Cover file not found: expected either ${coverHtmlFile} or ${coverXhtmlFile}` );
            }

            if ( fs.existsSync( coverHtmlFile) && ! fs.existsSync( coverXhtmlFile ) ) {
                // Update references has to be done before the file rename, because
                // the list of files to be updated comes from the manifest, which expects
                // the original cover file path.
                updateReferencesToCoverHtmlFile( epub );
                fs.renameSync( coverHtmlFile, coverXhtmlFile );
            }

            createCoverImageThumbnail(
                `${outputEpubDir}/ops/images/${epubId}.jpg`,
                `${outputEpubDir}/ops/images/${epubId}-th.jpg`
            );
        } catch( e ) {
            throw( `[ ${ epubId } ] ${ e }` );
        }

        epubsCompleted.push( epubId );
    } );

    return epubsCompleted;
}

function unzipEpub( epubFile, outputEpub ) {
    const zip = new AdmZip( epubFile );

    zip.extractAllTo( outputEpub, true );
}

function updateReferencesToCoverHtmlFile( epub ) {
    const rootDirectory = epub.rootDirectory;

    const filesToUpdate = epub.package._xml.manifest.item
        .filter(
            ( item ) => {
                return item[ 'media-type' ].match( /text|xml/ );
            }
        )
        .map(
            ( item ) => {
                return `${epub.explodedEpubDir}/${rootDirectory}/${item.href}`;
            }
        );

    filesToUpdate.push( epub.package._filePath );
    filesToUpdate.forEach( ( fileToUpdate ) => {
            const fileContents = fs.readFileSync( fileToUpdate, 'utf8' );
            const newFileContents = fileContents.replace(
                new RegExp( OLD_COVER_PAGE_FILE_NAME, 'g' ),
                NEW_COVER_PAGE_FILE_NAME
            );
            fs.writeFileSync( fileToUpdate, newFileContents );
        }
    );
}

function createCoverImageThumbnail( fullsizeJpg, thumbnailJpg ) {
    const cmd = `convert ${fullsizeJpg} -strip -resize 160\\> ${thumbnailJpg}`;

    // From https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback:
    //    "If the process times out, or has a non-zero exit code, this method will throw.
    //     The Error object will contain the entire result from child_process.spawnSync()"
    try {
        execSync( cmd );
    } catch ( e ) {
        throw( e );
    }
}

