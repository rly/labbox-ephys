import hither as hi

@hi.function('get_isi_violation_rates', '0.1.0')
@hi.container('docker://magland/labbox-ephys-processing:0.2.18')
@hi.local_modules(['../../../../python/labbox_ephys'])
def get_isi_violation_rates(sorting_object, recording_object, configuration={}):
    import labbox_ephys as le
    import spikemetrics as sm
    S = le.LabboxEphysSortingExtractor(sorting_object)
    R = le.LabboxEphysRecordingExtractor(recording_object)

    samplerate = R.get_sampling_frequency()
#    duration_sec = R.get_num_frames() / samplerate

    isi_threshold_msec = configuration.get('isi_threshold_msec', 2.5)
    unit_ids = configuration.get('unit_ids', S.get_unit_ids())

    ret = {}
    for id in unit_ids:
        spike_train = S.get_unit_spike_train(unit_id=id)
        ret[str(id)], _ = sm.metrics.isi_violations( #_ is total violations
            spike_train=spike_train,
            duration=R.get_num_frames(),
            isi_threshold=isi_threshold_msec / 1000 * samplerate
        )
    return ret