Tree= (function(){
	
	//Init Code
	var duration = 750,
	    rectW = 60,
	    rectH = 30,
	    tree,
	    diagonal,
	    i = 0,//used for unique node IDs
	    svg,
	    root;

	function createTree(bindDivId, height, width){
		tree=d3.layout.tree().size([height, width]);

		diagonal = d3.svg.diagonal()
		    .projection(function (d) {
    		return [d.x, d.y];//places link in middle of node
		});

		svg = d3.select("#"+bindDivId).append("svg").attr("width", width).attr("height", height)
		    .call(zm = d3.behavior.zoom().scaleExtent([1,3]).on("zoom", redraw)).append("g")
		    .attr("transform", "translate(" + 35 + "," + 20 + ")");

		//zoom/un zoom
		zm.translate([350, 20]);
	}

	function setData(data){
		root = data;
	  	root.x0 = 0;
	  	root.y0 = 0;
	  	root.children.forEach(collapse);
	  	update(root);
	}

//helper functions:
	//collapse Function
	 function collapse(d) {
	    if (d.children) {
	      d._children = d.children;
	      d._children.forEach(collapse);
	      d.children = null;
	    }
	  }

	// Toggle children on click.
	function click(d) {
	    if (d.children) {
	        d._children = d.children;
	        d.children = null;
	    } else {
	        d.children = d._children;
	        d._children = null;
	    }
	    update(d);
	}

	//Redraw for zoom
	function redraw() {
	  svg.attr("transform",
	      "translate(" + d3.event.translate + ")"
	      + " scale(" + d3.event.scale + ")");
	}

	//update function
	function update(source) {

    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function (d) {d.y = d.depth * 125;});

    // Update the nodes…
    var node = svg.selectAll("g.node")
        .data(nodes, function (d) {
        return d.id || (d.id = ++i);
    });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) {
        return "translate(" + source.x0 + "," + source.y0 + ")";
        //return "translate(" + d.x + "," + d.y + ")";
    }).on("click", click);

    nodeEnter.append("circle")
	  .attr("r", 1e-6)
	  .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

    nodeEnter.append("text")
	  .attr("x", function(d) { return d.children || d._children ? -13 : 13; })
	  .attr("dy", ".35em")
	  .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
	  .text(function(d) { 
	  	if(typeof d.value !="object")
	  		return d.name+"- \n "+d.value
	  	return d.name;
	})
	  .style("fill-opacity", 1e-6);

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
    });
    
    nodeUpdate.select("circle")
	  .attr("r", 10)
	  .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

    nodeUpdate.select("text")
        .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function (d) {
        return "translate(" + source.x + "," + source.y + ")";
    }).remove();

      nodeExit.select("circle").attr("r", 1e-6);

    nodeExit.select("text").style("fill-opacity", 1e-6);

    // Update the links…
    var link = svg.selectAll("path.link")
        .data(links, function (d) {
        return d.target.id;
    });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("x", rectW / 2)
        .attr("y", rectH / 2)
        .attr("d", function (d) {
        var o = {
            x: source.x0,
            y: source.y0
        };
        return diagonal({source: o,target: o});
    });

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function (d) {
        var o = {x: source.x,y: source.y};
        return diagonal({source: o,target: o});
    }).remove();

    // Stash the old positions for transition.
    nodes.forEach(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}

return{
	createTree:createTree,
	setData:setData
}	

})();

