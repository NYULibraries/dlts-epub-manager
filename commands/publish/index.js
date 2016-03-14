"use strict";

module.exports = function( vorpal ){
    vorpal.log( `Loaded ${ __filename }.` );

    function publish( subCommand ) {

        function publishStep( command ) {
            if ( vorpal.execSync( `${command} ${subCommand}`, { fatal : true } ) ) {
                return true;
            } else {
                vorpal.log(
                    `ERROR: publication step \`${command} ${subCommand}\` failed.  ` +
                    'Please fix the problem and re-run.' );
                return false;
            }
        }

        if ( ! publishStep( 'content'      ) ) { return false; }
        if ( ! publishStep( 'solr'         ) ) { return false; }
        if ( ! publishStep( 'handles'      ) ) { return false; }
        if ( ! publishStep( 'readium-json' ) ) { return false; }
        if ( ! publishStep( 'verify'       ) ) { return false; }

        return true;
    }

    vorpal.command( 'publish' )
        .option( '--dry-run', 'Print actions taken but do not execute them.' )
        .description( 'Publish EPUBs.' )
        .action(
            function( args, callback ) {
                vorpal.log(  `\`${this.commandWrapper.command}\` run with args:`  );
                vorpal.log( args );

                callback();
            }
        );

    vorpal.command( 'publish add' )
        .option( '--dry-run', 'Print actions taken but do not execute them.' )
        .description( 'Add EPUBs.' )
        .action(
            function( args, callback ) {
                vorpal.log(  `\`${this.commandWrapper.command}\` run with args:`  );
                vorpal.log( args );

                publish( 'add' );

                callback();
            }
        );

    vorpal.command( 'publish delete' )
        .option( '--dry-run', 'Print actions taken but do not execute them.' )
        .description( 'Delete EPUBs.' )
        .action(
            function( args, callback ) {
                vorpal.log(  `\`${this.commandWrapper.command}\` run with args:`  );
                vorpal.log( args );

                publish( 'delete' );

                callback();
            }
        );

    vorpal.command( 'publish delete all' )
        .option( '--dry-run', 'Print actions taken but do not execute them.' )
        .description( 'Delete all EPUBs.' )
        .action(
            function( args, callback ) {
                vorpal.log(  `\`${this.commandWrapper.command}\` run with args:`  );
                vorpal.log( args );

                publish( 'delete all' );

                callback();
            }
        );

    vorpal.command( 'publish full-replace' )
        .option( '--dry-run', 'Print actions taken but do not execute them.' )
        .description( 'Replace all EPUBs.' )
        .action(
            function( args, callback ) {
                vorpal.log(  `\`${this.commandWrapper.command}\` run with args:`  );
                vorpal.log( args );

                publish( 'full-replace' );

                callback();
            }
        );
};
