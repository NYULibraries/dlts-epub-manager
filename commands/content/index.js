"use strict";

module.exports = function( vorpal ){
    vorpal.log( `Loaded ${ __filename }.` );

    vorpal.command( 'content' )
        .option( '--dry-run', 'Print actions taken but do not execute them.' )
        .description( 'Manage exploded EPUB content.' )
        .action(
            function( args, callback ) {
                vorpal.log( args );

                callback();
            }
        );

    vorpal.command( 'content add' )
        .option( '--dry-run', 'Print actions taken but do not execute them.' )
        .description( 'Transform exploded EPUB content and deploy.' )
        .action(
            function( args, callback ) {
                vorpal.log( args );

                callback();
            }
        );

    vorpal.command( 'content delete' )
        .option( '--dry-run', 'Print actions taken but do not execute them.' )
        .description( 'Delete EPUB content from deployed collection.' )
        .action(
            function( args, callback ) {
                vorpal.log( args );

                callback();
            }
        );

    vorpal.command( 'content delete all' )
        .option( '--dry-run', 'Print actions taken but do not execute them.' )
        .description( 'Delete all EPUB content from deployed collection.' )
        .action(
            function( args, callback ) {
                vorpal.log( args );

                callback();
            }
        );

    vorpal.command( 'content full-replace' )
        .option( '--dry-run', 'Print actions taken but do not execute them.' )
        .description( 'Replace EPUB content of entire deployed collection.' )
        .action(
            function( args, callback ) {
                vorpal.log( args );

                callback();
            }
        );
};
