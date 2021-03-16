"use strict";

const fs   = require( 'fs' );
const path = require( 'path' );

function getReadiumJsonFile( rootDir, conf ) {
    let readiumJsonFile = conf.readiumJsonFile;

    if ( readiumJsonFile ) {
        // Assume that non-absolute paths are relative to root dir
        if ( ! path.isAbsolute( readiumJsonFile ) ) {
            readiumJsonFile = `${rootDir}/${readiumJsonFile}`;
        }

        if ( ! fs.existsSync( readiumJsonFile ) ) {
            throw `${readiumJsonFile} does not exist!`;
        }

        return readiumJsonFile;
    } else {
        throw util.ERROR_CONF_MISSING_READIUM_JSON_FILE;
    }
}

function getReadiumJsonEpubsDeleted( readiumJson, epubMetadataAll ) {
    // Final JSON to be returned.
    let prunedJson = [];

    let deletedEpubIds = {};
    epubMetadataAll.forEach( ( epubMetadata ) => {
        deletedEpubIds[ epubMetadata.identifier ] = '1'; }
    );

    readiumJson.forEach( ( entry ) => {
        let entryId = entry.identifier;

        // Suppress JSHint empty block error.
        /*jshint ignore:start*/
        if ( deletedEpubIds[ entryId ] ) {
            // Skip
        } else {
            prunedJson.push( entry );
        }
        /*jshint ignore:end*/
    } );

    return prunedJson;
}

function getReadiumJsonEpubsAdded( readiumJson, epubMetadataAll ) {
    // Final JSON to be returned.
    let mergedJson = [];

    // Ids of EPUBs being added.  Used to determine if an existing EPUB is being
    // replaced.
    let addedEpubIds = {};
    // Add JSON for all EPUBs coming in.
    epubMetadataAll.forEach( ( epubMetadata ) => {
        mergedJson.push( getReadiumJsonForEpub( epubMetadata ) );
        addedEpubIds[ epubMetadata.identifier ] = '1'; }
    );

    // Add JSON for any existing EPUB entries that are not being replaced by
    // incoming.
    readiumJson.forEach( ( entry ) => {
        let entryId = entry.identifier;

        // Suppress JSHint empty block error.
        /*jshint ignore:start*/
        if ( addedEpubIds[ entryId ] ) {
            // Skip
        } else {
            mergedJson.push( entry );
        }
        /*jshint ignore:end*/
    } );

    return sortByAuthorThenByTitle( mergedJson );
}

function getReadiumJsonForEpub( epubMetadata ) {
    return {
        'author'           : epubMetadata.author,
        'author_sort'      : epubMetadata.author_sort,
        'coverHref'        : epubMetadata.coverHref,
        'coverage'         : epubMetadata.coverage,
        'date'             : epubMetadata.date,
        'description'      : epubMetadata.description,
        'description_html' : epubMetadata.description_html,
        'format'           : epubMetadata.format,
        'handle'           : epubMetadata.handle,
        'identifier'       : epubMetadata.identifier,
        'language'         : epubMetadata.language,
        'packageUrl'       : epubMetadata.packageUrl,
        'publisher'        : epubMetadata.publisher,
        'rights'           : epubMetadata.rights,
        'rootUrl'          : epubMetadata.rootUrl,
        'series_names'     : epubMetadata.series_names,
        'subject'          : epubMetadata.subject,
        'subtitle'         : epubMetadata.subtitle,
        'thumbHref'        : epubMetadata.thumbHref,
        'title'            : epubMetadata.title,
        'title_sort'       : epubMetadata.title_sort,
        'type'             : epubMetadata.type,
    };
}

function sortByAuthorThenByTitle( json ) {
    let sortedByAuthorThenByTitle = [];

    json.forEach( ( item ) => {
        sortedByAuthorThenByTitle.push( item );
    } );


    function compare( a, b ) {
        if ( a.author_sort < b.author_sort ) {
            return -1;
        }
        if ( a.author_sort > b.author_sort ) {
            return 1;
        }

        // Authors are equal.  Sort by title.
        if ( a.title_sort < b.title_sort ) {
            return -1;
        }
        if ( a.title_sort > b.title_sort ) {
            return 1;
        }

        return 0;
    }

    sortedByAuthorThenByTitle.sort( compare );

    return sortedByAuthorThenByTitle;
}

module.exports = {
    getReadiumJsonEpubsAdded,
    getReadiumJsonEpubsDeleted,
    getReadiumJsonFile,
};
