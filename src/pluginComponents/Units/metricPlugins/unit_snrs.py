import hither as hi
import kachery as ka
import numpy as np

from labbox_ephys import prepare_snippets_h5
from labbox_ephys.helpers.get_unit_waveforms import get_unit_waveforms

@hi.function('get_unit_snrs', '0.1.0')
@hi.container('docker://magland/labbox-ephys-processing:0.3.19')
@hi.local_modules(['../../../../python/labbox_ephys'])
def get_unit_snrs(snippets_h5):
    import h5py
    h5_path = ka.load_file(snippets_h5)
    ret = {}
    with h5py.File(h5_path, 'r') as f:
        unit_ids = np.array(f.get('unit_ids'))
        for unit_id in unit_ids:
            unit_waveforms = np.array(f.get(f'unit_waveforms/{unit_id}/waveforms')) # n x M x T
            ret[str(unit_id)] = _compute_unit_snr_from_waveforms(unit_waveforms)
    return ret

def _compute_unit_snr_from_waveforms(waveforms):
    average_waveform = np.mean(waveforms, axis=0)
    channel_amplitudes = (np.max(average_waveform, axis=1) - np.min(average_waveform, axis=1)).squeeze() # M
    peak_channel_index = np.argmax(channel_amplitudes)
    mean_subtracted_waveforms_on_peak_channel = waveforms[:, peak_channel_index, :] - average_waveform[peak_channel_index]
    est_noise_level = np.median(np.abs(mean_subtracted_waveforms_on_peak_channel.squeeze())) / 0.6745  # median absolute deviation (MAD) estimate of stdev
    peak_channel_amplitude = channel_amplitudes[peak_channel_index]
    snr = peak_channel_amplitude / est_noise_level
    return snr

@hi.function('createjob_get_unit_snrs', '')
def createjob_get_unit_snrs(labbox, sorting_object, recording_object, configuration={}):
    jh = labbox.get_job_handler('partition2')
    jc = labbox.get_default_job_cache()
    with hi.Config(
        job_cache=jc,
        job_handler=jh,
        container=jh.is_remote
    ):
        snippets_h5 = prepare_snippets_h5.run(recording_object=recording_object, sorting_object=sorting_object)
        return get_unit_snrs.run(
            snippets_h5=snippets_h5
        )