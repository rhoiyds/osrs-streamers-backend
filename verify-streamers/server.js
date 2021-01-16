const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require("path");

const app = express();
const port = 3000;

app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/unverifiedStreamers", (req, res, next) => {
    let unverifiedStreamers = []
    const streamerFolder = './streamers/';

    for (let [index, streamer] of fs.readdirSync(streamerFolder).entries()) {
      if (index == 20) {
        break;
      }
      fs.readdirSync(streamerFolder + streamer).forEach(characterName => {
        unverifiedStreamers.push({
            twitchName: streamer,
            characterName: characterName,
            detections: fs.readFileSync(streamerFolder + streamer + '/' + characterName + '/detections.png', { encoding: 'base64' }),
            preprocessedImage: fs.readFileSync(streamerFolder + streamer + '/' + characterName + '/preprocessed_image.png', { encoding: 'base64' })
        })
      })
    };
    res.json(unverifiedStreamers);
});

app.delete("/streamer/:streamer/name/:name", function(req, res){
    const streamerFolder = './streamers/';
    const streamer = req.params['streamer']
    const name = req.params['name']

    fs.rmdirSync(streamerFolder + streamer + "/" + name, { recursive: true });

})

app.listen(port, () => console.log(`Verified streamer server listening on port ${port}!`));

