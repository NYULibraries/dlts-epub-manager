"use strict";

const fs      = require( 'fs' );

const helpers = require( '../../lib/command-helpers/readium-json' );
const util    = require( '../../lib/util' );

let em;

module.exports = function( vorpal ){
    em = vorpal.em;

    vorpal.command( 'readium-json add [configuration]' )
        .description( 'Add EPUBs to `epub_library.json` file.' )
        .autocomplete( util.getConfigFileBasenames( em.configDir ) )
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

                if ( ! em.metadata ) {
                    vorpal.log( util.ERROR_METADATA_NOT_LOADED );

                    if ( callback ) { callback(); }
                    return false;
                }

                const epubMetadataAll = em.metadata.getAll();

                let readiumJsonFile;
                try {
                    readiumJsonFile = helpers.getReadiumJsonFile( em.rootDir, em.conf );
                } catch ( error ) {
                    vorpal.log( `ERROR in configuration "${em.conf.name}": ${error}` );

                    if ( callback ) { callback(); }
                    return false;
                }

                // Don't use `require()`, which caches file contents and breaks
                // the tests because the readiumJsonFile is changed multiple
                // times during the test runs.  Also, perhaps it is good to give
                // the user the option of editing the file during the session.
                let readiumJson = util.getJsonFromFile( readiumJsonFile );

                readiumJson = helpers.getReadiumJsonEpubsAdded( readiumJson, epubMetadataAll );

                const readiumJsonString = util.jsonStableStringify( readiumJson );

                fs.writeFileSync( readiumJsonFile, readiumJsonString );

                vorpal.log( `Added to Readium JSON file ${readiumJsonFile} ` +
                            `for conf "${em.conf.name}": ${epubMetadataAll.size } EPUBs.` );

                if ( callback ) { callback(); }
                return true;
            }
        );

    vorpal.command( 'readium-json delete [configuration]' )
        .description( 'Delete EPUBs from `epub_library.json` file.' )
        .autocomplete( util.getConfigFileBasenames( em.configDir ) )
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

                if ( ! em.metadata ) {
                    vorpal.log( util.ERROR_METADATA_NOT_LOADED );

                    if ( callback ) { callback(); }
                    return false;
                }

                const epubMetadataAll = em.metadata.getAll();

                let readiumJsonFile;
                try {
                    readiumJsonFile = helpers.getReadiumJsonFile( em.rootDir, em.conf );
                } catch ( error ) {
                    vorpal.log( `ERROR in configuration "${em.conf.name}": ${error}` );

                    if ( callback ) { callback(); }
                    return false;
                }

                // Don't use `require()`, which caches file contents and breaks
                // the tests because the readiumJsonFile is changed multiple
                // times during the test runs.  Also, perhaps it is good to give
                // the user the option of editing the file during the session.
                let readiumJson = util.getJsonFromFile( readiumJsonFile );

                readiumJson = helpers.getReadiumJsonEpubsDeleted( readiumJson, epubMetadataAll );

                const readiumJsonString = util.jsonStableStringify( readiumJson );

                fs.writeFileSync( readiumJsonFile, readiumJsonString );

                vorpal.log( `Deleted from Readium JSON file ${readiumJsonFile} ` +
                            `for conf "${em.conf.name}": ${epubMetadataAll.size } EPUBs.` );

                if ( callback ) { callback(); }
                return true;
            }
        );

    vorpal.command( 'readium-json delete all [configuration]' )
        .description( 'Delete all EPUBs from `epub_library.json` file.' )
        // This doesn't work right now.  Vorpal automatically expands to 'delete all'.
        // .autocomplete( util.getConfigFileBasenames( em.configDir ) )
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
                    readiumJsonFile = helpers.getReadiumJsonFile( em.rootDir, em.conf );
                } catch ( error ) {
                    vorpal.log( `ERROR in configuration "${em.conf.name}": ${error}` );

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
        .autocomplete( util.getConfigFileBasenames( em.configDir ) )
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

                if ( ! em.metadata ) {
                    vorpal.log( util.ERROR_METADATA_NOT_LOADED );

                    if ( callback ) { callback(); }
                    return false;
                }

                let readiumJsonFile;
                try {
                    readiumJsonFile = helpers.getReadiumJsonFile( em.rootDir, em.conf );
                } catch ( error ) {
                    vorpal.log( `ERROR in configuration "${em.conf.name}": ${error}` );

                    if ( callback ) { callback(); }
                    return false;
                }

                const deleteAllSucceeded = vorpal.execSync(
                    `readium-json delete all ${em.conf.name}`,
                    { fatal : true }
                );

                if ( deleteAllSucceeded ) {
                    const addSucceeded = vorpal.execSync(
                        `readium-json add ${em.conf.name}`,
                        { fatal : true }
                    );

                    if ( addSucceeded ) {
                        vorpal.log( `Fully replaced all EPUBs in Readium JSON for conf ${em.conf.name}.` );

                        result = true;
                    } else {
                        result = false;
                    }
                } else {
                    vorpal.log( `Aborting \`full-replace\` for ${em.conf.name}.` );

                    result = false;
                }

                if ( callback ) { callback(); } else { return result; }
            }
        );
};
