#!/usr/bin/env bash

BASEDIR=$(cd "$(dirname "$0")" ; pwd -P )

cd $BASEDIR

node em.js
