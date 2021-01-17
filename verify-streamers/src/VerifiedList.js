import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import Paper from '@material-ui/core/Paper';

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

export default function VerifiedList(props) {
  const classes = useStyles();

    const updateName = (verifiedStreamer, oldName, newName) => {
        verifiedStreamer.characterNames = [...verifiedStreamer.characterNames.filter(name => name !== oldName), newName]
    }

    const deleteName = (verifiedStreamer, characterName) => {
        const verifiedStreamersCopy = props.verifiedStreamers.slice()
        const verifiedStreamerCopy = verifiedStreamersCopy.find(vs => vs.twitchName === verifiedStreamer.twitchName)
        verifiedStreamerCopy.characterNames = verifiedStreamerCopy.characterNames.filter(name => name !== characterName)
        props.onChange({verifiedStreamers: verifiedStreamersCopy})
    }

    const addName = (verifiedStreamer) => {
        const inputField = document.getElementById('new-name');
        const verifiedStreamersCopy = props.verifiedStreamers.slice()
        const verifiedStreamerCopy = verifiedStreamersCopy.find(vs => vs.twitchName === verifiedStreamer.twitchName)
        verifiedStreamerCopy.characterNames.push(inputField.value)
        props.onChange({verifiedStreamers: verifiedStreamersCopy})
    }

    const addStreamer = () => {
        const newTwitch = document.getElementById('new-twitch').value;
        const newCharacter = document.getElementById('new-character').value;
        const verifiedStreamersCopy = props.verifiedStreamers.slice()
        verifiedStreamersCopy.push({twitchName: newTwitch, characterNames: [newCharacter]})
        document.getElementById('new-twitch').value = "";
        document.getElementById('new-character').value = "";
        props.onChange({verifiedStreamers: verifiedStreamersCopy})
    }


  return (
    <div className={classes.root}>
    <Paper>
      <TextField id="new-twitch" required label="Twitch"/> <TextField required id="new-character" label="Character name"/>
      <IconButton aria-label="add" onClick={addStreamer}>
         <AddIcon />
       </IconButton>
    </Paper>
    {
        props.verifiedStreamers.map((item, index) => (
      <Accordion key={index + item.twitchName} TransitionProps={{ unmountOnExit: true }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1c-content"
                  id="panel1c-header"
                >
                  <div className={classes.column}>
                    <Typography className={classes.heading}>
                        {item.twitchName}
                    </Typography>
                  </div>
                  <div className={classes.column}>
                    <Typography className={classes.secondaryHeading}>
                         <span>
                            {item.characterNames
                              .map(characterName => <span key={item.twitchName + characterName}>{characterName}</span>)
                              .reduce((prev, curr) => [prev, ', ', curr])}
                         </span>
                    </Typography>
                  </div>
                </AccordionSummary>
                <AccordionDetails className={classes.details}>
                  {
                      item.characterNames.map((index, characterName) => (
                          <div className={classes.column} key={index + item.twitchName + characterName}>
                              <TextField
                                defaultValue={characterName}
                                onChange={(e) => {updateName(item, characterName, e.target.value)}}
                              />
                              <IconButton aria-label="delete" onClick={() => { deleteName(item, characterName) }}>
                                <DeleteIcon />
                              </IconButton>
                         </div>
                      ))
                  }
                <div className={classes.column}>
                    <TextField id="new-name"/>
                    <IconButton aria-label="add" onClick={() => { addName(item) }}>
                      <AddIcon />
                    </IconButton>
               </div>
                </AccordionDetails>
      </Accordion>
       ))
      }
    </div>
  );
}


