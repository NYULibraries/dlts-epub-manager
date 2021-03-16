"use strict";

const fs        = require( 'fs' );
const path      = require( 'path' );

const helpers = require( '../../lib/command-helpers/load' );
const util = require( '../../lib/util' );

let em;

module.exports = function( vorpal ) {
    em = vorpal.em;

    vorpal.command( 'load <configuration>' )
        .description( 'Read in configuration file and load resources.' )
        .autocomplete( util.getConfigFileBasenames( vorpal.em.configDir ) )
        .action(
            ( args, callback ) => {
                em.clearCache();

                // Get configuration
                const configFile = vorpal.em.configDir + '/' +
                                 args.configuration + util.CONFIG_FILE_EXTENSION;
                const configFileBasename = path.basename( configFile );

                em.conf = require( configFile );
                em.conf.name = args.configuration

                // Get private configuration
                const configPrivateFile = vorpal.em.configPrivateDir + '/' +
                                        args.configuration + util.CONFIG_FILE_EXTENSION;
                if ( ! fs.existsSync( configPrivateFile ) ) {
                    vorpal.log( `ERROR: ${configPrivateFile} does not exist.` +
                                ' Please refer to README.md for information'  +
                                ' about private configuration files.'
                    );

                    if ( callback ) { callback(); }
                    return false;
                }
                const confPrivate = require( configPrivateFile );
                // The private config file is not a general-purpose override file.
                // We do not want to allow accidental overwriting of values from
                // the main config file, so we just cherry-pick what we need.
                em.conf.restfulHandleServerUsername = confPrivate.restfulHandleServerUsername;
                em.conf.restfulHandleServerPassword = confPrivate.restfulHandleServerPassword;
                em.conf.supafolioApiKey             = confPrivate.supafolioApiKey;

                let metadataDir;
                try {
                    metadataDir = util.getMetadataDir( em );
                } catch( error ) {
                    vorpal.log( `ERROR in ${configFileBasename}: ${error}` );

                    if ( callback ) { callback(); }
                    return false;
                }

                let metadataEpubList = [];
                try {
                    metadataEpubList = helpers.getEpubList( em.conf, 'metadataEpubList', metadataDir );
                } catch ( e ) {
                    vorpal.log(
                        `ERROR in ${configFileBasename}: ${e}`
                    );

                    if ( callback ) { callback(); }
                    return false;
                }

                const metadata = helpers.getMetadataForEpubs( metadataDir, metadataEpubList );

                if ( em.conf.cacheMetadataInMemory ) {
                    vorpal.em.metadata = {
                        dump : () => {
                            return JSON.stringify( metadata, null, 4 );
                        },
                        dumpCanonical : () => {
                            return util.jsonStableStringify( metadata );
                        },
                        getAll : () => {
                            return metadata;
                        },
                        get : ( epubId ) => {
                            return metadata.get( epubId );
                        }
                    };
                } else {
                    vorpal.log( 'Sorry, but "cacheMetadataInMemory: true" must be' +
                        ' set in the conf file.  Writing metadata out to file(s)'  +
                        ' for high-volume EPUB processing is not implemented yet.'
                    );

                    if ( callback ) { callback(); }
                    return false;
                }

                em.intakeEpubList = [];
                try {
                    em.intakeEpubList = helpers.getEpubList( em.conf, 'intakeEpubList', em.conf.intakeEpubDir );
                } catch ( e ) {
                    vorpal.log(
                        `ERROR in ${configFileBasename}: ${e}`
                    );

                    if ( callback ) { callback(); }
                    return false;
                }

                if ( callback ) { callback(); }
                return true;
            }
        );

    vorpal.command( 'load write [file]' )
        .description( 'Write metadata out to file.' )
        .action(
            ( args, callback ) => {
                let result = false;
                const dumpFile = args.file ? args.file : `${vorpal.em.cacheDir}/metadata.json`;

                if ( vorpal.em.metadata ) {
                    try {
                        fs.writeFileSync( dumpFile, vorpal.em.metadata.dump() );
                        vorpal.log( `Metadata dumped to ${dumpFile}.` );
                        result = true;
                    } catch( e ) {
                        vorpal.log(
                            `ERROR in "load write ${dumpFile}": `
                        );
                        vorpal.log( e.message );

                        result = false;
                    }

                } else {
                    vorpal.log( util.ERROR_METADATA_NOT_LOADED );

                    result = false;
                }

                if ( callback ) { callback(); }
                return result;
            }
        );

    vorpal.command( 'load clear' )
        .description( 'Clear all loaded metadata.' )
        .action(
            ( args, callback ) => {
                delete vorpal.em.metadata;

                if ( callback ) { callback(); }
                return true;
            }
        );
};
