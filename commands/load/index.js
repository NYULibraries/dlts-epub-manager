"use strict";

let execSync  = require( 'child_process' ).execSync;
let fs        = require( 'fs' );
let path      = require( 'path' );

let util = require( '../../lib/util' );

let em;

const HANDLE_SERVER = 'http://hdl.handle.net';


module.exports = function( vorpal ) {
    em = vorpal.em;

    vorpal.command( 'load <configuration>' )
        .description( 'Read in configuration file and load resources.' )
        .autocomplete( util.getConfigFileBasenames( vorpal.em.configDir ) )
        .action(
            ( args, callback ) => {
                em.clearCache();

                let configFile = vorpal.em.configDir + '/' +
                                 args.configuration + util.CONFIG_FILE_EXTENSION;
                let configFileBasename = path.basename( configFile );

                let conf = require( configFile );

                let configPrivateFile = vorpal.em.configPrivateDir + '/' +
                                        args.configuration + util.CONFIG_FILE_EXTENSION;
                if ( ! fs.existsSync( configPrivateFile ) ) {
                    vorpal.log( `ERROR: ${configPrivateFile} does not exist.` +
                                ' Please refer to README.md for information'  +
                                ' about private configuration files.'
                    );

                    if ( callback ) { callback(); }
                    return false;
                }

                let confPrivate = require( configPrivateFile );

                // The private config file is not a general-purpose override file.
                // We do not want to allow accidental overwriting of values from
                // the main config file, so we just cherry-pick what we need.
                conf.restfulHandleServerUsername = confPrivate.restfulHandleServerUsername;
                conf.restfulHandleServerPassword = confPrivate.restfulHandleServerPassword;

                let metadataDir;
                try {
                    metadataDir = getMetadataDir( conf );
                } catch( error ) {
                    vorpal.log( `ERROR in ${configFileBasename}: ${error}` );

                    if ( callback ) { callback(); }
                    return false;
                }

                let metadataEpubList = [];
                try {
                    metadataEpubList = getEpubList( conf, 'metadataEpubList', metadataDir );
                } catch ( e ) {
                    vorpal.log(
                        `ERROR in ${configFileBasename}: ${e}`
                    );

                    if ( callback ) { callback(); }
                    return false;
                }

                let metadata = getMetadataForEpubs( metadataDir, metadataEpubList );

                if ( conf.cacheMetadataInMemory ) {
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
                    em.intakeEpubList = getEpubList( conf, 'intakeEpubList', conf.intakeEpubDir );
                } catch ( e ) {
                    vorpal.log(
                        `ERROR in ${configFileBasename}: ${e}`
                    );

                    if ( callback ) { callback(); }
                    return false;
                }
                
                vorpal.em.conf = conf;
                vorpal.em.conf.name = args.configuration;

                if ( callback ) { callback(); }
                return true;
            }
        );

    vorpal.command( 'load write [file]' )
        .description( 'Write metadata out to file.' )
        .action(
            ( args, callback ) => {
                let result = false;
                let dumpFile = args.file ? args.file : `${vorpal.em.cacheDir}/metadata.json`;

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

function getMetadataDir( conf ) {
    let metadataDir              = conf.metadataDir;
    let metadataRepo             = conf.metadataRepo;
    let metadataRepoBranch       = conf.metadataRepoBranch;
    let metadataRepoSubdirectory = conf.metadataRepoSubdirectory;

    if ( metadataDir ) {
        // Assume that non-absolute paths are relative to root dir
        if ( ! path.isAbsolute( metadataDir ) ) {
            metadataDir = `${em.rootDir}/${metadataDir}`;
        }

        if ( ! fs.existsSync( metadataDir ) ) {
            throw `${metadataDir} does not exist!`;
        }

        return metadataDir;
    } else if ( metadataRepo ) {
        let clonedRepoDir = `${em.cacheDir}/metadataRepo`;

        let cmd = `git clone ${metadataRepo} ${clonedRepoDir}`;
        execSync( cmd );

        if ( metadataRepoBranch ) {
            cmd = `git checkout ${metadataRepoBranch}`;
            execSync( cmd , { cwd: clonedRepoDir } );
        }

        let metadataDirFromRepo = clonedRepoDir;
        if ( metadataRepoSubdirectory ) {
            metadataDirFromRepo = `${metadataDirFromRepo}/${metadataRepoSubdirectory}`;
        }

        return metadataDirFromRepo;
    } else {
        throw util.ERROR_CONF_MISSING_METADATA_DIR;
    }
}

function getEpubListFromDirectory( dir ) {
    let epubList = fs.readdirSync( dir ).filter(
        ( filename ) => {
            return util.isValidNormalizedIsbn13( filename );
        }
    );

    return epubList.length > 0 ? epubList : null;
}

function getInvalidEpubIds( epubIds ) {
    let invalidEpubIds = [];

    epubIds.forEach( ( epubId )=> {
        if ( ! util.isValidNormalizedIsbn13( epubId ) ) {
            invalidEpubIds.push( epubId );
        }
    } );

    return invalidEpubIds.length > 0 ? invalidEpubIds : null;
}

function getMetadataForEpubs( metadataDir, epubList ) {
    let metadata = new Map();

    if ( ! epubList ) {
        return metadata;
    }

    epubList.forEach( ( epubId ) => {
        metadata.set( epubId, getMetadataForEpub( `${metadataDir}/${epubId}` ) );
    } );

    return metadata;
}

function getMetadataForEpub( epubDir ) {
    // Order is lowest priority to highest priority
    let metadataFilesInPriorityOrder =
        [
            'intake-descriptive.json',
            'dlts-descriptive.json',
            `dlts-administrative.json`
        ]
        .map( ( file ) => { return `${epubDir}/${file}`; } );

    let metadata = {};
    metadataFilesInPriorityOrder.forEach( ( file ) => {
        if ( fs.existsSync( file ) ) {
            Object.assign( metadata, require( file ) );
        }
    } );

    // TODO: Maybe figure out a better way to do this.  Maybe add "handleUrl" to
    // metadata and change Solr schema and website queries to use that instead of
    // handle.
    metadata.handle_local_name_and_prefix = metadata.handle;
    metadata.handle = `${HANDLE_SERVER}/${metadata.handle}`;

    return metadata;
}

function getEpubList( conf, epubListType, directory ) {
    var confEpubList = conf[ epubListType ];

    if ( confEpubList ) {
        if ( ! Array.isArray( confEpubList ) ) {
            throw( `"${epubListType}" must be an array.` );
        }

        let invalidEpubIds = getInvalidEpubIds( confEpubList );

        if ( invalidEpubIds ) {
            throw( 'The following EPUB ids are invalid:\n' +
                invalidEpubIds.map(
                    ( epubId ) => { return '  ' + epubId + '\n'; }
                )
            );
        }

        return confEpubList;
    } else {
        return getEpubListFromDirectory( directory );
    }
}
