"use strict";

const _    = require( 'lodash' );

const util = require( '../../lib/util' );

function addEpubs( conf, request, epubMetadataAll) {
    const solrUpdateUrl = util.getSolrUpdateUrl( conf ) + '/json?commit=true';

    const addRequest = [];
    const epubsAdded = [];

    epubMetadataAll.forEach( ( epubMetadata ) => {
        let doc = { id : epubMetadata.identifier };

        Object.keys( epubMetadata ).forEach(
            ( key ) => {
                doc[ key ] = epubMetadata[ key ];
            }
        );

        // Filter out any metadata fields that don't need to go into Solr
        doc = _.pick( doc, util.SOLR_FIELDS );

        addRequest.push( doc );
        epubsAdded.push( epubMetadata.identifier );
    } );

    const response = request(
        'POST', solrUpdateUrl, {
            body : JSON.stringify( addRequest )
        }
    );

    if ( response.statusCode !== 200 ) {
        throw response.body.toString();
    }

    return epubsAdded;
}

function deleteEpub( conf, request, epubMetadata ) {
    try {
        deleteEpubsByQuery( conf, request, 'identifier:' + epubMetadata.identifier );
    } catch ( error ) {
        throw error;
    }
}

function deleteAllEpubs( conf, request ) {
    try {
        deleteEpubsByQuery( conf, request, '*:*' );
    } catch ( error ) {
        throw error;
    }
}

function deleteEpubsByQuery( conf, request, query ) {
    const requestUrl = util.getSolrUpdateUrl( conf ) +
                       `/?commit=true&stream.body=<delete><query>${query}</query></delete>`;

    const response = request( 'GET', requestUrl );

    if ( response.statusCode !== 200 ) {
        throw response.body.toString();
    }
}

module.exports = {
    addEpubs,
    deleteAllEpubs,
    deleteEpub,
};
