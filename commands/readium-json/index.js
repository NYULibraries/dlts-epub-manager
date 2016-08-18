"use strict";

let fs        = require( 'fs' );
let path      = require( 'path' );
let util      = require( '../../lib/util' );

let em;

module.exports = function( vorpal ){
    em = vorpal.em;

    vorpal.command( 'readium-json' )
        .description( 'Manage `epub_library.json` file.' )
        .action(
            function( args, callback ) {
                let result = false;

                vorpal.log(  `\`${this.commandWrapper.command}\` run with args:`  );
                vorpal.log( args );

                if ( callback ) { callback(); } else { return true; }
            }
        );

    vorpal.command( 'readium-json add [configuration]' )
        .description( 'Add EPUBs to `epub_library.json` file.' )
        .autocomplete( util.getConfigFileBasenames( vorpal.em.configDir ) )
        .action(
            function( args, callback ) {
                if ( args.configuration ) {
                    let loadSucceeded = vorpal.execSync( `load ${args.configuration}`, { fatal : true } );

                    if ( ! loadSucceeded ) {
                        vorpal.log( `ERROR: \`load ${args.configuration}\` failed.` );

                        if ( callback ) { callback(); } else { return false; }
                    }
                }

                if ( ! vorpal.em.metadata ) {
                    vorpal.log( util.ERROR_METADATA_NOT_LOADED );

                    if ( callback ) { callback(); } else { return false; }
                }

                let epubs = vorpal.em.metadata.getAll();

                let readiumJsonFile;
                try {
                    readiumJsonFile = getReadiumJsonFile( vorpal.em.conf );
                } catch ( error ) {
                    vorpal.log( `ERROR in configuration "${args.configuration}": ${error}` );

                    if ( callback ) { callback(); } else { return false; }
                }

                // Don't use `require()`, which caches file contents and breaks
                // the tests because the readiumJsonFile is changed multiple
                // times during the test runs.  Also, perhaps it is good to give
                // the user the option of editing the file during the session.
                let readiumJson = util.getJsonFromFile( readiumJsonFile );

                readiumJson = getReadiumJsonEpubsAdded( readiumJson, epubs );

                let readiumJsonString = util.jsonStableStringify( readiumJson );

                fs.writeFileSync( readiumJsonFile, readiumJsonString );

                vorpal.log( `Added to Readium JSON file ${readiumJsonFile} ` +
                            `for conf "${vorpal.em.conf.name}": ${epubs.size } EPUBs.` );

                if ( callback ) { callback(); } else { return true; }
            }
        );

    vorpal.command( 'readium-json delete [configuration]' )
        .description( 'Delete EPUBs from `epub_library.json` file.' )
        .autocomplete( util.getConfigFileBasenames( vorpal.em.configDir ) )
        .action(
            function( args, callback ) {
                if ( args.configuration ) {
                    let loadSucceeded = vorpal.execSync( `load ${args.configuration}`, { fatal : true } );

                    if ( ! loadSucceeded ) {
                        vorpal.log( `ERROR: \`load ${args.configuration}\` failed.` );

                        if ( callback ) { callback(); } else { return false; }
                    }
                }

                if ( ! vorpal.em.metadata ) {
                    vorpal.log( util.ERROR_METADATA_NOT_LOADED );

                    if ( callback ) { callback(); } else { return false; }
                }

                let epubs = vorpal.em.metadata.getAll();

                let readiumJsonFile;
                try {
                    readiumJsonFile = getReadiumJsonFile( vorpal.em.conf );
                } catch ( error ) {
                    vorpal.log( `ERROR in configuration "${args.configuration}": ${error}` );

                    if ( callback ) { callback(); } else { return false; }
                }

                // Don't use `require()`, which caches file contents and breaks
                // the tests because the readiumJsonFile is changed multiple
                // times during the test runs.  Also, perhaps it is good to give
                // the user the option of editing the file during the session.
                let readiumJson = util.getJsonFromFile( readiumJsonFile );

                readiumJson = getReadiumJsonEpubsDeleted( readiumJson, epubs );

                let readiumJsonString = util.jsonStableStringify( readiumJson );

                fs.writeFileSync( readiumJsonFile, readiumJsonString );

                vorpal.log( `Added to Readium JSON file ${readiumJsonFile} ` +
                            `for conf "${vorpal.em.conf.name}": ${epubs.size } EPUBs.` );

                if ( callback ) { callback(); } else { return true; }
            }
        );

    vorpal.command( 'readium-json delete all [configuration]' )
        .description( 'Delete all EPUBs from `epub_library.json` file.' )
        // This doesn't work right now.  Vorpal automatically expands to 'delete all'.
        // .autocomplete( util.getConfigFileBasenames( vorpal.em.configDir ) )
        .action(
            function( args, callback ) {
                if ( args.configuration ) {
                    let loadSucceeded = vorpal.execSync( `load ${args.configuration}`, { fatal : true } );

                    if ( ! loadSucceeded ) {
                        vorpal.log( `ERROR: \`load ${args.configuration}\` failed.` );

                        if ( callback ) { callback(); } else { return false; }
                    }
                }

                let readiumJsonFile;
                try {
                    readiumJsonFile = getReadiumJsonFile( vorpal.em.conf );
                } catch ( error ) {
                    vorpal.log( `ERROR in configuration "${args.configuration}": ${error}` );

                    if ( callback ) { callback(); } else { return false; }
                }

                fs.writeFileSync( readiumJsonFile, '[]\n', { flag : 'w' } );

                vorpal.log( `Deleted all EPUBs from ${readiumJsonFile}.` );

                if ( callback ) { callback(); } else { return true; }
            }
        );

    vorpal.command( 'readium-json full-replace [configuration]' )
        .description( 'Replace entire `epub_library.json` file.' )
        .autocomplete( util.getConfigFileBasenames( vorpal.em.configDir ) )
        .action(
            function( args, callback ) {
                let result = false;

                if ( args.configuration ) {
                    let loadSucceeded = vorpal.execSync( `load ${args.configuration}`, { fatal : true } );

                    if ( ! loadSucceeded ) {
                        vorpal.log( `ERROR: \`load ${args.configuration}\` failed.` );

                        if ( callback ) { callback(); } else { return false; }
                    }
                }

                if ( ! vorpal.em.metadata ) {
                    vorpal.log( util.ERROR_METADATA_NOT_LOADED );

                    if ( callback ) { callback(); } else { return false; }
                }

                let readiumJsonFile;
                try {
                    readiumJsonFile = getReadiumJsonFile( vorpal.em.conf );
                } catch ( error ) {
                    vorpal.log( `ERROR in configuration "${args.configuration}": ${error}` );

                    if ( callback ) { callback(); } else { return false; }
                }

                let deleteAllSucceeded = vorpal.execSync(
                    `readium-json delete all ${args.configuration}`,
                    { fatal : true }
                );

                if ( deleteAllSucceeded ) {
                    let addSucceeded = vorpal.execSync(
                        `readium-json add ${args.configuration}`,
                        { fatal : true }
                    );

                    if ( addSucceeded ) {
                        vorpal.log( `Fully replaced all EPUBs in Readium JSON for conf ${args.configuration}.` );

                        result = true;
                    } else {
                        result = false;
                    }
                } else {
                    vorpal.log( `Aborting \`full-replace\` for ${args.configuration}.` );

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

function getReadiumJsonEpubsDeleted( readiumJson, epubs ) {
    // Final JSON to be returned.
    let prunedJson = [];

    let deletedEpubIds = {};
    epubs.forEach( ( epub ) => {
        deletedEpubIds[ epub.identifier ] = '1'; }
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

function getReadiumJsonEpubsAdded( readiumJson, epubs ) {
    // Final JSON to be returned.
    let mergedJson = [];

    // Ids of EPUBs being added.  Used to determine if an existing EPUB is being
    // replaced.
    let addedEpubIds = {};
    // Add JSON for all EPUBs coming in.
    epubs.forEach( ( epub ) => {
        mergedJson.push( getReadiumJsonForEpub( epub ) );
        addedEpubIds[ epub.identifier ] = '1'; }
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

function getReadiumJsonForEpub( epub ) {
    return {
        'author'           : epub.author,
        'author_sort'      : epub.author_sort,
        'coverHref'        : epub.coverHref,
        'coverage'         : epub.coverage,
        'date'             : epub.date,
        'description'      : epub.description,
        'description_html' : epub.description_html,
        'format'           : epub.format,
        'handle'           : epub.handle,
        'identifier'       : epub.identifier,
        'language'         : epub.language,
        'packageUrl'       : epub.packageUrl,
        'publisher'        : epub.publisher,
        'rights'           : epub.rights,
        'rootUrl'          : epub.rootUrl,
        'subject'          : epub.subject,
        'subtitle'         : epub.subtitle,
        'thumbHref'        : epub.thumbHref,
        'title'            : epub.title,
        'title_sort'       : epub.title_sort,
        'type'             : epub.type,
    };
}

function sortByAuthorThenByTitle( json ) {
    let sortedByAuthorThenByTitle = [];

    json.forEach( ( epub ) => {
        sortedByAuthorThenByTitle.push( epub );
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
