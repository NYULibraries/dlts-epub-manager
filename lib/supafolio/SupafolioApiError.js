// See https://jira.nyu.edu/jira/browse/NYUP-738 for documentation on possible
// Supafolio API errors.

class SupafolioApiError extends Error {
    constructor( name = 'SupafolioAPIError', ...params ) {
        super( params );
    }
}

module.exports.SupafolioAPIError = SupafolioApiError;
