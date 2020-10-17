// See https://jira.nyu.edu/jira/browse/NYUP-738 for documentation on possible
// Supafolio API errors.

const SupafolioAPIError = require( './SupafolioAPIError' ).SupafolioAPIError;

class SupafolioAPIErrorResourceNotFound extends SupafolioAPIError {
    static MESSAGE = 'Resource not found.';

    constructor() {
        super(
            'SupafolioAPIErrorResourceNotFound',
            SupafolioAPIErrorResourceNotFound.MESSAGE,
        );
    }
}

module.exports.SupafolioAPIErrorResourceNotFound = SupafolioAPIErrorResourceNotFound;
