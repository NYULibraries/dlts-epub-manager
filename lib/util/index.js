"use strict";

let fs        = require( 'fs' );
let stringify = require( 'json-stable-stringify' );
let path      = require( 'path' );
let request   = require( 'sync-request' );

const CONFIG_FILE_EXTENSION = '.json';

const ERROR_INTAKE_EPUB_LIST_NOT_LOADED =
          'No intake EPUB list has been loaded.  Please run "load [configuration]" first.';
const ERROR_METADATA_NOT_LOADED =
          'No metadata has been loaded.  Please run "load [configuration]" first.';

const ERROR_CONF_MISSING_INTAKE_OUTPUT_DIR =
          'Missing required option "intakeOutputDir".';
const ERROR_CONF_MISSING_METADATA_DIR =
          'Missing required option "metadataDir" or "metadataRepo".';
const ERROR_CONF_MISSING_READIUM_JSON_FILE =
          'No `readiumJsonFile` option found in the conf file.';

function getConfigFileBasenames( configDir ) {
    let filenames = [];

    try {
        filenames = fs.readdirSync( configDir ).filter(
            ( filename ) => {
                return path.extname( filename ) === CONFIG_FILE_EXTENSION;
            }
        );
    } catch ( e ) {
        if ( e ) {
            if ( e.code === 'ENOENT' ) {
                console.error( `The config directory ${configDir}/ does not exist!` );
                process.exit( e.code );
            }
        }
    }

    return filenames.map(
        ( filename ) => {
            return path.basename( filename, CONFIG_FILE_EXTENSION );
        }
    );
}
// `require(...)` reads a file only once and then caches it.  Sometimes we want
// the file to be re-read because we've changed it.
function getJsonFromFile( jsonFile ) {
    return JSON.parse( fs.readFileSync( jsonFile ) );
}

function getRestfulHandleServerFullPath( conf ) {
    let host = conf.restfulHandleServerHost;
    let path = conf.restfulHandleServerPath;

    return `https://${host}${path}`;
}

function getSolrFullPath( conf ) {
    let solrHost = conf.solrHost;
    let solrPort = conf.solrPort;
    let solrPath = conf.solrPath;

    return `http://${solrHost}:${solrPort}${solrPath}`;
}

function getSolrSelectUrl( conf ) {
    return getSolrFullPath( conf ) + '/select';
}

function getSolrUpdateUrl( conf ) {
    return getSolrFullPath( conf ) + '/update';
}

function isSolrResponding( conf, error ) {
    let testQueryUrl = getSolrSelectUrl( conf ) + '/?wt=json';

    let response;

    try {
        response = request( 'GET', testQueryUrl );
    } catch ( requestError ) {
        error.message = requestError

        return false;
    }

    if ( response.statusCode !== 200 ) {
        return false;
    }

    let responseObject = JSON.parse( response.body.toString() );

    if ( responseObject.response && responseObject.responseHeader ) {
        return true;
    } else {
        return false;
    }
}

function isValidIsbn13( str ) {
    // So far NYU Press appears to be using ISBN-13.
    // Regular Expressions Cookbook, 2nd Edition, has regexp for ISBN-13
    // https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9781449327453/ch04s13.html
    // NOTE: For JavaScript, need to double the backslashes to get a literal single backslash in the string.
    const ISBN_13_REGEX_STRING =
                        '^'                           +
                        '(?:ISBN(?:-13)?:?\\ )?'      + // Optional ISBN/ISBN-13 identifier.
                        '(?='                         + // Basic format pre-checks (lookahead):
                          '[0-9]{13}$'                + //   Require 13 digits (no separators).
                         '|'                          + //  Or:
                          '(?=(?:[0-9]+[-\\ ]){4})'   + //   Require 4 separators
                          '[-\ 0-9]{17}$'             + //     out of 17 characters total.
                        ')'                           + // End format pre-checks.
                        '97[89][-\\ ]?'               + // ISBN-13 prefix.
                        '[0-9]{1,5}[-\\ ]?'           + // 1-5 digit group identifier.
                        '[0-9]+[-\\ ]?[0-9]+[-\\ ]?'  + // Publisher and title identifiers.
                        '[0-9]'                       + // Check digit.
                        '$'
        ;
    const ISBN_13_REGEX = new RegExp( ISBN_13_REGEX_STRING );

    return str.match( ISBN_13_REGEX ) !== null;
}

function isValidNormalizedIsbn13( str ) {
    // Regular Expressions Cookbook, 2nd Edition, has regexp for ISBN-13
    // https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9781449327453/ch04s13.html

    // Allows an ISBN-13 with no separators (13 total characters)
    const NORMALIZED_ISBN_REGEX = /^97[89][0-9]{10}$/;

    return str.match( NORMALIZED_ISBN_REGEX ) !== null;
}

function jsonStableStringify( json ) {
    return stringify(
        json,
        { space : '    ' }
    );
}

module.exports = {
    CONFIG_FILE_EXTENSION,
    ERROR_INTAKE_EPUB_LIST_NOT_LOADED,
    ERROR_METADATA_NOT_LOADED,
    ERROR_CONF_MISSING_INTAKE_OUTPUT_DIR,
    ERROR_CONF_MISSING_METADATA_DIR,
    ERROR_CONF_MISSING_READIUM_JSON_FILE,
    getConfigFileBasenames,
    getJsonFromFile,
    getRestfulHandleServerFullPath,
    getSolrFullPath,
    getSolrSelectUrl,
    getSolrUpdateUrl,
    isSolrResponding,
    isValidIsbn13,
    isValidNormalizedIsbn13,
    jsonStableStringify,
};