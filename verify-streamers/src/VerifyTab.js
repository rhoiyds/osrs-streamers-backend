import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton';
import CheckIcon from '@material-ui/icons/Check';
import ReplayIcon from '@material-ui/icons/Replay';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  icon: {
    verticalAlign: 'bottom',
    height: 20,
    width: 20,
  },
  details: {
    alignItems: 'center',
  },
  column: {
    flexBasis: '33.33%',
  },
  helper: {
    borderLeft: `2px solid ${theme.palette.divider}`,
    padding: theme.spacing(1, 2),
  },
  link: {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

export default function VerifyTab(props) {
  const classes = useStyles();

      const handleSkipClick = (streamerToSkip) => {
        const unverifiedStreamers = props.unverifiedStreamers.filter(streamer => streamer !== streamerToSkip)
        deleteUnverifiedStreamer(streamerToSkip)
        props.onChange({unverifiedStreamers: unverifiedStreamers})
      };

    const handleVerifyClick = (streamerToVerify) => {
       const verifiedStreamers = props.verifiedStreamers.slice()
       const verifiedStreamer = verifiedStreamers.find(streamer => streamer.twitchName === streamerToVerify.twitchName)
      if (verifiedStreamer) {
        verifiedStreamer.characterNames.push(streamerToVerify.characterName)
      } else {
        verifiedStreamers.push({twitchName: streamerToVerify.twitchName, characterNames: [streamerToVerify.characterName]})
      }
      const unverifiedStreamers = props.unverifiedStreamers.filter(streamer => streamer !== streamerToVerify)
      deleteUnverifiedStreamer(streamerToVerify)
      props.onChange({verifiedStreamers: verifiedStreamers, unverifiedStreamers: unverifiedStreamers})
    };

    const deleteUnverifiedStreamer = (streamerToDelete) => {
         const requestOptions = {
            method: 'DELETE'
         };
        fetch('http://localhost:' + process.env.REACT_APP_API_PORT + '/streamer/' + streamerToDelete.twitchName + '/name/' + streamerToDelete.characterName, requestOptions)
        .then((res) => {
            console.log(res)
        })
        .catch(console.log)
    }

    const handleOnNameModify = (unverifiedStreamer, event) => {
        unverifiedStreamer.characterName = event.target.value
    }
    const getAdditionalCharacterNames = (unverifiedStreamer) => {
        const verifiedStreamer = props.verifiedStreamers.find(streamer => streamer.twitchName === unverifiedStreamer.twitchName)
        if (verifiedStreamer) {
            return verifiedStreamer.characterNames.join(', ')
        }
        return ''
    }

  return (
    <div className={classes.root}>
    {
        props.unverifiedStreamers.slice(0,10).map((item, index) => (
      <Accordion key={index + item.twitchName + item.characterName} TransitionProps={{ unmountOnExit: true }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1c-content"
                  id="panel1c-header"
                >
                  <div className={classes.column}>
                    <Typography className={classes.heading}>
                        <a target="_blank" rel="noreferrer" href={"https://twitch.tv/" + item.twitchName}> {item.twitchName} </a>
                    </Typography>
                    <Typography className={classes.secondaryHeading}>
                        {getAdditionalCharacterNames(item)}
                    </Typography>
                  </div>
                  <div className={classes.column}>
                    <div className={classes.secondaryHeading}>
                        <TextField
                          label="Character name"
                          defaultValue={item.characterName}
                          onClick={(event) => event.stopPropagation()}
                          onFocus={(event) => event.stopPropagation()}
                          onChange={(e) => handleOnNameModify(item, e)}
                        />
                    </div>
                  </div>
                <div className={classes.column}>
                    <img src={`data:image/jpeg;base64,${item.preprocessedImage}`} height="40px" alt="Preprocessed" />
                </div>
                <div className={classes.column}>
                  <IconButton aria-label="check" onFocus={(event) => event.stopPropagation()} onClick={(event) => {event.stopPropagation(); handleVerifyClick(item)}}>
                    <CheckIcon />
                  </IconButton>
                    <IconButton aria-label="replay" onFocus={(event) => event.stopPropagation()} onClick={(event) => {event.stopPropagation(); handleSkipClick(item)}}>
                      <ReplayIcon />
                    </IconButton>
                </div>
                </AccordionSummary>
                <AccordionDetails className={classes.details}>
                  <div className={classes.column}>
                    <img src={"http://localhost:" + process.env.REACT_APP_API_PORT + "/streamer/" + item.twitchName + "/name/" + item.characterName} height="650px" alt="Thumbnail"/>
                  </div>
                </AccordionDetails>
      </Accordion>
       ))
      }
    </div>
  );
}


