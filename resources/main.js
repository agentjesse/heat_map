//use d3 v3 ordinal scale, rangeRoundBands(), rangeBand(), and axis to make vertical bar chart.
const margin = {top:50, right:30, bottom:70, left: 60};
const width  = 950 - margin.left - margin.right, 
			height = 600 - margin.top - margin.bottom;
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
d3.select('.svgchart')
								.attr('width',width + margin.left + margin.right)
								.attr('height',height + margin.top + margin.bottom)
							.append('rect')
								.attr('class','chartBkg')
								.attr('width',width + margin.left + margin.right)
								.attr('height',height + margin.top + margin.bottom)
								.attr('rx','15')
								.attr('ry','15');
// d3.select('.svgchart').append('text')
// 								.attr('class', 'yTitle')
// 								.text('Rank')
// 								.attr('x', 85)
// 								.attr('y', 330)
// 								.attr('transform', 'rotate(-90 85,330)');//rotation coords same as x and y position
//get the svg for the chart, set dimensions according to margins, append a group inside using the margin info									
const chart = d3.select('.svgchart')
							.append('g')//make a group within the svg to make use of margins from top left origin point of the group
								.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

//retrieve the data from somewhere, make error checks, then use it to finish setting up scales before making the graph								
d3.json('/global-temperature.json', function(error,data){
	if(error)console.log(error);//super important. display error if found!!
	console.log('complete data:', data);
	//format data
	//filter out duplicate years
	let yearsRange = data.monthlyVariance.map( item => item.year )
		.filter( (item, i, array) => array.indexOf(item) === i );
	//finish scale setup
	//when making date objects of year only from a number, specify a zero-indexed month after also or it will read milliseconds!
	x.domain( [ new Date( d3.min(yearsRange), 0 ), new Date( d3.max(yearsRange)+1, 0 ) ] );//extra year at end to display all data
	// console.log( x.domain() );
	y.domain( [1,2,3,4,5,6,7,8,9,10,11,12] );
	// console.log( y.domain() );
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
	//javascript es6 way: get an iterable nodeLst using querySelectorAll, then spread it and put inside a new array literal
	const newTickTexts = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
	[ ... document.querySelectorAll('.y.axis text') ].forEach( (node, i)=> { node.textContent = newTickTexts[i] } );
	//remember that at this point the chart variable is already the group you put into the svg. 
  chart.selectAll('rect')//initiate data join, in this case, the rect elements of this line don't exist yet...
      .data(data.monthlyVariance)//join the data. update selection is returned, it has enter selection hanging off it
		.enter().append('rect')//instantiate the 'g' elements for each item in the selection
			.attr('class', 'dataRect')
			.style('fill', 'red' )
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
			//get position of chart
			// const svgBoundsRect = document.querySelector('svg').getBoundingClientRect();
			//display formatted tooltip div
			tooltip.html( JSON.stringify(d) )
			// tooltip.html( `${d.variance}` )
				//DON'T FORGET TO OFFSET THE POPUP OR IT WILL INTERFERE, causing multiple event firing
				.style('left', d3.event.pageX - 40 + 'px')//d3.event must be used to access the usual event object
				.style('top', d3.event.pageY - 95 + 'px');
			tooltip.transition()//smooth transition, from d3: https://github.com/d3/d3-3.x-api-reference/blob/master/Selections.md#transition
				.duration(700)//ms
				// .delay(300)//ms
				.style('opacity', 1);
			d3.select(this).style('opacity','0.1');
		})
		.on('mouseout', function(d,i){
			tooltip.style('opacity', 0)//reset opacity for next transition
				.style('top', '-150px');//throw off screen to prevent interference.still appears if just nuking opacity 
			d3.select(this).style('opacity','1');
		});
	
});






