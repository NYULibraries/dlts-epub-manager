"use strict";

class Book {
    static CATEGORY_LEVEL_DELIMITER = ' / ';
    static COLLECTION_CODE_CONNECTED_YOUTH = 'connected-youth';
    static COLLECTION_CODE_OA_BOOKS = 'oa-books';
    static HARCOVER_FORMAT_CODE = 'BB';
    static SERIES_NAME_CONNECTED_YOUTH = 'Connected Youth and Digital Futures';

    supafolioApiResponse;

    // supafolioApiResponse is already public, no need to have this be public too.
    // We just need this for making the many calls more convenient.
    #book;

    constructor( supafolioApiResponse ) {
        this.supafolioApiResponse = supafolioApiResponse;
        this.book = this.supafolioApiResponse.data.book[ 0 ];
    }

    get authors() {
        return this.book.contributors.map( obj => {
            return {
                first : obj.contributor.first,
                last  : obj.contributor.last,
                name  : obj.contributor.name,
                order : obj.order,
                role  : obj.role.name,
                seo   : obj.contributor.seo,
            };
        } );
    }

    get authorsForDisplay() {
        const contributors = this.book.contributors;

        contributors.sort( ( a, b ) => {
            if ( a.order < b.order ) {
                return -1;
            }

            if ( a.order > b.order ) {
                return 1;
            }

            return 0;
        } );

        return contributors.map( obj => obj.contributor.name ).join( ', ' );
    }

    get collectionCode() {
        if ( this.book.custom[ 'open_access_series' ] === Book.SERIES_NAME_CONNECTED_YOUTH ) {
            return Book.COLLECTION_CODE_CONNECTED_YOUTH;
        } else {
            return Book.COLLECTION_CODE_OA_BOOKS;
        }
    }

    get date() {
        const formats = this.book.formats;
        const hardcoverFormat = formats.find( obj => {
            return obj.format.code === Book.HARCOVER_FORMAT_CODE;
        } );

        if ( hardcoverFormat ) {
            return hardcoverFormat.date.date;
        } else {
            // Just use the date of the first format
            return this.book.formats[ 0 ].date.date;
        }
    }

    get description() {
        return this.book.description;
    }

    get coverage() {
        // We are going to remove the coverage field, but for now just hardcode
        // the value.
        // See https://jira.nyu.edu/jira/browse/NYUP-670.
        return 'New York';
    }

    get isbn() {
        return this.book.isbn13;
    }

    get isbnForPrimaryFormat() {
        const formats = this.book.formats;

        let isbn;
        for ( let i = 0; i < formats.length; i++ ) {
            const format = formats[ i ];

            if ( format.primary_format === true ) {
                isbn = format.isbn;
                break;
            }
        }

        return isbn;
    }

    get languageCode() {
        return this.book.custom.language;
    }

    get license() {
        return {
            link : this.book.custom.license_link,
        };
    }

    get nyuPressWebsiteBuyTheBookUrl() {
        if ( this.isbnForPrimaryFormat ) {
            return `https://nyupress.org/${this.isbnForPrimaryFormat}`;
        }
    }

    get pages() {
        return this.book.pages;
    }

    get permanentUrl() {
        return this.book.custom.permanent_url;
    }

    get publisher() {
        return this.book.publisher.name;
    }

    get seriesName() {
        // So, far, it looks like this value can be either a string or `false`.
        if ( this.book.custom.open_access_series ) {
            return this.book.custom.open_access_series;
        }
    }

    get subjects() {
        const subjects = {};

        this.book.categories.forEach( obj => {
            const categoriesEachLevel = obj.category.name.split( Book.CATEGORY_LEVEL_DELIMITER );
            subjects[ categoriesEachLevel[ 0 ] ] = 1;
        } );

        return Object.keys( subjects ).sort();
    }

    get subtitle() {
        if ( this.book.subtitle && this.book.subtitle !== '' ) {
            return this.book.subtitle;
        }
    }

    get title() {
        return this.book.title;
    }

    get titleWithoutPrefix() {
        return this.book.title_without_prefix;
    }

    get year() {
        return new Date( this.date ).getFullYear();
    }
}

module.exports.Book = Book;
