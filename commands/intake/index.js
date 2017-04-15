"use strict";

module.exports = function( vorpal ){

    vorpal.command( 'intake add' )
        .description( 'Intake EPUBs and generate Readium versions and associated metadata files.' )
        .action(
            function( args, callback ) {
                try {
                    if ( callback ) { callback(); } else { return true; }
                } catch ( error ) {
                    if ( callback ) { callback(); } else { return false; }
                }
            }
        );

};
