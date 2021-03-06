import React, { useState } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom';
import RecordingInfoView from '../components/RecordingInfoView';
import SortingsView from '../components/SortingsView';
import SelectSpikeSorter from '../components/SelectSpikeSorter';
import { Button } from '@material-ui/core';
import { startSortingJob, setSortingJobStatus, cancelSortingJobs, addSorting } from '../actions';
import { createHitherJob } from '../hither'

const RunSpikeSortingForRecording = ({ recordingId, recording, sortings, sortingJobs, onStartSortingJob, onSetSortingJobStatus, onCancelSortingJobs, onAddSorting, jobHandlers }) => {
  const [sorter, setSorter] = useState(null);

  if (!recording) {
    return (
      <h3>{`Recording not found: ${recordingId}`}</h3>
    );
  }

  const handleRun = async () => {
    const sortingJobId = randomString(8);
    onStartSortingJob(sortingJobId, recordingId, sorter);
    onSetSortingJobStatus(sortingJobId, 'running');
    let sortingPath, sortingObject;
    try {
      const result = await createHitherJob(
        sorter.algorithm,
        {
          recording_object: recording.recordingObject
          // todo: sorting parameters go here
        },
        {
          kachery_config: {},
          hither_config: {
          },
          job_handler_name: 'default',
          auto_substitute_file_objects: true,
          wait: true,
          useClientCache: false
        }
      );
      sortingPath = result.sorting_file;
      sortingObject = await createHitherJob(
        'get_sorting_object',
        {
          sorting_path: sortingPath,
          recording_object: recording.recordingObject
        },
        {
          wait: true,
          useClientCache: false
        }
      )
    }
    catch (err) {
      console.error(err);
      onSetSortingJobStatus(sortingJobId, 'error');
      return;
    }
    if (!sortingObject) {
      console.error('Problem: sorting not found.');
      onSetSortingJobStatus(sortingJobId, 'error');
      return;
    }
    onSetSortingJobStatus(sortingJobId, 'finished');
    const sorting = {
      sortingId: sortingJobId,
      sortingLabel: sorter.algorithm,
      sortingPath: sortingPath,
      sortingObject: sortingObject,
      recordingId: recordingId,
      recordingPath: recording.recordingPath,
      recordingObject: recording.recordingObject,
      sortingInfo: null
    }
    onAddSorting(sorting);
  }

  return (
    <div>
      <h1>Run spike sorting on {recording.recordingLabel}</h1>
      <div>
        <SelectSpikeSorter sorter={sorter} onSetSorter={setSorter} />
        {sorter && <div><Button onClick={handleRun}>{`Run ${sorter.algorithm}`}</Button></div>}
        <hr />
        <SortingsView sortings={sortings} sortingJobs={sortingJobs} />
        <RecordingInfoView recordingInfo={recording.recordingInfo} />
      </div>
    </div>

  )
}

function randomString(num_chars) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < num_chars; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

const mapStateToProps = (state, ownProps) => ({
  recording: state.recordings.filter(rec => (rec.recordingId === ownProps.recordingId))[0],
  sortings: state.sortings.filter(s => (s.recordingId === ownProps.recordingId)),
  sortingJobs: state.sortingJobs.filter(s => (s.recordingId === ownProps.recordingId)),
  jobHandlers: state.jobHandlers
})

const mapDispatchToProps = dispatch => ({
  onStartSortingJob: (sortingJobId, recordingId, sorter) => dispatch(startSortingJob(sortingJobId, recordingId, sorter)),
  onSetSortingJobStatus: (sortingJobId, status) => dispatch(setSortingJobStatus(sortingJobId, status)),
  onCancelSortingJobs: (sortingJobIds) => dispatch(cancelSortingJobs(sortingJobIds)),
  onAddSorting: (sorting) => dispatch(addSorting(sorting))
})

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(RunSpikeSortingForRecording))
