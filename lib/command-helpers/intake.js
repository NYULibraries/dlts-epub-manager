"use strict";

const AdmZip   = require( 'adm-zip' );
const fs       = require( 'fs' );
const path     = require( 'path' );
const rimraf   = require( 'rimraf' );

const DltsEpub = require( '../../lib/epub/DltsEpub' ).DltsEpub;
const util     = require( '../../lib/util' );

const OLD_COVER_PAGE_FILE_NAME = 'cover.html';
const NEW_COVER_PAGE_FILE_NAME = 'cover.xhtml';

function getIntakeEpubDir( rootDir, conf ) {
    let intakeEpubDir = conf.intakeEpubDir;
    if ( ! intakeEpubDir ) {
        throw util.ERROR_CONF_MISSING_INTAKE_EPUB_DIR;
    }

    try {
        intakeEpubDir = getNormalizedIntakeDir( rootDir, intakeEpubDir );
    } catch( e ) {
        throw( e );
    }

    return intakeEpubDir;
}

function getIntakeOutputDir( rootDir, conf ) {
    let intakeOutputDir = conf.intakeOutputDir;
    if ( ! intakeOutputDir ) {
        throw util.ERROR_CONF_MISSING_INTAKE_OUTPUT_DIR;
    }

    try {
        intakeOutputDir = getNormalizedIntakeDir( rootDir, intakeOutputDir );
    } catch( e ) {
        throw( e );
    }

    return intakeOutputDir;
}

function getNormalizedIntakeDir( rootDir, dir ) {
    let normalizedIntakeDir = dir;

    // Assume that non-absolute paths are relative to root dir
    if ( ! path.isAbsolute( normalizedIntakeDir ) ) {
        normalizedIntakeDir = `${rootDir}/${normalizedIntakeDir}`;
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

module.exports = {
    getIntakeEpubDir,
    getIntakeOutputDir,
    getNormalizedIntakeDir,
    intakeEpubs,
}
