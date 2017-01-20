const dateFormat = require( 'dateformat' );
const _          = require( 'lodash' );
const url        = require( 'url' );

const HANDLE_SERVER_URL = 'http://hdl.handle.net/';

class RestfulHandleServerStub {
    constructor() {
        this.handlesData = new Map();
    }

    static error( statusCode, message ) {
        return {
            statusCode,
            body: `HandleServerStub ERROR: ${message}`,
        };
    }

    static parseHandleId( urlString ) {
        let urlObject = url.parse( urlString );

        let parts     = urlObject.pathname.split( '/' );
        let prefix    = parts[ parts.length - 2 ];
        let localName = parts[ parts.length - 1 ];

        return `${prefix}/${localName}`;
    }

    static parseTargetUrl( content ) {
        // Let's not bother with full XML parsing unless it proves necessary.
        // This is a very controlled situation.
        let matches = /<hs:binding>\s*([^<]+)\s*<\/hs:binding>/.exec( content );

        if ( matches ) {
            return matches[ 1 ];
        } else {
            return null;
        }
    }

    stateEquals( arrayArg ) {
        let handlesDataArray = Array.from( this.handlesData );

        return _.isEqual( handlesDataArray, arrayArg );
    }

    get( handle ) {
        return this.handlesData.get( handle );
    }

    has( handle ) {
        return this.handlesData.has( handle );
    }

    set( handle, url ) {
        this.handlesData.set( handle, url );
    }

    size() {
        return this.handlesData.size;
    }

    request( method, url, options ) {
        if ( method !== 'PUT' ) {
            return RestfulHandleServerStub.error( 400, `method is "${method}" instead of "PUT"` );
        }

        let contentType = options.headers[ 'content-type' ];
        if ( contentType !== 'text/xml' ) {
            return RestfulHandleServerStub.error( 400, `content-type header is "${contentType}" instead of "text/xml"` );
        }

        let handleId  = RestfulHandleServerStub.parseHandleId( url );
        let handleUrl = HANDLE_SERVER_URL + handleId;

        if ( ! options.body.content ) {
            return RestfulHandleServerStub.error( 400, 'No request content' );
        }

        let targetUrl = RestfulHandleServerStub.parseTargetUrl( options.body.content );

        this.set( handleUrl, targetUrl );

        let twelveHoursLater = new Date(
            new Date().getTime() + ( 12 * 60 * 60 * 1000 )
        );

        // Ex.: "Fri Dec 16 05:54:45 EST 2016"
        let expires = dateFormat( 'ddd mmm dd hh:MM:ss Z yyyy');

        let response = {
            body       : `<?xml version="1.0"?>
    <hs:info xmlns:hs="info:nyu/dl/v1.0/identifiers/handles">
    <hs:binding> ${targetUrl} </hs:binding>
    <hs:location> ${handleUrl}</hs:location>
    <hs:response> version=2.1; oc=104; rc=1; snId=0 caCrt noAuth expires:${expires} </hs:response>
</hs:info>`,

            statusCode : 200,
        };

        return response;
    }
}

module.exports = RestfulHandleServerStub;