import React from 'react';
import './Home.css';
import { Typography, Button } from '@material-ui/core';
import { Link } from 'react-router-dom';
import RecordingsTable from '../containers/RecordingsTable';

function Home() {
  return (
    <div>
      <Typography component="p">
        Analysis and vis of neurophysiology recordings and spike sorting results.
      </Typography>
      <p />
      <div>
        <Button component={Link} to="/importRecordings">Import recordings</Button>
      </div>
      <RecordingsTable />
    </div>
  );
}

export default Home;
