"use strict";

let fs   = require( 'fs' );
let path = require( 'path' );

let util = require( '../../util' );

const CONFIG_FILE_EXTENSION = '.json',
      HANDLE_SERVER         = 'http://hdl.handle.net';


module.exports = function( vorpal ) {
    vorpal.command( 'load <configuration>' )
        .description( 'Read in configuration file and load resources.' )
        .option( '--dry-run', 'Print actions taken but do not execute them.' )
        .autocomplete( getConfigFileBasenames( vorpal.em.configDir ) )
        .action(
            ( args, callback ) => {
                let configFile = vorpal.em.configDir + '/' +
                                 args.configuration + CONFIG_FILE_EXTENSION;
                let configFileBasename = path.basename( configFile );

                let conf = require( configFile );

                let metadataDir = conf.metadataDir;
                if ( ! metadataDir ) {
                    vorpal.log( `ERROR in ${configFileBasename}: reqired "metadataDir" is missing.`);

                    if ( callback ) { callback(); }
                    return false;
                }
                if ( ! fs.existsSync( metadataDir ) ) {
                    vorpal.log( `ERROR in ${configFileBasename}: ${metadataDir} does not exist!` );

                    if ( callback ) { callback(); }
                    return false;
                }

                let epubList = [];
                if ( conf.epubList ) {
                    if ( ! Array.isArray( conf.epubList ) ) {
                        vorpal.log(
                            `ERROR in ${configFileBasename}: "epubList" must be an array.`
                        );

                        if ( callback ) { callback(); }
                        return false;
                    }

                    let invalidEpubIds = getInvalidEpubIds( conf.epubList );

                    if ( invalidEpubIds ) {
                        vorpal.log(
                            `ERROR in ${configFileBasename}: The following EPUB ids are invalid:\n` +
                            invalidEpubIds.map(
                                ( epubId ) => { return '  ' + epubId + '\n'; }
                            )
                        );

                        if ( callback ) { callback(); }
                        return false;
                    }

                    epubList = conf.epubList;
                } else {
                    epubList = getEpubListFromDirectory( conf.metadataDir );
                }

                let metadata = getMetadataForEpubs( metadataDir, epubList );

                if ( conf.cacheMetadataInMemory ) {
                    vorpal.em.metadata = {
                        dump : () => {
                            return JSON.stringify( metadata, null, 4 );
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

                vorpal.em.conf = conf;

                if ( callback ) { callback(); }
                return true;
            }
        );

    vorpal.command( 'load write [file]' )
        .description( 'Write metadata out to file.' )
        .option( '--dry-run', 'Print actions taken but do not execute them.' )
        .action(
            ( args, callback ) => {
                let result = false;
                let dumpFile = args.file ? args.file : 'cache/metadata.json';

                if ( vorpal.em.metadata ) {
                    try {
                        fs.writeFileSync( dumpFile, vorpal.em.metadata.dump() );

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

};

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

function getConfigFileBasenames( configDir ) {
    let filenames = [];

    try {
        filenames = fs.readdirSync( configDir ).filter(
            ( filename ) => {
                return path.extname( filename ) === CONFIG_FILE_EXTENSION;
            }
        );
    } catch ( e ) {
        if ( e ) {
            if ( e.code === 'ENOENT' ) {
                console.error( `The config directory ${configDir}/ does not exist!` );
                process.exit( e.code );
            }
        }
    }

    return filenames.map(
        ( filename ) => {
            return path.basename( filename, CONFIG_FILE_EXTENSION );
        }
    );
}

function getMetadataForEpubs( metadataDir, epubList ) {
    let metadata = new Map();

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
    metadata.handle = `${HANDLE_SERVER}/${metadata.handle}`;

    return metadata;
}
