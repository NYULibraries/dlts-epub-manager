"use strict";

const helpers = require( '../../lib/command-helpers/handles' );
const util    = require( '../../lib/util' );

let em;

module.exports = function( vorpal ){
    em = vorpal.em;

    vorpal.command( 'handles add [configuration]' )
        .description( 'Bind EPUB handles.' )
        .autocomplete( util.getConfigFileBasenames( vorpal.em.configDir ) )
        .action(
            function( args, callback ) {
                if ( args.configuration ) {
                    const loadSucceeded = vorpal.execSync( `load ${args.configuration}`, { fatal : true } );

                    if ( ! loadSucceeded ) {
                        vorpal.log( `ERROR: \`load ${args.configuration}\` failed.` );

                        if ( callback ) { callback(); }
                        return false;
                    }
                }

                if ( ! vorpal.em.metadata ) {
                    vorpal.log( util.ERROR_METADATA_NOT_LOADED );

                    if ( callback ) { callback(); }
                    return false;
                }

                const epubMetadataAll = vorpal.em.metadata.getAll();

                try {

                    const handlesAdded = helpers.addHandles( em.conf, em.request, epubMetadataAll );

                    vorpal.log(
                        `Added ${epubMetadataAll.size} handles to handles server:\n` + handlesAdded.join( '\n' )
                    );

                    if ( callback ) { callback(); }
                    return true;
                } catch ( error ) {
                    vorpal.log( 'ERROR adding handle to handle server:\n' +
                                error );

                    if ( callback ) { callback(); }
                    return false;
                }

            }
        );

    vorpal.command( 'handles delete [configuration]' )
        .description( 'Unbind EPUB handles.' )
        .autocomplete( util.getConfigFileBasenames( vorpal.em.configDir ) )
        .action(
            function( args, callback ) {
                if ( args.configuration ) {
                    const loadSucceeded = vorpal.execSync( `load ${args.configuration}`, { fatal : true } );

                    if ( ! loadSucceeded ) {
                        vorpal.log( `ERROR: \`load ${args.configuration}\` failed.` );

                        if ( callback ) { callback(); }
                        return false;
                    }
                }

                if ( ! vorpal.em.metadata ) {
                    vorpal.log( util.ERROR_METADATA_NOT_LOADED );

                    if ( callback ) { callback(); }
                    return false;
                }

                const epubMetadataAll = vorpal.em.metadata.getAll();

                try {

                    const handlesDeleted = helpers.deleteHandles( em.conf, em.request, epubMetadataAll );

                    vorpal.log(
                        `Deleted ${epubMetadataAll.size} handles from handles server:\n` + handlesDeleted.join( '\n' )
                    );

                    if ( callback ) { callback(); }
                    return true;
                } catch ( error ) {
                    vorpal.log( 'ERROR deleting handle from handle server:\n' +
                                error );

                    if ( callback ) { callback(); }
                    return false;
                }
            }
        );
};
