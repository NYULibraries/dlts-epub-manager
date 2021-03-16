"use strict";

const fs        = require( 'fs' );
const rimraf    = require( 'rimraf' );
const striptags = require( 'striptags' );

const legacyHandles = require( '../../lib/legacy/handles' );
const util          = require( '../../lib/util' );

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

function generateMetadataFiles( supafolio, epubIdList, metadataDir ) {
    const metadataFilesCompleted = [];

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

module.exports = {
    generateMetadataFiles,
};
