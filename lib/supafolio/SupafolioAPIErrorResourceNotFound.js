// See https://jira.nyu.edu/jira/browse/NYUP-738 for documentation on possible
// Supafolio API errors.

const SupafolioApiError = require( './SupafolioApiError' ).SupafolioApiError;

class SupafolioApiErrorResourceNotFound extends SupafolioApiError {
    static MESSAGE = 'Resource not found.';

    constructor() {
        super(
            'SupafolioApiErrorResourceNotFound',
            SupafolioApiErrorResourceNotFound.MESSAGE,
        );
    }
}

module.exports.SupafolioApiErrorResourceNotFound = SupafolioApiErrorResourceNotFound;
