"use strict";

const execSync  = require( 'child_process' ).execSync;
const fs        = require( 'fs' );
const stringify = require( 'json-stable-stringify' );
const path      = require( 'path' );
const syncFetch = require( 'sync-fetch' );
const XML       = require( 'pixl-xml' );

const CONFIG_FILE_EXTENSION = '.json';

const ERROR_INTAKE_EPUB_LIST_NOT_LOADED =
          'No intake EPUB list has been loaded.  Please run "load [configuration]" first.';
const ERROR_METADATA_NOT_LOADED =
          'No metadata has been loaded.  Please run "load [configuration]" first.';

const ERROR_CONF_MISSING_INTAKE_EPUB_DIR =
          'Missing required option "intakeEpubDir".';
const ERROR_CONF_MISSING_INTAKE_OUTPUT_DIR =
          'Missing required option "intakeOutputDir".';
const ERROR_CONF_MISSING_METADATA_DIR =
          'Missing required option "metadataDir" or "metadataRepo".';
const ERROR_CONF_MISSING_READIUM_JSON_FILE =
          'No `readiumJsonFile` option found in the conf file.';

const OPS_DIRECTORY_NAME = 'ops';

// https://jira.nyu.edu/jira/browse/NYUP-544
const LICENSE_TABLE =
    {
        'https://creativecommons.org/licenses/by/4.0/': {
            abbreviation: 'CC BY',
            icon: 'https://i.creativecommons.org/l/by/4.0/80x15.png',
            id: '1',
            name: 'Creative Commons Attribution 4.0 International License',
        },
        'https://creativecommons.org/licenses/by-sa/4.0/': {
            abbreviation: 'CC BY-SA',
            icon: 'https://i.creativecommons.org/l/by-sa/4.0/80x15.png',
            id: '2',
            name: 'Creative Commons Attribution-ShareAlike 4.0 International License',
        },
        'https://creativecommons.org/licenses/by-nd/4.0/': {
            abbreviation: 'CC BY-ND',
            icon: 'https://i.creativecommons.org/l/by-nd/4.0/80x15.png',
            id: '3',
            name: 'Creative Commons Attribution-NoDerivatives 4.0 International License',
        },
        'https://creativecommons.org/licenses/by-nc/4.0/': {
            abbreviation: 'CC BY-NC',
            icon: 'https://i.creativecommons.org/l/by-nc/4.0/80x15.png',
            id: '4',
            name: 'Creative Commons Attribution-NonCommercial 4.0 International License',
        },
        'https://creativecommons.org/licenses/by-nc-sa/4.0/': {
            abbreviation: 'CC BY-NC-SA',
            icon: 'https://i.creativecommons.org/l/by-nc-sa/4.0/80x15.png',
            id: '5',
            name: 'Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License',
        },
        'https://creativecommons.org/licenses/by-nc-nd/4.0/': {
            abbreviation: 'CC BY-NC-ND',
            icon: 'https://i.creativecommons.org/l/by-nc-nd/4.0/80x15.png',
            id: '6',
            name: 'Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License',
        }
    };

const SOLR_FIELDS = [
    'id',
    'author',
    'author_sort',
    'collection_code',
    'coverage',
    'coverHref',
    'date',
    'description',
    'description_html',
    'format',
    'handle',
    'identifier',
    'language',
    'license',
    'license_abbreviation',
    'license_icon',
    'license_link',
    'packageUrl',
    'publisher',
    'rights',
    'series_names',
    'subject',
    'subtitle',
    'thumbHref',
    'title',
    'title_sort',
    'type',
];

function getAsArray( value ) {
    if ( ! Array.isArray( value ) ) {
        return [ value ];
    } else {
        return value;
    }
}

function getAuthorSortKey( authorList ) {
    const suffixesToIgnore = [
        '\\s+Jr\\.$',
        '\\s+Sr\\.$',
    ];

    const suffixesToIgnoreRegex = new RegExp( suffixesToIgnore.join( '|' ), 'i' );

    // We sort by first author in the list
    const authors = authorList.split( /\s*,\s*/ );

    let firstAuthorInList = authors[ 0 ];

    // Remove suffixes before attempting to guess surname
    firstAuthorInList = firstAuthorInList.replace( suffixesToIgnoreRegex, '' );

    const pieces = firstAuthorInList.match( /(.*)\s+(.+)$/ );

    const presumedGivenName = pieces[ 1 ];
    const presumedSurname   = pieces[ 2 ];

    return presumedSurname + ', ' + presumedGivenName;
}

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

function getLicenseData( licenseLink ) {
    const licenseData = LICENSE_TABLE[ licenseLink ];
    licenseData.link = licenseLink;

    if ( LICENSE_TABLE[ licenseLink ] ) {
        return licenseData;
    } else {
        // Should we throw an error?
        return undefined;
    }
}

