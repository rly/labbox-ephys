import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import NiceTable from '../components/NiceTable'
import { deleteSortings, setSortingInfo, sleep } from '../actions';
import { createHitherJob } from '../hither';
import { Link } from 'react-router-dom';
import { CircularProgress } from '@material-ui/core';
import { getPathQuery } from '../kachery';

const SortingsTable = ({ sortings, onDeleteSortings, onSetSortingInfo, documentInfo }) => {
    const { documentId, feedUri, readOnly } = documentInfo;

    function sortByKey(array, key) {
        return array.sort(function (a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }

    sortings = sortByKey(sortings, 'sortingLabel');

    const effect = async () => {
        for (const sor of sortings) {
            if (!sor.sortingInfo) {
                let info;
                try {
                    // for a nice gui effect
                    await sleep(400);
                    const sortingInfoJob = await createHitherJob(
                        'createjob_get_sorting_info',
                        { sorting_object: sor.sortingObject, recording_object: sor.recordingObject },
                        {
                            kachery_config: {},
                            hither_config: {
                            },
                            useClientCache: true,
                            newHitherJobMethod: true
                        }
                    )
                    info = await sortingInfoJob.wait();
                    onSetSortingInfo({ sortingId: sor.sortingId, sortingInfo: info });
                }
                catch (err) {
                    console.error(err);
                    return;
                }
            }
        }
    }
    useEffect(() => { effect() })

    const rows = sortings.map(s => ({
        sorting: s,
        key: s.sortingId,
        sortingLabel: {
            text: s.sortingLabel,
            element: <Link title={"View this sorting"} to={`/${documentId}/sorting/${s.sortingId}${getPathQuery({feedUri})}`}>{s.sortingLabel}</Link>,
        },
        numUnits: s.sortingInfo ? s.sortingInfo.unit_ids.length : {element: <CircularProgress />}
    }));

    const columns = [
        {
            key: 'sortingLabel',
            label: 'Sorting'
        },
        {
            key: 'numUnits',
            label: 'Num. units'
        }
    ]

    return (
        <div>
            <NiceTable
                rows={rows}
                columns={columns}
                deleteRowLabel={"Remove this sorting"}
                onDeleteRow={readOnly ? null : (row) => onDeleteSortings([row.sorting.sortingId])}
            />
        </div>
    );
}

const mapStateToProps = (state, ownProps) => (
    {
        sortings: ownProps.sortings || state.sortings,
        documentInfo: state.documentInfo
    }
)

const mapDispatchToProps = dispatch => ({
    onDeleteSortings: sortingIds => dispatch(deleteSortings(sortingIds)),
    onSetSortingInfo: ({ sortingId, sortingInfo }) => dispatch(setSortingInfo({ sortingId, sortingInfo }))
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SortingsTable)
