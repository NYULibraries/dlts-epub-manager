"use strict";

let fs        = require( 'fs' );
let path      = require( 'path' );
let stringify = require( 'json-stable-stringify' );
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

                // If called via `.execSync`, `callback` will be undefined,
                // and return values will be used as response.
                if ( callback ) {
                    callback();
                } else {
                    return result;
                }
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

                        callback();
                        return;
                    }
                }

                if ( ! vorpal.em.metadata ) {
                    vorpal.log( util.ERROR_METADATA_NOT_LOADED );

                    callback();
                    return;
                }

                let epubs = vorpal.em.metadata.getAll();

                let readiumJsonFile;
                try {
                    readiumJsonFile = getReadiumJsonFile( vorpal.em.conf );
                } catch ( error ) {
                    vorpal.log( `ERROR in configuration "${args.configuration}": ${error}` );

                    callback();
                    return;
                }

                let readiumJson = require( readiumJsonFile );

                readiumJson = getReadiumJsonEpubsAdded( readiumJson, epubs );

                let readiumJsonString = util.jsonStableStringify( readiumJson );

                fs.writeFileSync( readiumJsonFile, readiumJsonString );

                vorpal.log( `Added to Readium JSON file ${readiumJsonFile} ` +
                            `for conf "${vorpal.em.conf.name}": ${epubs.size } EPUBs.` );

                callback();
            }
        );

    vorpal.command( 'readium-json delete' )
        .description( 'Delete EPUBs from `epub_library.json` file.' )
        .autocomplete( util.getConfigFileBasenames( vorpal.em.configDir ) )
        .action(
            function( args, callback ) {
                let result = false;

                vorpal.log(  `\`${this.commandWrapper.command}\` run with args:`  );
                vorpal.log( args );

                // If called via `.execSync`, `callback` will be undefined,
                // and return values will be used as response.
                if ( callback ) {
                    callback();
                } else {
                    return result;
                }
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

                        callback();
                        return;
                    }
                }

                let readiumJsonFile;
                try {
                    readiumJsonFile = getReadiumJsonFile( vorpal.em.conf );
                } catch ( error ) {
                    vorpal.log( `ERROR in configuration "${args.configuration}": ${error}` );

                    callback();
                    return;
                }

                fs.writeFileSync( readiumJsonFile, '[]\n', { flag : 'w' } );

                vorpal.log( `Deleted all EPUBs from ${readiumJsonFile}.` );

                callback();
            }
        );

    vorpal.command( 'readium-json full-replace' )
        .description( 'Replace entire `epub_library.json` file.' )
        .autocomplete( util.getConfigFileBasenames( vorpal.em.configDir ) )
        .action(
            function( args, callback ) {
                let result = false;

                vorpal.log(  `\`${this.commandWrapper.command}\` run with args:`  );
                vorpal.log( args );

                // If called via `.execSync`, `callback` will be undefined,
                // and return values will be used as response.
                if ( callback ) {
                    callback();
                } else {
                    return result;
                }
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
