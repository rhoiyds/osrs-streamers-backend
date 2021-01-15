import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionActions from '@material-ui/core/AccordionActions';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';

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
       const verifiedStreamer = verifiedStreamers.find(streamer => streamer.twitchName == streamerToVerify.twitchName)
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
        fetch('http://localhost:3000/streamer/' + streamerToDelete.twitchName + '/name/' + streamerToDelete.characterName, requestOptions)
        .then(res => res.json())
        .then((data) => {
            console.log(data)
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
        props.unverifiedStreamers.map((item) => (
      <Accordion key={item} TransitionProps={{ unmountOnExit: true }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1c-content"
                  id="panel1c-header"
                >
                  <div className={classes.column}>
                    <Typography className={classes.heading}>
                        {item.twitchName}
                    </Typography>
                    <Typography className={classes.secondaryHeading}>
                        {getAdditionalCharacterNames(item)}
                    </Typography>
                  </div>
                  <div className={classes.column}>
                    <Typography className={classes.secondaryHeading}>
                        <TextField
                          label="Character name"
                          defaultValue={item.characterName}
                          onChange={(e) => handleOnNameModify(item, e)}
                        />
                    </Typography>
                  </div>
                <div className={classes.column}>
                    <img src={`data:image/jpeg;base64,${item.preprocessedImage}`} height="40px" alt="Preprocessed" />
                </div>
                </AccordionSummary>
                <AccordionDetails className={classes.details}>
                  <div className={classes.column}>
                    <img src={`data:image/jpeg;base64,${item.detections}`} height="650px" alt="Detections"/>
                  </div>
                </AccordionDetails>
                <Divider />
                <AccordionActions>
                  <Button size="small" onClick={() => handleSkipClick(item)}>Skip</Button>
                  <Button size="small" color="primary" onClick={() => handleVerifyClick(item)}>
                    Verify
                  </Button>
                </AccordionActions>
      </Accordion>
       ))
      }
    </div>
  );
}


