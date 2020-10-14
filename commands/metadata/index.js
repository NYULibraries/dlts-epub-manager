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

                supafolio = new Supafolio( em.supafolioApiKey, em.request );

                let metadataDir = em.conf.metadataDir;
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

                    vorpal.log( `Intake completed for ${epubIdList.length} EPUBs:\n` + epubsCompleted.join( '\n' ) );

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

function createDltsAdministrativeMetadataFile( supafolioMetadata, outputFile ) {
    const dltsAdministrativeMetadata = {
        handle : legacyHandles.getHandleForEpub.supafolioMetadata.isbn;
        collection_code : supafolioMetadata.collectionCode,
    };

    fs.writeFileSync( outputFile, util.jsonStableStringify( metadata ), 'utf8' );
}

function createIntakeDescriptiveMetadataFile( supafolioBookMetadata, outputFile ) {
    const metadata = {
            author           : supafolioBookMetadata.author,
            author_sort      : util.getAuthorSortKey( supafolioBookMetadata.author ),
            coverage         : supafolioBookMetadata.coverage,
            coverHref        : supafolioBookMetadata.coverHref,
            date             : supafolioBookMetadata.date,
            description      : supafolioBookMetadata.description,
            description_html : supafolioBookMetadata.description_html,
            format           : supafolioBookMetadata.format,
            identifier       : supafolioBookMetadata.identifier,
            language         : supafolioBookMetadata.language,
            packageUrl       : supafolioBookMetadata.packageUrl,
            publisher        : supafolioBookMetadata.publisher,
            rights           : supafolioBookMetadata.rights,
            rootUrl          : supafolioBookMetadata.rootUrl,
            subject          : supafolioBookMetadata.subject,
            subtitle         : supafolioBookMetadata.subtitle,
            thumbHref        : supafolioBookMetadata.thumbHref,
            title            : supafolioBookMetadata.title,
            title_sort       : util.getTitleSortKey( supafolioBookMetadata.title ),
            type             : supafolioBookMetadata.type,
        };

        const handleUrl = legacyHandles.getHandleForEpub( supafolioBookMetadata.identifier );
        if ( handleUrl ) {
            metadata.handle = handleUrl;
        }

        fs.writeFileSync( outputFile, util.jsonStableStringify( metadata ), 'utf8' );
}

function generateMetadataFiles( epubIdList, metadataDir ) {
    let metadataFilesCompleted = [];

    epubIdList.forEach( ( epubId ) => {
        try {
            const supafolioMetadata = supafolio.book( epubId );

            const metadataDirForEpub = `${metadataDir}/${epubId}`;
            rimraf.sync( metadataDirForEpub );
            fs.mkdirSync( metadataDirForEpub, 0o755 );

            createIntakeDescriptiveMetadataFile(
                supafolioMetadata,`${metadataDirForEpub}/intake-descriptive.json`
            );

            createDltsAdministrativeMetadataFile(
                supafolioMetadata, `${metadataDirForEpub}/dlts-administrative.json`
            );
        } catch( e ) {
            throw( e );
        }

        metadataFilesCompleted.push( epubId );
    } );

    return metadataFilesCompleted;
}


