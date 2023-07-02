import GpxParser from 'gpxparser';
import { atom, computed } from 'nanostores'
import { getTreksIntervalsValues } from './state.helper';

export const $gpx = atom('');

export function loadGPX(file) {
    var reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = function (evt) {
        $gpx.set(evt.target.result.toString());
    }
    reader.onerror = function (evt) {
        console.log("error reading file", evt);
    }
}

export const $currentStep = atom(null);
export const $lineWeight = atom(6);
export const $lineColor = atom('#E90064');

const $parsedGPX = computed($gpx, gpx => {
    const myParser = new GpxParser();
    myParser.parse(gpx);
    return myParser
})

export const $gpxInfos = computed($parsedGPX, obj => {
    let distance = 0;

    let minLatGlobal = null, maxLatGlobal = null, minLngGlobal = null, maxLngGlobal = null;

    const tracks = [];

    obj.tracks.forEach(function (track, index) {

        distance += track.distance.total;

        const datasetLocal = {
            label: 'Elevation (m)',
            data: [],
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        };

        const dataLocal = {
            labels: [],
            datasets: []
        }

        let minLatLocal = null, maxLatLocal = null, minLngLocal = null, maxLngLocal = null;
        track.points.forEach(function (point, index) {
            if (minLatGlobal === null || minLatGlobal > point.lat) {
                minLatGlobal = point.lat;
            }
            if (maxLatGlobal === null || maxLatGlobal < point.lat) {
                maxLatGlobal = point.lat;
            }
            if (minLngGlobal === null || minLngGlobal > point.lon) {
                minLngGlobal = point.lon;
            }
            if (maxLngGlobal === null || maxLngGlobal < point.lon) {
                maxLngGlobal = point.lon;
            }

            if (minLatLocal === null || minLatLocal > point.lat) {
                minLatLocal = point.lat;
            }
            if (maxLatLocal === null || maxLatLocal < point.lat) {
                maxLatLocal = point.lat;
            }
            if (minLngLocal === null || minLngLocal > point.lon) {
                minLngLocal = point.lon;
            }
            if (maxLngLocal === null || maxLngLocal < point.lon) {
                maxLngLocal = point.lon;
            }

            if ((point.ele || point.ele === 0)) {
                const el = {...point, distance: track.distance.cumul[index]};
                datasetLocal.data.push(el);
            }
        });
        
        const localChart = getTreksIntervalsValues(datasetLocal.data);

        datasetLocal.data = localChart.data;
        dataLocal.datasets.push(datasetLocal);
        dataLocal.labels = localChart.labels;

        tracks.push({
            id: index,
            name: track.name,
            distance: track.distance.total,
            shape: {
                minLat: minLatLocal,
                maxLat: maxLatLocal,
                minLng: minLngLocal,
                maxLng: maxLngLocal,
            },
            chart: datasetLocal.data.length > 0 ? dataLocal : null,
        })
    });


    tracks.sort((a, b) => (a?.name ?? '').localeCompare(b?.name ?? ''));

    return {
        tracks,
        id: -1,
        name: "L'ensemble du parcours",
        distance,
        shape: {
            minLat: minLatGlobal,
            maxLat: maxLatGlobal,
            minLng: minLngGlobal,
            maxLng: maxLngGlobal,
        },
        chart: null, // tracks order not garanted
    }
})