const dateFormat = require( 'dateformat' );
const _          = require( 'lodash' );
const url        = require( 'url' );

// Username = "test", password = "test"
const AUTHORIZATION_STRING      = 'Basic dGVzdDp0ZXN0';
const HANDLE_SERVER_URL         = 'http://hdl.handle.net/';
const RESTFUL_HANDLE_SERVER_URL = 'https://handle.dlib.nyu.edu/id/handle/';

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
        const urlObject = url.parse( urlString );

        const parts     = urlObject.pathname.split( '/' );
        const prefix    = parts[ parts.length - 2 ];
        const localName = parts[ parts.length - 1 ];

        return `${prefix}/${localName}`;
    }

    static parseTargetUrl( content ) {
        // Let's not bother with full XML parsing unless it proves necessary.
        // This is a very controlled situation.
        const matches = /<hs:binding>\s*([^<]+)\s*<\/hs:binding>/.exec( content );

        if ( matches ) {
            return matches[ 1 ];
        } else {
            return null;
        }
    }

    stateEquals( arrayArg ) {
        const handlesDataArray = Array.from( this.handlesData );

        return _.isEqual( handlesDataArray, arrayArg );
    }

    delete( handle ) {
        this.handlesData.delete( handle );
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
        let response;

        const handleId = RestfulHandleServerStub.parseHandleId( url );
        const expectedUrl = RESTFUL_HANDLE_SERVER_URL + handleId;
        if ( url !== expectedUrl ) {
            return RestfulHandleServerStub.error(
                400, `url is "${url}" instead of "${expectedUrl}"` );
        }

        if ( method === 'PUT' ) {
            response = this.requestPut( url, handleId, options );
        } else if ( method === 'DELETE' ) {
            response = this.requestDelete( url, handleId, options );
        } else {
            return RestfulHandleServerStub.error(
                400,
                `method is "${method}" instead of "PUT" or "DELETE"`
            );
        }

        return response;
    }

    requestDelete( url, handleId, options ) {
        if ( options.headers.authorization !== AUTHORIZATION_STRING ) {
            const body = `<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
<html><head>
<title>401 Authorization Required</title>
</head><body>
<h1>Authorization Required</h1>
<p>This server could not verify that you
are authorized to access the document
requested.  Either you supplied the wrong
credentials (e.g., bad password), or your
browser doesn't understand how to supply
the credentials required.</p>
<hr>
<address>Apache/2.2.15 (CentOS) Server at handle.dlib.nyu.edu Port 443</address>
</body></html>`;
            return RestfulHandleServerStub.error( 401, body );
        }

        const handleUrl = HANDLE_SERVER_URL + handleId;

        this.delete( handleUrl );

        return {
            statusCode : 200,
        };
    }

    requestPut( url, handleId, options ) {
        if ( options.headers.authorization !== AUTHORIZATION_STRING ) {
            const body = `<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
<html><head>
<title>401 Authorization Required</title>
</head><body>
<h1>Authorization Required</h1>
<p>This server could not verify that you
are authorized to access the document
requested.  Either you supplied the wrong
credentials (e.g., bad password), or your
browser doesn't understand how to supply
the credentials required.</p>
<hr>
<address>Apache/2.2.15 (CentOS) Server at handle.dlib.nyu.edu Port 443</address>
</body></html>`;
            return RestfulHandleServerStub.error( 401, body );
        }

        const contentType = options.headers[ 'content-type' ];
        if ( contentType !== 'text/xml' ) {
            return RestfulHandleServerStub.error( 400, `content-type header is "${contentType}" instead of "text/xml"` );
        }

        const handleUrl = HANDLE_SERVER_URL + handleId;

        if ( ! options.body ) {
            return RestfulHandleServerStub.error( 400, 'No request content' );
        }

        const targetUrl = RestfulHandleServerStub.parseTargetUrl( options.body );

        this.set( handleUrl, targetUrl );

        const twelveHoursLater = new Date(
            new Date().getTime() + ( 12 * 60 * 60 * 1000 )
        );

        // Ex.: "Fri Dec 16 05:54:45 EST 2016"
        const expires = dateFormat( twelveHoursLater, 'ddd mmm dd HH:MM:ss Z yyyy');

        const response = {
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
