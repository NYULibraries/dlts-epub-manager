"use strict";

// See https://jira.nyu.edu/jira/browse/NYUP-736:
//     "epub-manager: write lib/legacy/handles.js"

const BASE_URL = 'http://hdl.handle.net/';
const EPUB_HANDLES = {
    9780814706404 : {
        handle : '2333.1/37pvmfhh',
    },
    9780814706657 : {
        handle : '2333.1/4tmpg641',
    },
    9780814711774 : {
        handle : '2333.1/zgmsbf5k',
    },
    9780814712481 : {
        handle : '2333.1/9s4mw88v',
    },
    9780814712771 : {
        handle : '2333.1/tqjq2dn7',
    },
    9780814712917 : {
        handle : '2333.1/ffbg7c4r',
    },
    9780814713013 : {
        handle : '2333.1/612jm7ss',
    },
    9780814713266 : {
        handle : '2333.1/pzgmsd4z',
    },
    9780814714218 : {
        handle : '2333.1/sqv9s6cx',
    },
    9780814714539 : {
        handle : '2333.1/xgxd26xf',
    },
    9780814715123 : {
        handle : '2333.1/51c5b1k3',
    },
    9780814715352 : {
        handle : '2333.1/1893212z',
    },
    9780814715383 : {
        handle : '2333.1/djh9w2k9',
    },
    9780814715635 : {
        handle : '2333.1/j6q575cq',
    },
    9780814718124 : {
        handle : '2333.1/wh70s0pf',
    },
    9780814718766 : {
        handle : '2333.1/rr4xh056',
    },
    9780814718803 : {
        handle : '2333.1/n2z34wct',
    },
    9780814726815 : {
        handle : '2333.1/08kprss5',
    },
    9780814726846 : {
        handle : '2333.1/41ns1tbw',
    },
    9780814730911 : {
        handle : '2333.1/gb5mknmc',
    },
    9780814731437 : {
        handle : '2333.1/qv9s4pmq',
    },
    9780814731956 : {
        handle : '2333.1/rr4xh3qp',
    },
    9780814735053 : {
        handle : '2333.1/z8w9gkqf',
    },
    9780814735084 : {
        handle : '2333.1/tmpg4gx5',
    },
    9780814735190 : {
        handle : '2333.1/k3j9kfwk',
    },
    9780814735206 : {
        handle : '2333.1/9kd51dv3',
    },
    9780814735237 : {
        handle : '2333.1/2280gcth',
    },
    9780814735282 : {
        handle : '2333.1/xd25496n',
    },
    9780814735305 : {
        handle : '2333.1/5tb2rd9k',
    },
    9780814735336 : {
        handle : '2333.1/fbg79fcf',
    },
    9780814735923 : {
        handle : '2333.1/pvmcvgdw',
    },
    9780814742297 : {
        handle : '2333.1/15dv439j',
    },
    9780814742303 : {
        handle : '2333.1/dbrv175n',
    },
    9780814742358 : {
        handle : '2333.1/8kprr6mx',
    },
    9780814746622 : {
        handle : '2333.1/7m0cg0c2',
    },
    9780814746677 : {
        handle : '2333.1/h44j11fx',
    },
    9780814746929 : {
        handle : '2333.1/rn8pk2gc',
    },
    9780814747148 : {
        handle : '2333.1/wdbrv30q',
    },
    9780814750957 : {
        handle : '2333.1/vdncjvrd',
    },
    9780814751008 : {
        handle : '2333.1/3xsj3wkj',
    },
    9780814751213 : {
        handle : '2333.1/05qftw3j',
    },
    9780814755112 : {
        handle : '2333.1/z612jp24',
    },
    9780814755297 : {
        handle : '2333.1/qnk98v8h',
    },
    9780814755471 : {
        handle : '2333.1/bcc2fspb',
    },
    9780814755969 : {
        handle : '2333.1/2z34tpd1',
    },
    9780814757970 : {
        handle : '2333.1/jwstqmh0',
    },
    9780814761908 : {
        handle : '2333.1/f4qrfm0w',
    },
    9780814766569 : {
        handle : '2333.1/9ghx3h44',
    },
    9780814774410 : {
        handle : '2333.1/8gtht8zb',
    },
    9780814774434 : {
        handle : '2333.1/0zpc87xv',
    },
    9780814774458 : {
        handle : '2333.1/rfj6q71f',
    },
    9780814774632 : {
        handle : '2333.1/hx3ffd6n',
    },
    9780814774694 : {
        handle : '2333.1/d7wm39fk',
    },
    9780814774755 : {
        handle : '2333.1/w6m907jq',
    },
    9780814774816 : {
        handle : '2333.1/4qrfj8f6',
    },
    9780814774823 : {
        handle : '2333.1/sf7m0f78',
    },
    9780814779163 : {
        handle : '2333.1/7h44j2rq',
    },
    9780814779170 : {
        handle : '2333.1/c866t382',
    },
    9780814779965 : {
        handle : '2333.1/v6wwq19j',
    },
    9780814780015 : {
        handle : '2333.1/3r22827k',
    },
    9780814780213 : {
        handle : '2333.1/msbcc48d',
    },
    9780814780978 : {
        handle : '2333.1/000001ns',
    },
    9780814782194 : {
        handle : '2333.1/qjq2bxgz',
    },
    9780814787922 : {
        handle : '2333.1/g1jwswgh',
    },
    9780814793114 : {
        handle : '2333.1/2rbnztw9',
    },
    9780814793398 : {
        handle : '2333.1/b8gthvz5',
    },
    9781479804948 : {
        handle : '2333.1/r7sqvjrf',
    },
    9781479820375 : {
        handle : '2333.1/k3j9kppk',
    },
    9781479824243 : {
        handle : '2333.1/73n5tfjs',
    },
    9781479835737 : {
        handle : '2333.1/c866tbmx',
    },
    9781479849857 : {
        handle : '2333.1/w0vt4k7p',
    },
    9781479852758 : {
        handle : '2333.1/0p2ngnvk',
    },
    9781479892464 : {
        handle : '2333.1/f1vhhwrf',
    },
    9781479899982 : {
        handle : '2333.1/brv15j8p',
    },
};

function getHandleForEpub( epubId ) {
    if ( epubId in EPUB_HANDLES ) {
        return EPUB_HANDLES[ epubId ].handle;
    } else {
        return;
    }
}

function getHandleUrlForEpub( epubId ) {
    // Can't use path.join() because it changes "http://" to "http:/".
    return `${ BASE_URL }${ getHandleForEpub( epubId ) }`;
}

module.exports = {
    getHandleForEpub,
    getHandleUrlForEpub,
};
