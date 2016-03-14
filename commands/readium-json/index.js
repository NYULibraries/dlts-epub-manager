"use strict";

module.exports = function( vorpal ){
    vorpal.log( `Loaded ${ __filename }.` );

    vorpal.command( 'readium-json' )
        .option( '--dry-run', 'Print actions taken but do not execute them.' )
        .description( 'Manage `epub_library.json` file.' )
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

    vorpal.command( 'readium-json add' )
        .option( '--dry-run', 'Print actions taken but do not execute them.' )
        .description( 'Add EPUBs to `epub_library.json` file.' )
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

    vorpal.command( 'readium-json delete' )
        .option( '--dry-run', 'Print actions taken but do not execute them.' )
        .description( 'Delete EPUBs from `epub_library.json` file.' )
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

    vorpal.command( 'readium-json delete all' )
        .option( '--dry-run', 'Print actions taken but do not execute them.' )
        .description( 'Delete all EPUBs from `epub_library.json` file.' )
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

    vorpal.command( 'readium-json full-replace' )
        .option( '--dry-run', 'Print actions taken but do not execute them.' )
        .description( 'Replace entire `epub_library.json` file.' )
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
