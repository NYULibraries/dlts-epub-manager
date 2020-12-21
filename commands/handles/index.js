"use strict";

const util  = require( '../../lib/util' );

let em;

module.exports = function( vorpal ){
    em = vorpal.em;

    vorpal.command( 'handles add [configuration]' )
        .description( 'Bind EPUB handles.' )
        .autocomplete( util.getConfigFileBasenames( vorpal.em.configDir ) )
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

                if ( ! vorpal.em.metadata ) {
                    vorpal.log( util.ERROR_METADATA_NOT_LOADED );

                    if ( callback ) { callback(); }
                    return false;
                }

                const epubMetadataAll = vorpal.em.metadata.getAll();

                try {

                    const handlesAdded = addHandles( epubMetadataAll );

                    vorpal.log(
                        `Added ${epubMetadataAll.size} handles to handles server:\n` + handlesAdded.join( '\n' )
                    );

                    if ( callback ) { callback(); }
                    return true;
                } catch ( error ) {
                    vorpal.log( 'ERROR adding handle to handle server:\n' +
                                error );

                    if ( callback ) { callback(); }
                    return false;
                }

            }
        );

    vorpal.command( 'handles delete [configuration]' )
        .description( 'Unbind EPUB handles.' )
        .autocomplete( util.getConfigFileBasenames( vorpal.em.configDir ) )
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

                if ( ! vorpal.em.metadata ) {
                    vorpal.log( util.ERROR_METADATA_NOT_LOADED );

                    if ( callback ) { callback(); }
                    return false;
                }

                const epubMetadataAll = vorpal.em.metadata.getAll();

                try {

                    const handlesDeleted = deleteHandles( epubMetadataAll );

                    vorpal.log(
                        `Deleted ${epubMetadataAll.size} handles from handles server:\n` + handlesDeleted.join( '\n' )
                    );

                    if ( callback ) { callback(); }
                    return true;
                } catch ( error ) {
                    vorpal.log( 'ERROR deleting handle from handle server:\n' +
                                error );

                    if ( callback ) { callback(); }
                    return false;
                }
            }
        );
};

function getAuthorizationHeader() {
    return 'Basic ' + new Buffer(
                              em.conf.restfulHandleServerUsername +
                              ":" +
                              em.conf.restfulHandleServerPassword
                          ).toString( 'base64' );
}

function addHandles( epubMetadataAll ) {
    const handlesAdded = [];

    epubMetadataAll.forEach( ( epubMetadata ) => {
            const bindingUrl = `http://opensquare.nyupress.org/books/${ epubMetadata.identifier }`;

            let body = `<?xml version="1.0" encoding="UTF-8"?>
    <hs:info xmlns:hs="info:nyu/dl/v1.0/identifiers/handle">
        <hs:binding>${ bindingUrl }</hs:binding>
        <hs:description></hs:description>
    </hs:info>`;

            const url = util.getRestfulHandleServerFullPath( em.conf ) + '/' +
                      epubMetadata.handle_local_name_and_prefix;
            const authorization = getAuthorizationHeader( em.conf );

            const response = em.request(
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

function deleteHandles( epubMetadataAll ) {
    const handlesDeleted = [];

    epubMetadataAll.forEach( ( epubMetatdata ) => {
        try {
            deleteHandle( epubMetatdata );

            handlesDeleted.push(
                `${epubMetatdata.identifier}: ${epubMetatdata.handle_local_name_and_prefix}`
            );
        } catch ( error ) {
            throw error;
        }
    } );

    return handlesDeleted;
}

function deleteHandle( epubMetadata ) {
    const requestUrl = util.getRestfulHandleServerFullPath( em.conf ) + '/' +
                     epubMetadata.handle_local_name_and_prefix;

    const authorization = getAuthorizationHeader();

    const response = em.request( 'DELETE', requestUrl,
        { headers: { authorization } } );

    if ( response.statusCode !== 200 ) {
        throw response.body.toString();
    }
}
