"use strict";

const execSync  = require( 'child_process' ).execSync;
const fs        = require( 'fs' );
const path      = require( 'path' );
const rimraf    = require( 'rimraf' );
const striptags = require( 'striptags' );

const legacyHandles = require( '../../lib/legacy/handles' );
const Supafolio     = require( '../../lib/supafolio/Supafolio' ).Supafolio;
const util          = require( '../../lib/util' );

let em;
let supafolio;

module.exports = function( vorpal ){
    em = vorpal.em;

    vorpal.command( 'metadata add [configuration]' )
        .description( 'Generate metadata files from Supafolio API.' )
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

                supafolio = new Supafolio( em.conf.supafolioApiKey, em.request );

                let metadataDir = util.getMetadataDir( em );
                if ( ! metadataDir ) {
                    vorpal.log( util.ERROR_CONF_MISSING_METADATA_DIR );

                    if ( callback ) { callback(); }
                    return false;
                }

                if ( ! fs.existsSync( metadataDir ) ) {
                    vorpal.log( `ERROR: metadataDir "${metadataDir}" does not exist.`);

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
                    let epubsCompleted = generateMetadataFiles(
                        epubIdList,
                        metadataDir
                    );

                    vorpal.log( `Metadata files created for ${epubIdList.length} EPUBs:\n` + epubsCompleted.join( '\n' ) );

                    if ( callback ) { callback(); }
                    return true;
                } catch ( error ) {
                    vorpal.log( 'ERROR in generation of metadata file for EPUBs:\n' +
                                error );

                    if ( callback ) { callback(); }
                    return false;
                }
            }
        );

};

function createDltsAdministrativeMetadataFile( book, outputFile ) {
    const dltsAdministrativeMetadata = {
        handle : legacyHandles.getHandleForEpub( book.isbn ),
        collection_code : book.collectionCode,
    };

    fs.writeFileSync( outputFile, util.jsonStableStringify( dltsAdministrativeMetadata ), 'utf8' );
}

function createIntakeDescriptiveMetadataFile( book, outputFile ) {
    const isbn = book.isbn;
    const licenseData = util.getLicenseData( book.license.link );

    if ( ! licenseData ) {
        throw( `Unable to retrieve license data for ${ isbn }.` );
    }

    const metadata = {
        author               : book.authorsForDisplay,
        author_sort          : util.getAuthorSortKey( book.authorsForDisplay ),
        coverage             : book.coverage,
        coverHref            : `epub_content/${isbn}/${util.OPS_DIRECTORY_NAME}/images/${isbn}.jpg`,
        description          : striptags( book.description ),
        description_html     : book.description,
        date                 : book.year.toString(),
        format               : `${book.pages} pages`,
        handle               : legacyHandles.getHandleUrlForEpub( book.isbn ),
        identifier           : isbn,
        language             : book.languageCode,
        license              : licenseData.name,
        license_abbreviation : licenseData.abbreviation,
        license_icon         : licenseData.icon,
        license_link         : book.license.link,
        packageUrl           : `epub_content/${isbn}`,
        publisher            : book.publisher,
        // We used to get this from <dc.type> in EPUB manifest.  Currently
        // is the only values used in Open Square are slight variations on
        // this wording.
        rights               : 'All rights reserved',
        rootUrl              : `epub_content/${ isbn }`,
        subject              : book.subjects.join( ' / ' ),
        thumbHref            : `epub_content/${isbn}/ops/images/${isbn}-th.jpg`,
        title                : book.title,
        title_sort           : util.getTitleSortKey( book.title ),
        // We used to get this from <dc.type> in EPUB manifest.  Currently "Text"
        // is the only value used in Open Square.
        type                 : 'Text',
    };

    const handleUrl = legacyHandles.getHandleForEpub( book.identifier );
    if ( handleUrl ) {
        metadata.handle = handleUrl;
    }

    if ( book.seriesName ) {
        metadata.series_names = [ book.seriesName ];
    }

    if ( book.subtitle ) {
        metadata.subtitle = book.subtitle;
    }

    fs.writeFileSync( outputFile, util.jsonStableStringify( metadata ), 'utf8' );
}

function generateMetadataFiles( epubIdList, metadataDir ) {
    let metadataFilesCompleted = [];

    epubIdList.forEach( ( epubId ) => {
        try {
            const supafolioBookMetadata = supafolio.book( epubId );

            const metadataDirForEpub = `${metadataDir}/${epubId}`;
            rimraf.sync( metadataDirForEpub );
            fs.mkdirSync( metadataDirForEpub, 0o755 );

            createIntakeDescriptiveMetadataFile(
                supafolioBookMetadata,`${metadataDirForEpub}/intake-descriptive.json`
            );

            createDltsAdministrativeMetadataFile(
                supafolioBookMetadata, `${metadataDirForEpub}/dlts-administrative.json`
            );
        } catch( e ) {
            throw( `[ ${ epubId } ] ${ e }` );
        }

        metadataFilesCompleted.push( epubId );
    } );

    return metadataFilesCompleted;
}


