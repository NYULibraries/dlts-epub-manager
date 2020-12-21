"use strict";

const fs        = require( 'fs' );
const path      = require( 'path' );
const util      = require( '../../lib/util' );

let em;

module.exports = function( vorpal ){
    em = vorpal.em;

    vorpal.command( 'readium-json add [configuration]' )
        .description( 'Add EPUBs to `epub_library.json` file.' )
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

                if ( ! vorpal.em.metadata ) {
                    vorpal.log( util.ERROR_METADATA_NOT_LOADED );

                    if ( callback ) { callback(); }
                    return false;
                }

                const epubMetadataAll = vorpal.em.metadata.getAll();

                let readiumJsonFile;
                try {
                    readiumJsonFile = getReadiumJsonFile( vorpal.em.conf );
                } catch ( error ) {
                    vorpal.log( `ERROR in configuration "${vorpal.em.conf.name}": ${error}` );

                    if ( callback ) { callback(); }
                    return false;
                }

                // Don't use `require()`, which caches file contents and breaks
                // the tests because the readiumJsonFile is changed multiple
                // times during the test runs.  Also, perhaps it is good to give
                // the user the option of editing the file during the session.
                let readiumJson = util.getJsonFromFile( readiumJsonFile );

                readiumJson = getReadiumJsonEpubsAdded( readiumJson, epubMetadataAll );

                const readiumJsonString = util.jsonStableStringify( readiumJson );

                fs.writeFileSync( readiumJsonFile, readiumJsonString );

                vorpal.log( `Added to Readium JSON file ${readiumJsonFile} ` +
                            `for conf "${vorpal.em.conf.name}": ${epubMetadataAll.size } EPUBs.` );

                if ( callback ) { callback(); }
                return true;
            }
        );

    vorpal.command( 'readium-json delete [configuration]' )
        .description( 'Delete EPUBs from `epub_library.json` file.' )
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

                if ( ! vorpal.em.metadata ) {
                    vorpal.log( util.ERROR_METADATA_NOT_LOADED );

                    if ( callback ) { callback(); }
                    return false;
                }

                const epubMetadataAll = vorpal.em.metadata.getAll();

                let readiumJsonFile;
                try {
                    readiumJsonFile = getReadiumJsonFile( vorpal.em.conf );
                } catch ( error ) {
                    vorpal.log( `ERROR in configuration "${vorpal.em.conf.name}": ${error}` );

                    if ( callback ) { callback(); }
                    return false;
                }

                // Don't use `require()`, which caches file contents and breaks
                // the tests because the readiumJsonFile is changed multiple
                // times during the test runs.  Also, perhaps it is good to give
                // the user the option of editing the file during the session.
                let readiumJson = util.getJsonFromFile( readiumJsonFile );

                readiumJson = getReadiumJsonEpubsDeleted( readiumJson, epubMetadataAll );

                const readiumJsonString = util.jsonStableStringify( readiumJson );

                fs.writeFileSync( readiumJsonFile, readiumJsonString );

                vorpal.log( `Deleted from Readium JSON file ${readiumJsonFile} ` +
                            `for conf "${vorpal.em.conf.name}": ${epubMetadataAll.size } EPUBs.` );

                if ( callback ) { callback(); }
                return true;
            }
        );

    vorpal.command( 'readium-json delete all [configuration]' )
        .description( 'Delete all EPUBs from `epub_library.json` file.' )
        // This doesn't work right now.  Vorpal automatically expands to 'delete all'.
        // .autocomplete( util.getConfigFileBasenames( vorpal.em.configDir ) )
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

                let readiumJsonFile;
                try {
                    readiumJsonFile = getReadiumJsonFile( vorpal.em.conf );
                } catch ( error ) {
                    vorpal.log( `ERROR in configuration "${vorpal.em.conf.name}": ${error}` );

                    if ( callback ) { callback(); }
                    return false;
                }

                fs.writeFileSync( readiumJsonFile, '[]\n', { flag : 'w' } );

                vorpal.log( `Deleted all EPUBs from ${readiumJsonFile}.` );

                if ( callback ) { callback(); }
                return true;
            }
        );

    vorpal.command( 'readium-json full-replace [configuration]' )
        .description( 'Replace entire `epub_library.json` file.' )
        .autocomplete( util.getConfigFileBasenames( vorpal.em.configDir ) )
        .action(
            function( args, callback ) {
                let result = false;

                if ( args.configuration ) {
                    const loadSucceeded = vorpal.execSync( `load ${args.configuration}`, { fatal : true } );

                    if ( ! loadSucceeded ) {
                        vorpal.log( `ERROR: \`load ${args.configuration}\` failed.` );

                        if ( callback ) { callback(); }
                        return false;
                    }
                }

                if ( ! vorpal.em.metadata ) {
                    vorpal.log( util.ERROR_METADATA_NOT_LOADED );

                    if ( callback ) { callback(); }
                    return false;
                }

                let readiumJsonFile;
                try {
                    readiumJsonFile = getReadiumJsonFile( vorpal.em.conf );
                } catch ( error ) {
                    vorpal.log( `ERROR in configuration "${vorpal.em.conf.name}": ${error}` );

                    if ( callback ) { callback(); }
                    return false;
                }

                const deleteAllSucceeded = vorpal.execSync(
                    `readium-json delete all ${vorpal.em.conf.name}`,
                    { fatal : true }
                );

                if ( deleteAllSucceeded ) {
                    const addSucceeded = vorpal.execSync(
                        `readium-json add ${vorpal.em.conf.name}`,
                        { fatal : true }
                    );

                    if ( addSucceeded ) {
                        vorpal.log( `Fully replaced all EPUBs in Readium JSON for conf ${vorpal.em.conf.name}.` );

                        result = true;
                    } else {
                        result = false;
                    }
                } else {
                    vorpal.log( `Aborting \`full-replace\` for ${vorpal.em.conf.name}.` );

                    result = false;
                }

                if ( callback ) { callback(); } else { return result; }
            }
        );
};

function getReadiumJsonFile( conf ) {
    let readiumJsonFile = conf.readiumJsonFile;

    if ( readiumJsonFile ) {
        // Assume that non-absolute paths are relative to root dir
        if ( ! path.isAbsolute( readiumJsonFile ) ) {
            readiumJsonFile = `${em.rootDir}/${readiumJsonFile}`;
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
