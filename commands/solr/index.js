"use strict";

const _ = require( 'lodash' );

const util  = require( '../../lib/util' );

let em;

module.exports = function( vorpal ){
    em = vorpal.em;

    vorpal.command( 'solr add [configuration]' )
        .description( 'Add EPUBs to Solr index.' )
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
                    const epubsAdded = addEpubs( epubMetadataAll );

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
        // .autocomplete( util.getConfigFileBasenames( vorpal.em.configDir ) )
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

                epubMetadataAll.forEach( ( epubMetadata ) => {
                    try {
                        deleteEpub( epubMetadata );

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

                try {
                    deleteAllEpubs();

                    vorpal.log( `Deleted all documents from Solr index for conf "${vorpal.em.conf.name}".` );

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

                if ( ! vorpal.em.metadata ) {
                    vorpal.log( util.ERROR_METADATA_NOT_LOADED );

                    if ( callback ) { callback(); }
                    return false;
                }

                const deleteAllSucceeded = vorpal.execSync( `solr delete all ${vorpal.em.conf.name}`, { fatal : true } );

                if ( deleteAllSucceeded ) {
                    const addSucceeded = vorpal.execSync( `solr add ${vorpal.em.conf.name}`, { fatal : true } );

                    if ( addSucceeded ) {
                        vorpal.log( `Fully replaced all EPUBs for conf ${vorpal.em.conf.name}.` );

                        result = true;
                    } else {
                        result = false;
                    }
                } else {
                    vorpal.log( `Aborting \`full-replace\` for ${vorpal.em.conf.name}.` );

                    result = false;
                }

                if ( callback ) { callback(); } else { return result; }
            }
        );
};

function addEpubs( epubMetadataAll) {
    const solrUpdateUrl = util.getSolrUpdateUrl( em.conf ) + '/json?commit=true';

    const addRequest = [];
    const epubsAdded = [];

    epubMetadataAll.forEach( ( epubMetadata ) => {
        let doc = { id : epubMetadata.identifier };

        Object.keys( epubMetadata ).forEach(
            ( key ) => {
                doc[ key ] = epubMetadata[ key ];
            }
        );

        // Filter out any metadata fields that don't need to go into Solr
        doc = _.pick( doc, util.SOLR_FIELDS );

        addRequest.push( doc );
        epubsAdded.push( epubMetadata.identifier );
    } );

    const response = em.request(
        'POST', solrUpdateUrl, {
            body : JSON.stringify( addRequest )
        }
    );

    if ( response.statusCode !== 200 ) {
        throw response.body.toString();
    }

    return epubsAdded;
}

function deleteEpub( epubMetadata ) {
    try {
        deleteEpubsByQuery( 'identifier:' + epubMetadata.identifier );
    } catch ( error ) {
        throw error;
    }
}

function deleteAllEpubs() {
    try {
        deleteEpubsByQuery( '*:*' );
    } catch ( error ) {
        throw error;
    }
}

function deleteEpubsByQuery( query ) {
    const requestUrl = util.getSolrUpdateUrl( em.conf ) +
                        `/?commit=true&stream.body=<delete><query>${query}</query></delete>`;

    const response = em.request( 'GET', requestUrl );

    if ( response.statusCode !== 200 ) {
        throw response.body.toString();
    }
}
