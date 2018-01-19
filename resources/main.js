//use d3 v3 ordinal scale, rangeRoundBands(), rangeBand(), and axis to make vertical bar chart.
const margin = {top:90, right:30, bottom:90, left: 65};
const width  = 950 - margin.left - margin.right, 
			height = 660 - margin.top - margin.bottom;
//popup
const tooltip = d3.select('body').append('div')
										.attr('class','toolTip')//set important styling
										.style('position','absolute')
										.style('opacity','0');//start off hidden	
//set scale ranges before receiving data so axis creation can be made ahead of retrieval
const x = d3.time.scale()//this is a version of a linear scale. it's not ordinal
	.range([0,width]);
const y = d3.scale.ordinal()
	.rangeRoundBands([0,height],0);
// const colors = ['#7eaad7','#6fcded','#64d4c7','#bfe67f','#f3f982','#fee484','#ffc98e','#ffb98e','#ff888f','#ff97c7','#de9ecb'];
// const colors = ['#AB0000','#FF0000','#FF822B','#FFD830','#FBFE00','#FFF19B','#B0FF40','#00FFE8','#00C7F1','#4E00FF','#2800AF'];
const colors = ['#0473BA','#00A6DC','#00BEA9','#9CD930','#F2F628','#FFD024','#FFA239','#FF853A','#FF213E','#FB4EA3','#C858A9'];
const colorScale = d3.scale.quantile()//from continuous domain to one of a discrete data set
	.range( colors );
//axes'
const xAxis = d3.svg.axis()//make the axis object using this line and set the appropriate scale and orientation
	.scale(x)
	.orient('bottom')
	.ticks(d3.time.year, 20)//a tick every 20 years
	.tickFormat(d3.time.format.utc('%Y'));
const yAxis = d3.svg.axis()
	.scale(y)
	.orient('left');
// set dims, make bkg, titles of graph
const svg = d3.select('.svgchart');
//bkg
svg.attr('width',width + margin.left + margin.right)
		.attr('height',height + margin.top + margin.bottom)
	.append('rect')
		.attr('class','chartBkg')
		.attr('width',width + margin.left + margin.right)
		.attr('height',height + margin.top + margin.bottom)
		.attr('rx','15')
		.attr('ry','15');
//main title and details
svg.append('text')
		.attr('class', 'chartTitle')
		.text('Monthly Global Land-Surface Temperatures: 1753 - 2015')
		.attr('x', 100)
		.attr('y', 37);
svg.append('text')
		.attr('class', 'titleDetail')
		.text(`Temperature anomalies are relative to the Jan 1951 - Dec 1980 average`)
		.attr('x', 210)
		.attr('y', 60);
svg.append('text')
		.attr('class', 'titleDetail')
		.text(`Estimated Jan 1951 - Dec 1980 absolute temperature °C: 8.66 +/- 0.07`)
		.attr('x', 215)
		.attr('y', 77);
//axis titles
svg.append('text')
		.attr('class', 'yTitle')
		.text('Month')
		.attr('x', 25)
		.attr('y', 350)
		.attr('transform', 'rotate(-90 25,350)');//rotation coords same as x and y position
svg.append('text')
		.attr('class', 'xTitle')
		.text('Year')
		.attr('x', 470)
		.attr('y', 610);

//get the svg for the chart, set dimensions according to margins, append a group inside using the margin info									
const chart = svg.append('g')//make a group within the svg to make use of margins from top left origin point of the group
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

