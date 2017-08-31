"use strict";

let Epub = require( './Epub' ).Epub;
let util = require( '../util' );

class DltsEpub extends Epub {
    constructor( explodedEpubDir ) {
        super( explodedEpubDir );

        // We have a bit of a problem here, in that according to EPUB spec, the
        // unique identifier designated by the "unique-identifer" attribute of
        // the <package> element.  The attribute value specifies the id of the
        // <dc:creator> element that provides the unique identifier.
        //
        // Our publishing process uses ISBNs as unique identifiers, however it
        // seems to be the case that in the few EPUBs we have that contain multiple
        // <dc:creator> elements, the unique identifier is the
        // non-ISBN <dc:creator> value: see this comment in NYUP_177:
        //     https://jira.nyu.edu/jira/browse/NYUP-177?focusedCommentId=70146&page=com.atlassian.jira.plugin.system.issuetabpanels:comment-tabpanel#comment-70146
        //
        // These exceptional EPUBs were not in our collection when the legacy
        // script was written, so we don't have an existing policy on which
        // identifier to pick.  For now, let's just store all the <dc:creator>
        // values and make sure we make clear which one should be used for our
        // publication and "catalog" IDs.
        //
        // Frankly, EPUB unique identifiers represent a problem that has yet to be
        // addressed comprehensively, and there is no universally accepted practice
        // or convention regarding them, so it's not particularly important (yet)
        // that we pick the "right" one.
        let identifiers = this.package._xml.metadata[ 'dc:identifier' ];
        if ( ! Array.isArray( identifiers ) ) {
            identifiers = [ identifiers ];
        }

        let identifier = identifiers.find( ( element ) => {
                return util.isValidNormalizedIsbn13(
                    util.normalizeDltsEpubIdentifier( element._Data )
                );
            } )._Data;

        // NOTE: Some quick tests showed that this.package.* members are copied by
        // value, not by reference.  Both == and test mutation showed that
        // this.dlts.metadata.* fields did not directly refer to their corresponding
        // this.package.* fields.
        this.dlts = {
            metadata : {
                authors    : this.package.creators,
                identifier : identifier,

                date      : this.package.date,
                format    : this.package.format,
                language  : this.package.language,
                publisher : this.package.publisher,
                rights    : this.package.rights,
                title     : this.package.title,
                type      : this.package.type,

                rootUrl   : `epub_content/${identifier}`,
                coverHref : `epub_content/${identifier}/${this.rootDirectory}/images/${identifier}.jpg`,
                thumbHref : `epub_content/${identifier}/${this.rootDirectory}/images/${identifier}-th.jpg`,

                // This is for the epub_library.json file.
                packageUrl : `epub_content/${identifier}`,
            }
        };

    }
}

module.exports.DltsEpub = DltsEpub;
