"use strict";

let async = require( 'async' );
let solr  = require( 'solr-client' );

let client;

module.exports = function( vorpal ){
    vorpal.log( `Loaded ${ __filename }.` );

    vorpal.command( 'solr' )
        .option( '--dry-run', 'Print actions taken but do not execute them.' )
        .description( 'Manage Solr index.' )
        .action(
            function( args, callback ) {
                let result = false;

                vorpal.log(  `\`${this.commandWrapper.command}\` run with args:`  );
                vorpal.log( args );

                // If called via `.execSync`, `callback` will be undefined,
                // and return values will be used as response.
                if ( callback ) { callback(); }
                return result;
            }
        );

    vorpal.command( 'solr add [configuration]' )
        .option( '--dry-run', 'Print actions taken but do not execute them.' )
        .description( 'Add EPUBs to Solr index.' )
        .action(
            function( args, callback ) {
                let result = false;

                if ( args.configuration ) {
                    let loadSucceeded = vorpal.execSync( `load ${args.configuration}`, { fatal : true } );

                    if ( ! loadSucceeded ) {
                        vorpal.log( `ERROR: \`load ${args.configuration}\` failed.` );

                        if ( callback ) { callback(); }
                        return false;
                    }
                }

                client = setupClient( vorpal.em.conf );

                if ( ! vorpal.em.metadata ) {
                    vorpal.log( vorpal.util.ERROR_METADATA_NOT_LOADED );

                    if ( callback ) { callback(); }
                    return result;
                }

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

                vorpal.log( `Queued Solr add/update job for conf=${vorpal.em.conf.name}:` +
                            `${epubs.size } EPUBs.` );

                // If called via `.execSync`, `callback` will be undefined,
                // and return values will be used as response.
                if ( callback ) { callback(); }
                return result;
            }
        );

    vorpal.command( 'solr delete' )
        .option( '--dry-run', 'Print actions taken but do not execute them.' )
        .description( 'Delete EPUBs from Solr index.' )
        .action(
            function( args, callback ) {
                let result = false;

                vorpal.log(  `\`${this.commandWrapper.command}\` run with args:`  );
                vorpal.log( args );

                // If called via `.execSync`, `callback` will be undefined,
                // and return values will be used as response.
                if ( callback ) { callback(); }
                return result;
            }
        );

    vorpal.command( 'solr delete all' )
        .option( '--dry-run', 'Print actions taken but do not execute them.' )
        .description( 'Delete all EPUBs from Solr index.' )
        .action(
            function( args, callback ) {
                let result = false;

                vorpal.log(  `\`${this.commandWrapper.command}\` run with args:`  );
                vorpal.log( args );

                // If called via `.execSync`, `callback` will be undefined,
                // and return values will be used as response.
                if ( callback ) {
                    callback();
                } else {
                    return result;
                }
            }
        );

    vorpal.command( 'solr full-replace' )
        .option( '--dry-run', 'Print actions taken but do not execute them.' )
        .description( 'Replace entire Solr index.' )
        .action(
            function( args, callback ) {
                let result = false;

                vorpal.log(  `\`${this.commandWrapper.command}\` run with args:`  );
                vorpal.log( args );

                // If called via `.execSync`, `callback` will be undefined,
                // and return values will be used as response.
                if ( callback ) { callback(); }
                return result;
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
                    callback( null, `Added ${id}.` );
                } else {
                    callback( null, `Added ${id}.  Status code: ${status}` );
                }
            }
        }
    );
}

function deleteEpub( epubId ) {

}

function deleteAllEpubs() {

}