//retrieve the data from somewhere, make error checks, then use it to finish setting up scales before making the graph								
d3.json('/global-temperature.json', function(error,data){
	if(error)console.log(error);//super important. display error if found!!
	// console.log('complete data:', data);
	//format data: filter out duplicate years
	let yearsRange = data.monthlyVariance.map( item => item.year )
		.filter( (item, i, array) => array.indexOf(item) === i );
	//finish scales' domain setup
	//when making date objects of year only from a number, specify a zero-indexed month after also or it will read milliseconds!
	x.domain( [ new Date( d3.min(yearsRange), 0 ), new Date( d3.max(yearsRange)+1, 0 ) ] );//extra year at end to display all data
	// console.log( x.domain() );
	y.domain( [1,2,3,4,5,6,7,8,9,10,11,12] );
	// console.log( y.domain() );
	colorScale.domain( [ d3.min(data.monthlyVariance, item => item.variance ), d3.max(data.monthlyVariance, item => item.variance ) ] );
	// console.log( colorScale.domain() );
	//finish and append axes'
	chart.append('g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(0,'+(height+2)+')')
			.call(xAxis);
	chart.append('g')
			.attr('class', 'y axis')
			.attr('transform', 'translate(-2,0)')//move the path in the axis? maybe change thickness
			.call(yAxis);
	//fine edit axis ticks
	const newTickTexts = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
	document.querySelectorAll('.y.axis text').forEach( (node, i)=> { node.textContent = newTickTexts[i] } );
	//remember that at this point the chart variable is already the group you put into the svg. 
  chart.selectAll('rect')//initiate data join, in this case, the rect elements of this line don't exist yet...
      .data(data.monthlyVariance)//join the data. update selection is returned, it has enter selection hanging off it
		.enter().append('rect')//instantiate the 'g' elements for each item in the selection
			// .attr('class', 'dataRect')
			.style('fill', d => colorScale(d.variance) )
			//get the x position from the x scale by passing it a value fitting its domain.
			.attr('x', d => x( new Date(d.year, 0) ) )
			.attr('y', d => y( d.month ) )
			.attr('height', y.rangeBand() )
			.attr('width', width / yearsRange.length )
			//append d3 event handlers using on(). more info here: https://github.com/d3/d3-3.x-api-reference/blob/master/Selections.md#on	
			.on('mouseover', function(d,i){ //current datum and index
				// console.log(i);
				// console.log(d);
				// console.log(this);
				//get position of chart if toolTip will need to be statically placed
				// const svgBoundsRect = document.querySelector('svg').getBoundingClientRect();
				//display formatted tooltip div: year,month, actual temp, variance
				tooltip.html( `poop` + JSON.stringify(d) )
				// tooltip.html( `${d.variance}` )
					//DON'T FORGET TO OFFSET THE POPUP OR IT WILL INTERFERE, causing multiple event firing
					.style('left', d3.event.pageX - 40 + 'px')//d3.event must be used to access the usual event object
					.style('top', d3.event.pageY - 65 + 'px');
				tooltip.transition()//smooth transition, from d3: https://github.com/d3/d3-3.x-api-reference/blob/master/Selections.md#transition
					.duration(700)//ms
					// .delay(300)//ms
					.style('opacity', 1);
				d3.select(this).style('opacity','0.3');
			})
			.on('mouseout', function(d,i){
				tooltip.style('opacity', 0)//reset opacity for next transition
					.style('top', '-150px');//throw off screen to prevent interference.still appears if just nuking opacity 
				d3.select(this).style('opacity','1');
			});

	// legend at bottom
	const legendTicks = colorScale.quantiles()//a copy is returned, no need to shallow clone with .slice(0)
	legendTicks.unshift( colorScale.domain()[0] )
	legendTicks.push( colorScale.domain()[1] )
	console.log( legendTicks )//get domain values that split up continuous data
	const legendItemWidth = 34;
	const legend = chart.append('g')
			.attr('class','legend')
			.attr('transform', 'translate(475,'+(height+70)+')' );
	legend.selectAll('rect')
			.data(colors)
		.enter().append('rect')
			.attr('x',(d,i) => i * legendItemWidth )
			.style('fill', d => d )
			.attr('height', 15 )
			.attr('width', legendItemWidth );
	legend.selectAll('text')
			.data(legendTicks)
		.enter().append('text')
			.text( d => d.toFixed(2) )
			.attr('x',(d,i) => i * legendItemWidth )
			.attr('transform', (d,i) => `rotate(-90 ${ i * legendItemWidth },0)` )
			.attr('dy', (d,i) => 3 );
	legend.append('text')
		.attr('class', 'legendDetail')
		.text(`variance from average (°C) `)
		.attr('x', -203)
		.attr('y', 12);
	
});






