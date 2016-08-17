"use strict";

let async = require( 'async' );
let request   = require( 'sync-request' );
let solr  = require( 'solr-client' );

let util  = require( '../../lib/util' );

let client;
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

                client = setupClient( vorpal.em.conf );

                let epubs = vorpal.em.metadata.getAll();

                async.mapSeries( epubs, addEpub, ( error, results ) => {
                    if ( error ) {
                        vorpal.log( 'ERROR adding to Solr index:\n' +
                            JSON.stringify( error, null, 4 )
                        );
                    } else {
                        results.forEach( ( result ) => {
                            vorpal.log( result );
                        });
                    }
                } );

                vorpal.log( `Queued Solr add/update job for conf "${vorpal.em.conf.name}": ` +
                            `${epubs.size } EPUBs.` );

                callback();
            }
        );

    vorpal.command( 'solr delete [configuration]' )
        .description( 'Delete EPUBs from Solr index.' )
        // This doesn't work right now.  Vorpal automatically expands to 'delete all'.
        // .autocomplete( util.getConfigFileBasenames( vorpal.em.configDir ) )
        .action(
            function( args, callback ) {
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
                    } catch ( error ) {
                        vorpal.log( 'ERROR deleting documents from Solr index:\n' +
                                    error );
                    }
                } );

                vorpal.log( `Deleted ${epubs.size } EPUBs.` );

                callback();
            }
        );

    vorpal.command( 'solr delete all [configuration]' )
        .description( 'Delete all EPUBs from Solr index.' )
        .autocomplete( util.getConfigFileBasenames( vorpal.em.configDir ) )
        .action(
            function( args, callback ) {
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
                } catch( error ) {
                    vorpal.log( 'ERROR deleting documents from Solr index:\n' +
                                error
                            );
                }

                vorpal.log( `Deleted all documents from Solr index for conf "${vorpal.em.conf.name}".` );

                callback();
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

function setupClient( conf ) {
    let client = solr.createClient();

    // This doesn't seem to do anything.  Also looked through the code and tests
    // and found no reference to this option.
    // client.autoCommit = true;
    
    client.options.host = conf.solrHost;
    client.options.port = conf.solrPort;
    client.options.path = conf.solrPath;

    return client;
}

// Designed to be iteratee function for async.mapSeries()
function addEpub( epub, callback ) {
    let id       = epub[ 0 ];
    let metadata = epub[ 1 ];
    let doc      = { id };

    Object.keys( metadata ).forEach(
        ( key ) => {
            doc[key] = metadata[key];
        }
    );

    client.add(
        doc, { commitWithin : 3000 }, ( error, obj ) => {
            if ( error ) {
                callback( JSON.stringify( error, null, 4 ) );
            } else {
                // Not sure if a status check is necessary or not.  Maybe if
                // status is non-zero there will always been an error thrown?
                let status = obj.responseHeader.status;
                if ( status === 0 ) {
                    callback( null, `Added ${id} to Solr index.` );
                } else {
                    callback( null, `Added ${id} to Solr index.  Status code: ${status}` );
                }
            }
        }
    );
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
