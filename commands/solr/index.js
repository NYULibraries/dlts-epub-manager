"use strict";

let solr = require( 'solr-client' );

let client = setupClient();

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
                if ( callback ) {
                    callback();
                } else {
                    return result;
                }
            }
        );

    vorpal.command( 'solr add' )
        .option( '--dry-run', 'Print actions taken but do not execute them.' )
        .description( 'Add EPUBs to Solr index.' )
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
                if ( callback ) {
                    callback();
                } else {
                    return result;
                }
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
                if ( callback ) {
                    callback();
                } else {
                    return result;
                }
            }
        );
};

function setupClient() {
    let client = solr.createClient();

    client.autoCommit = true;

    return client;
}

function addEpub( epubId ) {

}

function deleteEpub( epubId ) {

}

function deleteAllEpubs() {

}
