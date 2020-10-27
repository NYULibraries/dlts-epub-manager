"use strict";

const execSync = require( 'child_process' ).execSync;
const fs       = require( 'fs' );
const path     = require( 'path' );
const rimraf   = require( 'rimraf' );

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
                    vorpal.log( 'ERROR in generation of metadata file(s) for EPUB:\n' +
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
    // TODO: Remove this after license data is fixed.
    // const licenseData = util.getLicenseData( book.license.name );
    const licenseData = {
        abbreviation: 'CC BY-ND',
        icon: 'https://i.creativecommons.org/l/by-nd/4.0/80x15.png',
        link: 'https://creativecommons.org/licenses/by-nd/4.0/'
    };

    const metadata = {
        author               : book.authorsForDisplay,
        author_sort          : util.getAuthorSortKey( book.authorsForDisplay ),
        coverage             : book.coverage,
        coverHref            : `epub_content/${isbn}/${util.OPS_DIRECTORY_NAME}/images/${isbn}.jpg`,
        description          : book.description,
        description_html     : book.description_html,
        date                 : book.year.toString(),
        format               : `${book.pages} pages`,
        handle               : legacyHandles.getHandleUrlForEpub( book.isbn ),
        identifier           : isbn,
        // TODO: After NYUP-684 work has been verified, switch back to book.languageCode
        // or to whatever normalized language code we decide upon.
        language             : book.languageCode === 'eng' ? 'En' : book.languageCode,
        // TODO: Remove this after license data is fixed.
        // license              : book.license.name,
        license              : 'Creative Commons Attribution-NoDerivatives 4.0 International License',
        license_abbreviation : licenseData.abbreviation,
        license_icon         : licenseData.icon,
        license_link         : licenseData.link,
        packageUrl           : `epub_content/${isbn}`,
        publisher            : book.publisher,
        // We used to get this from <dc.type> in EPUB manifest.  Currently
        // is the only values used in Open Square are slight variations on
        // this wording.
        rights               : 'All rights reserved',
        rootUrl              : book.rootUrl,
        subject              : book.subjects.join( ' / ' ),
        subtitle             : book.subtitle,
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
            throw( e );
        }

        metadataFilesCompleted.push( epubId );
    } );

    return metadataFilesCompleted;
}


