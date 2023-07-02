export function getTreksIntervalsValues(points) {

    let count = 0;
    const step = 1000;
    const labels = [];
    const data = [];

    let previousPoint = null;
    for (const point of points) {

        if (point.distance > (step * count)) {
            labels.push(`${(count * step / 1000)}`);
            data.push(point.ele);
            count++;
        } 

        previousPoint = point;
    }

    if(previousPoint && previousPoint.distance !== (step * count)) {
        labels.push(`${(previousPoint.distance / 1000).toFixed(1)}`);
        data.push(previousPoint.ele);
    }

    return { data, labels };
}