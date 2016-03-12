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

    vorpal.command( 'content add <configuration>' )
        .option( '--dry-run', 'Print actions taken but do not execute them.' )
        .description( 'Explode EPUB content and do transformations.' )
        .action(
            function( args, callback ) {
                vorpal.log( args );

                callback();
            }
        );
};