function getMetadataDir( em ) {
    let   metadataDir              = em.conf.metadataDir;
    const metadataRepo             = em.conf.metadataRepo;
    const metadataRepoBranch       = em.conf.metadataRepoBranch;
    const metadataRepoSubdirectory = em.conf.metadataRepoSubdirectory;

    if ( metadataDir ) {
        // Assume that non-absolute paths are relative to root dir
        if ( ! path.isAbsolute( metadataDir ) ) {
            metadataDir = `${em.rootDir}/${metadataDir}`;
        }

        if ( ! fs.existsSync( metadataDir ) ) {
            throw `${metadataDir} does not exist!`;
        }

        return metadataDir;
    } else if ( metadataRepo ) {
        const clonedRepoDir = `${em.cacheDir}/metadataRepo`;

        let cmd = `git clone ${metadataRepo} ${clonedRepoDir}`;
        execSync( cmd );

        if ( metadataRepoBranch ) {
            cmd = `git checkout ${metadataRepoBranch}`;
            execSync( cmd , { cwd: clonedRepoDir } );
        }

        let metadataDirFromRepo = clonedRepoDir;
        if ( metadataRepoSubdirectory ) {
            metadataDirFromRepo = `${metadataDirFromRepo}/${metadataRepoSubdirectory}`;
        }

        return metadataDirFromRepo;
    } else {
        throw ERROR_CONF_MISSING_METADATA_DIR;
    }
}

function getRestfulHandleServerFullPath( conf ) {
    const host = conf.restfulHandleServerHost;
    const path = conf.restfulHandleServerPath;

    return `https://${host}${path}`;
}

function getSolrFullPath( conf ) {
    const solrHost = conf.solrHost;
    const solrPort = conf.solrPort;
    const solrPath = conf.solrPath;

    return `http://${solrHost}:${solrPort}${solrPath}`;
}

function getSolrSelectUrl( conf ) {
    return getSolrFullPath( conf ) + '/select';
}

function getSolrUpdateUrl( conf ) {
    return getSolrFullPath( conf ) + '/update';
}

function getTitleSortKey( title ) {
    const articlesToRemoveFromBeginning = [
        '^\\s*the\\s+',
        '^\\s*a\\s+',
        '^\\s*an\\s+',
    ];
    const articlesToRemoveFromBeginningRegex =
        new RegExp( articlesToRemoveFromBeginning.join( '|' ), 'i' );

    return title.replace( articlesToRemoveFromBeginningRegex, '' );
}

function isSolrResponding( conf, error ) {
    const testQueryUrl = getSolrSelectUrl( conf ) + '/?wt=json';

    let response;

    try {
        response = request( 'GET', testQueryUrl );
    } catch ( requestError ) {
        error.message = requestError;

        return false;
    }

    if ( response.statusCode !== 200 ) {
        return false;
    }

    const responseObject = JSON.parse( response.body.toString() );

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

function normalizeDltsEpubIdentifier( identifier ) {
    return identifier.replace( /^urn:isbn:/, '' );
}

function request() {
    const method  = arguments[ 0 ];
    const url     = arguments[ 1 ];
    const options = arguments[ 2 ];

    const syncFetchOptions = {
        method,
    };

    if ( options && options.body ) {
        syncFetchOptions.body = options.body;
    }

    if ( options && options.headers ) {
        syncFetchOptions.headers = options.headers;
    }

    const syncFetchResponse = syncFetch( url, syncFetchOptions );

    // Return a response such as sync-request would return, but only the fields
    // currently used in epub-manager.
    return {
        statusCode : syncFetchResponse.status,
        body       : syncFetchResponse.buffer(),
    };
}

module.exports = {
    CONFIG_FILE_EXTENSION,
    ERROR_INTAKE_EPUB_LIST_NOT_LOADED,
    ERROR_METADATA_NOT_LOADED,
    ERROR_CONF_MISSING_INTAKE_EPUB_DIR,
    ERROR_CONF_MISSING_INTAKE_OUTPUT_DIR,
    ERROR_CONF_MISSING_METADATA_DIR,
    ERROR_CONF_MISSING_READIUM_JSON_FILE,
    OPS_DIRECTORY_NAME,
    SOLR_FIELDS,
    getAsArray,
    getConfigFileBasenames,
    getJsonFromFile,
    getLicenseData,
    getMetadataDir,
    getRestfulHandleServerFullPath,
    getSolrFullPath,
    getSolrSelectUrl,
    getSolrUpdateUrl,
    getAuthorSortKey,
    getTitleSortKey,
    isSolrResponding,
    isValidIsbn13,
    isValidNormalizedIsbn13,
    jsonStableStringify,
    normalizeDltsEpubIdentifier,
    request,
};
