#!/bin/bash

# This script is based on Django Haystack `test_haystack/solr_tests/server/start-solr-test-server.sh`:
# https://github.com/django-haystack/django-haystack/blob/106e660867398612c7e080fd512685210f3b2e4f/test_haystack/solr_tests/server/start-solr-test-server.sh

set -e

SOLR_VERSION=3.6.0

cd $(dirname $0)

export TEST_ROOT=$(pwd)

export CONFIG_FILES=${TEST_ROOT}/config-files
export SOLR_ARCHIVE="${TEST_ROOT}/download-cache/${SOLR_VERSION}.tgz"
export SOLR_ROOT=${TEST_ROOT}/solr-${SOLR_VERSION}
export SOLR_CORE=${SOLR_ROOT}/solr/em-test

if [ -f ${SOLR_ARCHIVE} ]; then
    # If the tarball doesn't extract cleanly, remove it so it'll download again:
    tar -tf ${SOLR_ARCHIVE} > /dev/null || rm ${SOLR_ARCHIVE}
fi

if [ ! -f ${SOLR_ARCHIVE} ]; then
    SOLR_DOWNLOAD_URL="http://archive.apache.org/dist/lucene/solr/${SOLR_VERSION}/apache-solr-${SOLR_VERSION}.tgz"
    curl -Lo $SOLR_ARCHIVE ${SOLR_DOWNLOAD_URL} || ( echo "Unable to download ${SOLR_DOWNLOAD_URL}"; exit 2 )
fi

echo "Extracting Solr ${SOLR_VERSION} to $(basename ${SOLR_ROOT})"
rm -rf $SOLR_ROOT
mkdir $SOLR_ROOT
tar -C $SOLR_ROOT -xf ${SOLR_ARCHIVE} --strip-components 2 apache-solr-${SOLR_VERSION}/example
tar -C $SOLR_ROOT -xf ${SOLR_ARCHIVE} --strip-components 1 apache-solr-${SOLR_VERSION}/dist apache-solr-${SOLR_VERSION}/contrib

echo 'Configuring Solr'

mkdir $SOLR_CORE
mv ${SOLR_ROOT}/solr/{bin,conf} $SOLR_CORE

cp -p ${CONFIG_FILES}/solr.xml       ${SOLR_ROOT}/solr/solr.xml
cp -p ${CONFIG_FILES}/solrconfig.xml ${SOLR_CORE}/conf/solrconfig.xml
cp -p ${CONFIG_FILES}/schema.xml     ${SOLR_CORE}/conf/schema.xml

echo 'Starting server'

cd $SOLR_ROOT

# We use exec to allow process monitors to correctly kill the
# actual Java process rather than this launcher script:
export CMD="java -Djetty.port=9001 -Djava.awt.headless=true -Dapple.awt.UIElement=true -jar start.jar"

if [ -z "${BACKGROUND_SOLR}" ]; then
    exec $CMD
else
    exec $CMD >/dev/null &
fi
