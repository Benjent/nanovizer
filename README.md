# NanoVizer

TODO NanoVizer explainations

## Requirements

- Git
- Python 3
- npm

## Using NanoVizer for the first time

1. Install dependencies

    1. [Download and install Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

    2. [Download and install Python](https://www.python.org/downloads/)

    3. [Download and install npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

2. Setup the project

    1. Go to where you want the NanoVizer repository to be installed

    2. Setup the backend of NanoVizer

        1. Clone the repository

            ```sh
            git clone TODO
            ```

        2. Go to the newly created *nanovizer* folder

        3. Open a terminal and install the dependencies

            ```sh
            apt-get update -y && apt-get install -y python3-pip python-dev bedtools && pip3 install Flask Flask-Cors
            ```

    3. Setup the frontend of NanoVizer

        1. Return to where the NanoVizer repository is installed

        2. Clone the repository

            ```sh
            git clone TODO
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
