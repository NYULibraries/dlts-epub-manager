"use strict";

module.exports = function( vorpal ){
    vorpal.log( `Loaded ${ __filename }.` );

    vorpal.command( 'load <configuration>' )
        .description( 'Read in configuration file and load resources.' )
        .action(
            function( args, callback ) {
                vorpal.log(  `\`${this.commandWrapper.command}\` run with args:`  );
                vorpal.log( args );

                callback();
            }
        );
};
