"use strict";

let solr = require( 'solr-client' );

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

                for ( let epub of epubs ) {
                    let epubId       = epub[ 0 ];
                    let epubMetadata = epub[ 1 ];

                    vorpal.log( `Adding ${epub} to Solr index...` );

                    // See header comment for this function.  Need to pass in vorpal
                    // to log any errors as they happen.  Haven't been able to figure
                    // out any way for this function to pass an error to caller
                    // in variable or exception.
                    addEpub( epubId, epubMetadata, vorpal );
                }

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

    client.autoCommit = true;

    client.options.host = conf.solrHost;
    client.options.port = conf.solrPort;
    client.options.path = conf.solrPath;

    return client;
}

// This function takes a logger because haven't been able to figure out how to
// record the error and get it back to caller.
// The challenge is that the callback passed to client.add() is called asynchronously
// so can't assign err to an error variable in the outer scope because the
// function will return before that callback is even executed.
// Can't re-throw the err object because the caller is inside the solr-client
// module.
// Best I can think of for the moment is to log it.  Note that the caller has no
// way of controlling when the log output appears.
function addEpub( id, metadata, logger ) {
    let doc = {id};

    Object.keys( metadata ).forEach(
        ( key ) => {
            doc[key] = metadata[key];
        }
    );

    client.add(
        doc, ( err, obj ) => {
            if ( err ) {
                logger.log( `ERROR adding ${id}:\n` +
                            JSON.stringify( err, null, 4 ) );
            }
        }
    );
}

function deleteEpub( epubId ) {

}

function deleteAllEpubs() {

}
