#!/bin/bash

build() {
    echo 'deleting dist'
    rm -rf dist/*
    echo 'exporting env variables'
    export INLINE_RUNTIME_CHUNK=false
    export GENERATE_SOURCEMAP=false
    export NODE_OPTIONS=--openssl-legacy-provider
    echo 'building react'

    npx react-scripts build
    echo 'generating rules'
    node scripts/generate-rules.js
    echo 'file cleanup'
    mkdir -p dist
    cp -r build/* dist
    mkdir dist/bg_scripts
    cp -r src/bg_scripts/* dist/bg_scripts
    cp src/hover_logo.jpg dist/

    mv dist/index.html dist/popup.html
    
}

build
