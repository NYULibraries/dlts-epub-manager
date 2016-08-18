"use strict";

let request   = require( 'sync-request' );
let util  = require( '../../lib/util' );

let em;

module.exports = function( vorpal ){
    em = vorpal.em;

    vorpal.command( 'solr' )
        .description( 'Manage Solr index.' )
        .action(
            function( args, callback ) {
                vorpal.log(  `\`${this.commandWrapper.command}\` run with args:`  );
                vorpal.log( args );

                callback();
            }
        );

    vorpal.command( 'solr add [configuration]' )
        .description( 'Add EPUBs to Solr index.' )
        .autocomplete( util.getConfigFileBasenames( vorpal.em.configDir ) )
        .action(
            function( args, callback ) {
                let result = false;

                if ( args.configuration ) {
                    let loadSucceeded = vorpal.execSync( `load ${args.configuration}`, { fatal : true } );

                    if ( ! loadSucceeded ) {
                        vorpal.log( `ERROR: \`load ${args.configuration}\` failed.` );

                        callback();
                        return;
                    }
                }

                if ( ! vorpal.em.metadata ) {
                    vorpal.log( util.ERROR_METADATA_NOT_LOADED );

                    callback();
                    return;
                }

                let epubs = vorpal.em.metadata.getAll();

                try {
                    let epubsAdded = addEpubs( epubs );

                    vorpal.log( `Added ${epubs.size} EPUBs to Solr index:\n` + epubsAdded.join( '\n' ) );

                    result = true;
                } catch ( error ) {
                    vorpal.log( 'ERROR adding document to Solr index:\n' +
                                error );

                    result = false;
                }

                if ( callback ) { callback(); } else { return result; }
            }
        );

    vorpal.command( 'solr delete [configuration]' )
        .description( 'Delete EPUBs from Solr index.' )
        // This doesn't work right now.  Vorpal automatically expands to 'delete all'.
        // .autocomplete( util.getConfigFileBasenames( vorpal.em.configDir ) )
        .action(
            function( args, callback ) {
                let result = false;

                if ( args.configuration ) {
                    let loadSucceeded = vorpal.execSync( `load ${args.configuration}`, { fatal : true } );

                    if ( ! loadSucceeded ) {
                        vorpal.log( `ERROR: \`load ${args.configuration}\` failed.` );

                        callback();
                        return;
                    }
                }

                if ( ! vorpal.em.metadata ) {
                    vorpal.log( util.ERROR_METADATA_NOT_LOADED );

                    callback();
                    return;
                }

                let epubs = vorpal.em.metadata.getAll();

                epubs.forEach( ( epub ) => {
                    try {
                        deleteEpub( epub );

                        vorpal.log( `Deleted ${epub.identifier} from Solr index.` );

                        result = true;
                    } catch ( error ) {
                        vorpal.log( 'ERROR deleting document from Solr index:\n' +
                                    error );

                        result = false;
                    }
                } );

                vorpal.log( `Deleted ${epubs.size } EPUBs.` );

                if ( callback ) { callback(); } else { return result; }
            }
        );

    vorpal.command( 'solr delete all [configuration]' )
        .description( 'Delete all EPUBs from Solr index.' )
        .autocomplete( util.getConfigFileBasenames( vorpal.em.configDir ) )
        .action(
            function( args, callback ) {
                let result = false;

                if ( args.configuration ) {
                    let loadSucceeded = vorpal.execSync( `load ${args.configuration}`, { fatal : true } );

                    if ( ! loadSucceeded ) {
                        vorpal.log( `ERROR: \`load ${args.configuration}\` failed.` );

                        callback();
                        return;
                    }
                }

                if ( ! vorpal.em.conf ) {
                    vorpal.log( util.ERROR_CONF_NOT_LOADED );

                    callback();
                    return;
                }

                try {
                    deleteAllEpubs();

                    vorpal.log( `Deleted all documents from Solr index for conf "${vorpal.em.conf.name}".` );

                    result = true;
                } catch( error ) {
                    vorpal.log( 'ERROR deleting documents from Solr index:\n' +
                                error
                            );

                    result = false;
                }

                if ( callback ) { callback(); } else { return result; }
            }
        );

    vorpal.command( 'solr full-replace' )
        .description( 'Replace entire Solr index.' )
        .action(
            function( args, callback ) {
                vorpal.log(  `\`${this.commandWrapper.command}\` run with args:`  );
                vorpal.log( args );

                callback();
            }
        );
};

function addEpubs( epubs) {
    let solrUpdateUrl = util.getSolrUpdateUrl( em.conf ) + '/json?commit=true';

    let addRequest = [];
    let epubsAdded = [];

    epubs.forEach( ( epub ) => {
        let doc = { id : epub.identifier };

        Object.keys( epub ).forEach(
            ( key ) => {
                doc[ key ] = epub[ key ];
            }
        );

        addRequest.push( doc );
        epubsAdded.push( epub.identifier );
    } );

    let response = request(
        'POST', solrUpdateUrl, {
            body : JSON.stringify( addRequest )
        }
    );

    if ( response.statusCode !== 200 ) {
        throw response.body.toString();
    }

    return epubsAdded;
}

function deleteEpub( epub ) {
    try {
        deleteEpubsByQuery( 'identifier:' + epub.identifier );
    } catch ( error ) {
        throw error;
    }
}

function deleteAllEpubs() {
    try {
        deleteEpubsByQuery( '*:*' );
    } catch ( error ) {
        throw error;
    }
}

function deleteEpubsByQuery( query ) {
    let requestUrl = util.getSolrUpdateUrl( em.conf ) +
                        `/?commit=true&stream.body=<delete><query>${query}</query></delete>`;

    let response = request( 'GET', requestUrl );

    if ( response.statusCode !== 200 ) {
        throw response.body.toString();
    }
}
