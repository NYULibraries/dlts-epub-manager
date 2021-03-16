"use strict";

const fs   = require( 'fs' );
const path = require( 'path' );

const util = require( '../../lib/util' );

const HANDLE_SERVER = 'http://hdl.handle.net';

function getEpubList( conf, epubListType, directory ) {
    var confEpubList = conf[ epubListType ];

    if ( confEpubList ) {
        if ( !Array.isArray( confEpubList ) ) {
            throw(
                `"${epubListType}" must be an array.`
            );
        }

        const invalidEpubIds = getInvalidEpubIds( confEpubList );

        if ( invalidEpubIds ) {
            throw(
                'The following EPUB ids are invalid:\n' +
                invalidEpubIds.map(
                    ( epubId ) => {
                        return '  ' + epubId + '\n';
                    }
                )
            );
        }

        return confEpubList;
    } else {
        // Not required that there be a directory if no explicit epub list is
        // given in the conf file.  We assume that caller is making the decision
        // about what epub list stuff is mandatory in the conf file.
        if ( directory ) {
            return getEpubListFromDirectory( directory );
        } else {
            return [];
        }
    }
}

function getEpubListFromDirectory( dir ) {
    const epubList = fs.readdirSync( dir )
        .map(
            ( filename ) => {
                // Argument could be either a subdirectory named after an ISBN or [ISBN].epub
                return path.basename( filename.toLowerCase(), '.epub' );
            } )
        .filter(
            ( isbn ) => {

                return util.isValidNormalizedIsbn13( isbn );
            }
        );

    return epubList.length > 0 ? epubList : null;
}

function getInvalidEpubIds( epubIds ) {
    const invalidEpubIds = [];

    epubIds.forEach( ( epubId ) => {
        if ( !util.isValidNormalizedIsbn13( epubId ) ) {
            invalidEpubIds.push( epubId );
        }
    } );

    return invalidEpubIds.length > 0 ? invalidEpubIds : null;
}

function getMetadataForEpub( explodedEpubDir ) {
    // Order is lowest priority to highest priority
    const metadataFilesInPriorityOrder =
        [
            'intake-descriptive.json',
            'dlts-descriptive.json',
            `dlts-administrative.json`
        ]
            .map( ( file ) => {
                return `${explodedEpubDir}/${file}`;
            } );

    const metadata = {};
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

function getMetadataForEpubs( metadataDir, epubList ) {
    const metadata = new Map();

    if ( !epubList ) {
        return metadata;
    }

    epubList.forEach( ( epubId ) => {
        metadata.set( epubId, getMetadataForEpub( `${metadataDir}/${epubId}` ) );
    } );

    return metadata;
}

module.exports = {
    getEpubList,
    getMetadataForEpubs,
};
