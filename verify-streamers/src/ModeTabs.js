import React from 'react';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import AssignmentIcon from '@material-ui/icons/Assignment';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import JsonViewer from './JsonViewer';
import VerifyTab from './VerifyTab';
import VerifiedList from './VerifiedList';


const useStyles = makeStyles({
  root: {
    flexGrow: 1
  },
});

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-prevent-tabpanel-${index}`}
      aria-labelledby={`scrollable-prevent-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography component={'span'}>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

export default function ModeTabs(props) {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Paper square className={classes.root}>
      <Tabs
        value={value}
        onChange={handleChange}
        variant="fullWidth"
        indicatorColor="secondary"
        textColor="secondary"
        aria-label="icon label tabs example"
      >
        <Tab icon={<CheckCircleIcon />} label="VERIFIED" />
        <Tab icon={<AddCircleIcon />} label={"REVIEW " + props.unverifiedStreamers.length} />
        <Tab icon={<AssignmentIcon />} label="JSON" />
      </Tabs>
        <TabPanel value={value} index={0}>
          <VerifiedList verifiedStreamers={props.verifiedStreamers} onChange={props.onChange}></VerifiedList>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <VerifyTab verifiedStreamers={props.verifiedStreamers} unverifiedStreamers={props.unverifiedStreamers} onChange={props.onChange}></VerifyTab>
        </TabPanel>
        <TabPanel value={value} index={2}>
          <JsonViewer verifiedStreamers={props.verifiedStreamers}></JsonViewer>
        </TabPanel>
    </Paper>
  );
}