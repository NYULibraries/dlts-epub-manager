"use strict";

const util  = require( '../../lib/util' )

function getAuthorizationHeader( conf ) {
    return 'Basic ' + new Buffer(
           conf.restfulHandleServerUsername +
           ":" +
           conf.restfulHandleServerPassword
    ).toString( 'base64' );
}

function addHandles( conf, request, epubMetadataAll ) {
    const handlesAdded = [];

    epubMetadataAll.forEach( ( epubMetadata ) => {
                                 const bindingUrl = `http://opensquare.nyupress.org/books/${ epubMetadata.identifier }`;

                                 let body = `<?xml version="1.0" encoding="UTF-8"?>
    <hs:info xmlns:hs="info:nyu/dl/v1.0/identifiers/handle">
        <hs:binding>${ bindingUrl }</hs:binding>
        <hs:description></hs:description>
    </hs:info>`;

                                 const url = util.getRestfulHandleServerFullPath( conf ) + '/' +
                                             epubMetadata.handle_local_name_and_prefix;
                                 const authorization = getAuthorizationHeader( conf );

                                 const response = request(
                                     'PUT',
                                     url,
                                     {
                                         body,

                                         headers: {
                                             authorization,
                                             'content-type': 'text/xml'
                                         },
                                     }
                                 );

                                 if ( response.statusCode !== 200 ) {
                                     throw response.body.toString();
                                 }

                                 handlesAdded.push(
                                     `${epubMetadata.identifier}: ${epubMetadata.handle_local_name_and_prefix}`
                                 );
                             }
    );

    return handlesAdded;
}

function deleteHandles( conf, request, epubMetadataAll ) {
    const handlesDeleted = [];

    epubMetadataAll.forEach( ( epubMetatdata ) => {
        try {
            deleteHandle( conf, request, epubMetatdata );

            handlesDeleted.push(
                `${epubMetatdata.identifier}: ${epubMetatdata.handle_local_name_and_prefix}`
            );
        } catch ( error ) {
            throw error;
        }
    } );

    return handlesDeleted;
}

function deleteHandle( conf, request, epubMetadata ) {
    const requestUrl = util.getRestfulHandleServerFullPath( conf ) + '/' +
                       epubMetadata.handle_local_name_and_prefix;

    const authorization = getAuthorizationHeader( conf );

    const response = request( 'DELETE', requestUrl,
                                 { headers: { authorization } } );

    if ( response.statusCode !== 200 ) {
        throw response.body.toString();
    }
}

module.exports = {
    addHandles,
    deleteHandles,
}
