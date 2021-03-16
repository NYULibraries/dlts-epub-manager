"use strict";

const helpers = require( '../../lib/command-helpers/solr' );
const util    = require( '../../lib/util' );

let em;

module.exports = function( vorpal ){
    em = vorpal.em;

    vorpal.command( 'solr add [configuration]' )
        .description( 'Add EPUBs to Solr index.' )
        .autocomplete( util.getConfigFileBasenames( em.configDir ) )
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

                if ( ! em.metadata ) {
                    vorpal.log( util.ERROR_METADATA_NOT_LOADED );

                    if ( callback ) { callback(); }
                    return false;
                }

                const epubMetadataAll = em.metadata.getAll();

                try {
                    const epubsAdded = helpers.addEpubs( em.conf, em.request, epubMetadataAll );

                    vorpal.log( `Added ${epubMetadataAll.size} EPUBs to Solr index:\n` + epubsAdded.join( '\n' ) );

                    if ( callback ) { callback(); }
                    return true;
                } catch ( error ) {
                    vorpal.log( 'ERROR adding document to Solr index:\n' +
                                error );

                    if ( callback ) { callback(); }
                    return false;
                }
            }
        );

    vorpal.command( 'solr delete [configuration]' )
        .description( 'Delete EPUBs from Solr index.' )
        // This doesn't work right now.  Vorpal automatically expands to 'delete all'.
        // .autocomplete( util.getConfigFileBasenames( em.configDir ) )
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

                if ( ! em.metadata ) {
                    vorpal.log( util.ERROR_METADATA_NOT_LOADED );

                    if ( callback ) { callback(); }
                    return false;
                }

                const epubMetadataAll = em.metadata.getAll();

                epubMetadataAll.forEach( ( epubMetadata ) => {
                    try {
                        helpers.deleteEpub( em.conf, em.request, epubMetadata );

                        vorpal.log( `Deleted ${epubMetadata.identifier} from Solr index.` );

                        if ( callback ) { callback(); }
                        return true;
                    } catch ( error ) {
                        vorpal.log( 'ERROR deleting document from Solr index:\n' +
                                    error );

                        if ( callback ) { callback(); }
                        return false;
                    }
                } );

                vorpal.log( `Deleted ${epubMetadataAll.size } EPUBs.` );
            }
        );

    vorpal.command( 'solr delete all [configuration]' )
        .description( 'Delete all EPUBs from Solr index.' )
        .autocomplete( util.getConfigFileBasenames( em.configDir ) )
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

                try {
                    helpers.deleteAllEpubs( em.conf, em.request );

                    vorpal.log( `Deleted all documents from Solr index for conf "${em.conf.name}".` );

                    if ( callback ) { callback(); } else { return true; }
                } catch( error ) {
                    vorpal.log( 'ERROR deleting documents from Solr index:\n' +
                                error
                            );

                    if ( callback ) { callback(); }
                    return false;
                }
            }
        );

    vorpal.command( 'solr full-replace [configuration]' )
        .description( 'Replace entire Solr index.' )
        .action(
            function( args, callback ) {
                let result = false;

                if ( args.configuration ) {
                    const loadSucceeded = vorpal.execSync( `load ${args.configuration}`, { fatal : true } );

                    if ( ! loadSucceeded ) {
                        vorpal.log( `ERROR: \`load ${args.configuration}\` failed.` );

                        if ( callback ) { callback(); }
                        return false;
                    }
                }

                if ( ! em.metadata ) {
                    vorpal.log( util.ERROR_METADATA_NOT_LOADED );

                    if ( callback ) { callback(); }
                    return false;
                }

                const deleteAllSucceeded = vorpal.execSync( `solr delete all ${em.conf.name}`, { fatal : true } );

                if ( deleteAllSucceeded ) {
                    const addSucceeded = vorpal.execSync( `solr add ${em.conf.name}`, { fatal : true } );

                    if ( addSucceeded ) {
                        vorpal.log( `Fully replaced all EPUBs for conf ${em.conf.name}.` );

                        result = true;
                    } else {
                        result = false;
                    }
                } else {
                    vorpal.log( `Aborting \`full-replace\` for ${em.conf.name}.` );

                    result = false;
                }

                if ( callback ) { callback(); } else { return result; }
            }
        );
};
