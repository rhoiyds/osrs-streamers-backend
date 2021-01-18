const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require("path");

const app = express();
const port = 3000;

app.use(cors());


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/unverifiedStreamers", (req, res, next) => {
    let unverifiedStreamers = []
    const streamerFolder = './streamers/';

    for (let [index, streamer] of fs.readdirSync(streamerFolder).entries()) {
      fs.readdirSync(streamerFolder + streamer).forEach(characterName => {
        unverifiedStreamers.push({
            twitchName: streamer,
            characterName: characterName,
            preprocessedImage: fs.readFileSync(streamerFolder + streamer + '/' + characterName + '/preprocessed_image.png', { encoding: 'base64' })
        })
      })
    };
    return res.json(unverifiedStreamers);
});

app.delete("/streamer/:streamer/name/:name", function(req, res){
    const streamerFolder = './streamers/';
    const streamer = req.params['streamer']
    const name = req.params['name']

    return fs.rmdirSync(streamerFolder + streamer + "/" + name, { recursive: true });

})

app.get("/streamer/:streamer/name/:name", function(req, res){
    const streamer = req.params['streamer']
    const name = req.params['name']
    const streamerFolder = '/streamers/';
    const path = streamerFolder + streamer + '/' + name + '/thumbnail.png'
    if (fs.existsSync(path)) {
       return res.sendFile(path)
    }
    return res.sendFile(streamerFolder + streamer + '/' + name + '/detections.png')
})

app.listen(port, () => console.log(`Verified streamer server listening on port ${port}!`));

