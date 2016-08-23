"use strict";

module.exports = function( vorpal ){

    vorpal.command( 'verify' )
        .description( 'Verify integrity of published collection, handles, and metadata indexes.' )
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
