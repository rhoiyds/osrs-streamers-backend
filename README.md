# OSRS Streamers backend
_A codebase for running Tensorflow inference and Tesseract OCR on thumbnails of Twitch streams to create relationships between Twitch accounts and OSRS character names. The automation of managing the [OSRS Streamers plugin](https://github.com/rhoiyds/osrs-streamers)_

##Resulting site
![Site preview](site_preview.gif?raw=true "Site preview")

3 sections of the site, built with React.
- Verified _Manually create, update, remove character names from streamers_
- Review _Double check the inference and OCR has correctly identified a new streamer character name, and quickly edit, add or dismiss_
- JSON _Retrieve the resulting JSON to update the streamers.json file for the OSRS Streamers plugin_

##Building instructions
- The application has been split into two dockerised containers, one responsible for crawling Twitch, running inference and OCR, the other for providing an interface for manual verification. 
- The goal is to mount the same directory from the host machine on both containers to share data (streamer-getter provides, verify-streamers consumes)
- Run the verify-streamers build command from the 'verify-streamers' folder, and the streamer-getter build command from the repository root.


    docker build -t royporter7/verify-streamers . && docker run -d --name verify-streamers -it -v <ABSOLUTE PATH DIRECTORY TO THIS REPO>\streamers:/streamers --restart always -p 127.0.0.1:3002:8080/tcp -p 127.0.0.1:3003:3000/tcp royporter7/verify-streamers:latest
    docker build -t royporter7/streamer-getter -f streamer-getter/Dockerfile . && docker run -d --name streamer-getter -it -v <ABSOLUTE PATH DIRECTORY TO THIS REPO>\streamers:/streamers -v <ABSOLUTE PATH DIRECTORY TO THIS REPO>\streamer-getter:/streamer-getter-dev --restart always royporter7/streamer-getter:latest

You can run the streamer-getter logic periodically from the host container using docker exec commands (bat, shell, etc), be sure to pass a Twitch user auth token.

    docker exec streamer-getter python /streamer-getter.py <TWITCH USER AUTH TOKEN>


