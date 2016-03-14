"use strict";

module.exports = function( vorpal ){
    vorpal.log( `Loaded ${ __filename }.` );

    function publish( subCommand ) {
        vorpal.execSync( `content ${subCommand}` );
        vorpal.execSync( `solr ${subCommand}` );
        vorpal.execSync( `handles ${subCommand}` );
        vorpal.execSync( `readium-json ${subCommand}` );
        vorpal.execSync( `verify ${subCommand}` );
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
