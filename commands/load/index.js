"use strict";

let fs   = require( 'fs' );
let path = require( 'path' );

let util = require( '../../util' );

const CONFIG_FILE_EXTENSION = '.json';

module.exports = function( vorpal ) {
    vorpal.command( 'load <configuration>' )
        .description( 'Read in configuration file and load resources.' )
        .option( '--dry-run', 'Print actions taken but do not execute them.' )
        .autocomplete( getConfigFileBasenames( vorpal.em.configDir ) )
        .action(
            ( args, callback ) => {
                let result = false;

                let configFile = vorpal.em.configDir + '/' +
                                 args.configuration + CONFIG_FILE_EXTENSION;
                let configFileBasename = path.basename( configFile );

                let conf = require( configFile );

                let metadataDir = conf.metadataDir;
                if ( ! fs.existsSync( metadataDir ) ) {
                    vorpal.log( `ERROR in ${configFileBasename}: ${metadataDir} does not exist!` );

                    if ( callback ) { callback(); }
                    return false;
                }

                let epubList = [];
                if ( conf.epubList ) {
                    let invalidEpubIds = getInvalidEpubIds( conf.epubList );

                    if ( invalidEpubIds ) {
                        vorpal.log(
                            `ERROR in ${configFileBasename}: 'The following EPUB ids are invalid:\n'` +
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

                } else {
                    vorpal.log( 'Sorry, but "cacheMetadataInMemory: true" must be' +
                        ' set in the conf file.  Writing metadata out to file(s)'  +
                        ' for high-volume EPUB processing is not implemented yet.'
                    );

                    if ( callback ) { callback(); }
                    return false;
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
    let metadata = {};

    epubList.forEach( ( epubId ) => {
        metadata[ epubId ] = getMetadataForEpub( `${metadataDir}/${epubId}` );
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

    return metadata;
}
