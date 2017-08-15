"use strict";

let util  = require( '../../lib/util' );

let em;

module.exports = function( vorpal ){
    em = vorpal.em;

    vorpal.command( 'handles add [configuration]' )
        .description( 'Bind EPUB handles.' )
        .autocomplete( util.getConfigFileBasenames( vorpal.em.configDir ) )
        .action(
            function( args, callback ) {
                if ( args.configuration ) {
                    let loadSucceeded = vorpal.execSync( `load ${args.configuration}`, { fatal : true } );

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

                let epubs = vorpal.em.metadata.getAll();

                try {

                    let handlesAdded = addHandles( epubs );

                    vorpal.log(
                        `Added ${epubs.size} handles to handles server:\n` + handlesAdded.join( '\n' )
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
                    let loadSucceeded = vorpal.execSync( `load ${args.configuration}`, { fatal : true } );

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

                let epubs = vorpal.em.metadata.getAll();

                try {

                    let handlesDeleted = deleteHandles( epubs );

                    vorpal.log(
                        `Deleted ${epubs.size} handles from handles server:\n` + handlesDeleted.join( '\n' )
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

function addHandles( epubs ) {
    let handlesAdded = [];

    epubs.forEach( ( epub ) => {
            let bindingHostnameFor = {
                'oa-books'        : 'openaccessbooks.nyupress.org',
                'connected-youth' : 'connectedyouth.nyupress.org',
            };

            let body = `<?xml version="1.0" encoding="UTF-8"?>
    <hs:info xmlns:hs="info:nyu/dl/v1.0/identifiers/handle">
        <hs:binding>http://${bindingHostnameFor[ epub.collection_code ]}/details/${epub.identifier}</hs:binding>
        <hs:description></hs:description>
    </hs:info>`;

            let url = util.getRestfulHandleServerFullPath( em.conf ) + '/' +
                      epub.handle_local_name_and_prefix;
            let authorization = getAuthorizationHeader( em.conf );

            let response = em.request(
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
                `${epub.identifier}: ${epub.handle_local_name_and_prefix}`
            );
        }
    );

    return handlesAdded;
}

function deleteHandles( epubs ) {
    let handlesDeleted = [];

    epubs.forEach( ( epub ) => {
        try {
            deleteHandle( epub );

            handlesDeleted.push(
                `${epub.identifier}: ${epub.handle_local_name_and_prefix}`
            );
        } catch ( error ) {
            throw error;
        }
    } );

    return handlesDeleted;
}

function deleteHandle( epub ) {
    let requestUrl = util.getRestfulHandleServerFullPath( em.conf ) + '/' +
                     epub.handle_local_name_and_prefix;

    let authorization = getAuthorizationHeader();

    let response = em.request( 'DELETE', requestUrl,
        { headers: { authorization } } );

    if ( response.statusCode !== 200 ) {
        throw response.body.toString();
    }
}