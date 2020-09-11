import React from 'react';
import { XYPlot, XAxis, YAxis, LineSeries, MarkSeries } from 'react-vis';

const PCAFeatures_rv = (boxSize, plotData, argsObject = {id: 0}, title) => {
    // plotData: {times, features, labels}

    // console.log(plotData);
    if (!plotData.features) {
        // assume no events
        return <div />;
    }

    const xAxisLabel = 'PCA 1';
    const yAxisLabel = 'PCA 2';

    const { features, labels } = plotData;

    const data = features[0].map((v, ii) => ({x: features[0][ii], y: features[1][ii], color: labels[ii]}));

    return (
        <div className="App" width={boxSize.width} height={boxSize.height} display="flex"
            padding={10}
            key={"plot-"+argsObject.id}
        >
            <div style={{textAlign: 'center', fontSize: '12px'}}>{ title || "Waveform PCA features"}</div>
            <XYPlot
                margin={30}
                height={boxSize.height}
                width={boxSize.width}
            >
                <MarkSeries
                    data={data}
                    stroke="black"
                    size={3}
                />
                <XAxis title={xAxisLabel} />
                <YAxis title={yAxisLabel} />
            </XYPlot>
            
        </div>
    );
}



export default PCAFeatures_rv;