class HandleServerStub {
    constructor() {
        this.handlesData = new Map();
    }

    static error( statusCode, message ) {
        return {
            statusCode,
            body: `HandleServerStub ERROR: ${message}`,
        };
    }

    equals( map ) {
        return _.isEqual( this.handlesData, map );
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

    request( method, url, options ) {
        if ( method !== 'PUT' ) {
            return this.constructor.error( 400, `method is "${method}" instead of "PUT"` );
        }

        let contentType = options.headers[ 'content-type' ];
        if ( contentType !== 'text/xml' ) {
            return this.constructor.error( 400, `content-type header is "${contentType}" instead of "text/xml"` );
        }

        // Get handle
        // Create handle URL
        // Create handlesMap entry
        // Send response:
        //     <?xml version="1.0"?>
        //     <hs:info xmlns:hs="info:nyu/dl/v1.0/identifiers/handles">
        //         <hs:binding> http://openaccessbooks.nyupress.org/details/9780814706404 </hs:binding>
        //         <hs:location> http://hdl.handle.net/2333.1/37pvmfhh</hs:location>
        //         <hs:response> version=2.1; oc=104; rc=1; snId=0 caCrt noAuth expires:Fri Dec 16 05:54:45 EST 2016 </hs:response>
        //     </hs:info>
    }
}

module.exports = HandleServerStub;