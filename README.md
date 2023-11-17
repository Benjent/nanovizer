# <img src="./src/assets/images/logos/nanovizer-dark-theme.svg#gh-dark-mode-only" alt="NanoVizer dark theme logo" width="320px" />
# <img src="./src/assets/images/logos/nanovizer-light-theme.svg#gh-light-mode-only" alt="NanoVizer light theme logo" width="320px" />

![GitHub last commit](https://img.shields.io/github/last-commit/google/skia.svg?style=flat) ![GitHub CI](https://github.com/Benjent/nanovizer/actions/workflows/main.yml/badge.svg)

![GitHub Pages badge](https://img.shields.io/badge/GitHub_Pages-222222?logo=github&logoColor=white) ![Vue.js badge](https://img.shields.io/badge/Vue.js_3-42b883?logo=vuedotjs&logoColor=white) ![Sass badge](https://img.shields.io/badge/Sass-cf649a?logo=sass&logoColor=white) ![D3.js badge](https://img.shields.io/badge/D3.js-ef7234?logo=d3&logoColor=white) ![Conventional commits badge](https://img.shields.io/badge/Conventional_commits-fa6673?logo=conventionalcommits&logoColor=white) ![ESLint badge](https://img.shields.io/badge/ESLint-4b32c3?logo=eslint&logoColor=white)

NanoVizer is an interactive data-visualisation and chart-saver tool assisting researchers in their work.

This is a [Vue.js v3](https://vuejs.org/) project bootstrapped with [Create Vue](https://github.com/vuejs/create-vue).

[See it live](https://benjent.github.io/nanovizer/).

## Table of contents

- [Requirements](#requirements)
- [Using NanoVizer for the first time](#using-nanovizer-for-the-first-time)
- [Running NanoVizer](#running-nanovizer)

## Requirements

- [Git](https://git-scm.com/downloads)
- [Python 3](https://www.python.org/downloads/)
- [Node and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

## Using NanoVizer for the first time

1. Install dependencies

    1. [Download and install Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

    2. [Download and install Python](https://www.python.org/downloads/)

    3. [Download and install npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

2. Set up the project

    1. Go where you want the NanoVizer repository to be installed to

    2. Set up the backend of NanoVizer

        1. Clone the repository

            ```sh
            git clone https://github.com/CorentinAube/NanoViZer.git
            ```

        2. Go to the newly created *nanovizer* folder

        3. Open a terminal and install the dependencies

            ```sh
            apt-get update -y && apt-get install -y python3-pip python-dev bedtools && pip3 install Flask Flask-Cors
            ```

    3. Set up the frontend of NanoVizer

        1. Return to where the NanoVizer repository is installed

        2. Clone the repository

            ```sh
            git clone https://github.com/Benjent/nanovizer.git
            ```

        3. Go to the newly created *nanovizer-front* folder

        4. Open a terminal and install the dependencies

            ```sh
            npm install
            ```

3. Follow the steps in the *Running NanoVizer* section

## Running NanoVizer

1. Run the project

    - Using the vanilla method

        1. Run the backend in a terminal

            ```sh
            app.py
            ```

        2. Run the frontend in another terminal

            ```sh
            npm run dev
            ```

    - Using the custom method

        ```sh
        python3 app.py
        ```

2. Open a browser tab and go to the following URL

    ```sh
    http://localhost:3000/
    ```

3. Put the .bam file in the */data* folder

## FAQ

### How to open a terminal?

Inside the file explorer, right click and click on *Git bash here*.

### Why not using a serverless app?

- This project is intended to run for free
- .bam files are too heavy to manipulate for free
- It is faster to move .bam files in a local directory compared to uploading them in the cloud
