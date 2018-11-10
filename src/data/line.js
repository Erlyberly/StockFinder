export function data(chart) {

	var labels = [];
	var data = [];

	chart.forEach(chart => {
		labels.push(chart['label']);
		data.push(chart['close']);
	});

  var out = {
    labels: labels,
    datasets: [
      {
        label: 'Close price',
        fill: false,
        lineTension: 0.01,
        backgroundColor: 'rgba(75,192,192,1)',
        borderColor: 'rgba(75,192,192,1)',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: 'rgba(75,192,192,1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(75,192,192,1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: data
      }
    ]
  }

  return out;
}
