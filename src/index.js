import * as d3 from "d3";

// API
const url = "http://iz-websrv01.ethz.ch:3000/api/visitors";

// Define dimensions
const maxWidth = 400;
const maxHeight = 400;
const margin = { top: 20, right: 20, bottom: 20, left: 20 };
const width = maxWidth - margin.left - margin.right;
const height = maxHeight - margin.top - margin.bottom;

// Define size and spacings of icons
const nrOfDesksPerIcons = 5;
const iconScale = 0.4;
const gradientOpacity = 0.5;
const iconHorSpace = 40;
const iconVerSpace = 40;
const floorVerSpace = 120;
const offsetBottom = 80;

// Icons and paths
const deskHtml = `<path fill="#B7B7B8" d="M95.693 52.409h-78v9h10v34.5h9v-34.5h40v34.5h9v-34.5h10z"/>`
const personHtml = `<path d="M49.693 89.133c-2.475 0-4.5-2.551-4.5-5.669V68.938c0-3.118 2.025-5.669 4.5-5.669s4.5 
                    2.551 4.5 5.669v14.525c0 3.119-2.025 5.67-4.5 5.67zM63.693 89.133c-2.475 
                    0-4.5-2.551-4.5-5.669V68.938c0-3.118 2.025-5.669 4.5-5.669s4.5 2.551 4.5 5.669v14.525c0 
                    3.119-2.025 5.67-4.5 5.67zM45.193 50.443V39.669c0-3.118 2.551-5.669 5.669-5.669h11.661c3.118 
                    0 5.669 2.551 5.669 5.669v10.774H45.193z"/>
                    <circle cx="56.693" cy="25.247" r="7"/>`
const occupiedGradient = `<radialGradient id="a" cx="56.693" cy="56.693" r="51.216" gradientUnits="userSpaceOnUse">
                      <stop offset="0" stop-color="#cd5849"/>
                      <stop offset=".231" stop-color="#dc8a7f"/>
                      <stop offset=".49" stop-color="#ebbcb6"/>
                      <stop offset=".714" stop-color="#f6e0de"/>
                      <stop offset=".891" stop-color="#fdf7f6"/>
                      <stop offset="1" stop-color="#fff"/>
                    </radialGradient>
                    <circle fill="url(#a)" cx="56.693" cy="56.693" r="51.216"/>`                    
const freeGradient = `<radialGradient id="b" cx="56.693" cy="56.693" r="51.216" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stop-color="#53c44b"/>
                        <stop offset=".224" stop-color="#85d57f"/>
                        <stop offset=".486" stop-color="#b9e7b6"/>
                        <stop offset=".712" stop-color="#dff4de"/>
                        <stop offset=".89" stop-color="#f6fcf6"/>
                        <stop offset="1" stop-color="#fff"/>
                      </radialGradient>
                      <circle fill="url(#b)" cx="56.693" cy="56.693" r="51.216"/>`

// Floor labels
const labelG = "";
const labelH = "";
const labelJ = "";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Create base SVG
const viz = d3.select("#viz")
    .append("div")
    .classed("svg-container", true)
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + width + " " + height)
    .classed("svg-content-responsive", true)
    .on("click", () => update())   
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Main function
const update = () => {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // if (!data.library_is_closed) {
            plot(data);


        }).catch(e => {
            console.log("Couldn't fetch library data from server;", e);
        });
}

// Plot data
const plot = data => {

    console.log(data);

    // Randomize occupancy for testing
    data.G = Math.round(Math.random()*data.G_max);
    data.H = Math.round(Math.random()*data.H_max);
    data.J = Math.round(Math.random()*data.J_max);

    // Plot floors individually
    plotFloor(labelG, data.G, data.G_max, 0);
    plotFloor(labelH, data.H, data.H_max, 1);
    plotFloor(labelJ, data.J, data.J_max, 2);

}

// Plot single floor data
const plotFloor = (label, count, max, level) => {

    // Place label

    //TO DO


    // Generate data with coordinates
    const horMaxNrofIcons = Math.round(max/10);
    const nrOfdesks = horMaxNrofIcons*10;
    const nrOfIcons = nrOfdesks/nrOfDesksPerIcons;
    const data = [];
    for (let i = 0; i<nrOfIcons; i++) {
        const rowNr = Math.floor(i/horMaxNrofIcons);
        data.push({
            x: i*iconHorSpace-(rowNr*horMaxNrofIcons*iconHorSpace),
            y: height - offsetBottom - (rowNr*iconVerSpace) - (level*floorVerSpace),
            occ: (i*nrOfDesksPerIcons)<count 
        });
    }

    // Update already placed occupied gradients
    const occupiedGradientsClassName = "occupiedGradientOnFloor" + level;
    const occupiedGradients = viz
        .selectAll("." + occupiedGradientsClassName)
        .data(data)
        .attr("transform", d => "translate(" + d.x + "," + d.y + ") scale(" + iconScale + ")")
        .attr("opacity", d => d.occ ? gradientOpacity : 0)
        .html(occupiedGradient);

    // Add new occupied gradients
    occupiedGradients
        .enter()
        .append("g")
        .attr("class", occupiedGradientsClassName + " gradient")
        .attr("transform", d => "translate(" + d.x + "," + d.y + ") scale(" + iconScale + ")")
        .attr("opacity", d => d.occ ? gradientOpacity : 0)
        .html(occupiedGradient);

    // Remove occupied gradients if necessary
    occupiedGradients.exit().remove();          

    // Update already placed free gradients
    const freeGradientsClassName = "freeGradientOnFloor" + level;
    const freeGradients = viz
        .selectAll("." + freeGradientsClassName)
        .data(data)
        .attr("transform", d => "translate(" + d.x + "," + d.y + ") scale(" + iconScale + ")")
        .attr("opacity", d => d.occ ? 0 : gradientOpacity)
        .html(freeGradient);

    // Add new free gradients
    freeGradients
        .enter()
        .append("g")
        .attr("class", freeGradientsClassName + " gradient")
        .attr("transform", d => "translate(" + d.x + "," + d.y + ") scale(" + iconScale + ")")
        .attr("opacity", d => d.occ ? 0 : gradientOpacity)
        .html(freeGradient);

    // Remove free gradients if necessary
    freeGradients.exit().remove();        

    // Update already placed desks
    const deskClassName = "deskOnFloor" + level;
    const desks = viz
        .selectAll("." + deskClassName)
        .data(data)
        .attr("transform", d => "translate(" + d.x + "," + d.y + ") scale(" + iconScale + ")")
        .html(deskHtml);

    // Add new desks if needed
    desks
        .enter()
        .append("g")
        .attr("class", deskClassName)
        .attr("transform", d => "translate(" + d.x + "," + d.y + ") scale(" + iconScale + ")")
        .html(deskHtml);

    // Remove desks if necessary
    desks.exit().remove();

    // Update already placed people
    const personClassName = "personOnFloor" + level;
    const people = viz
        .selectAll("." + personClassName)
        .data(data)
        .attr("transform", d => "translate(" + d.x + "," + d.y + ") scale(" + iconScale + ")")
        .attr("opacity", d => d.occ ? 1 : 0)
        .html(personHtml);

    // Add new people if needed
    people
        .enter()
        .append("g")
        .attr("class", personClassName + " person")
        .attr("transform", d => "translate(" + d.x + "," + d.y + ") scale(" + iconScale + ")")
        .attr("opacity", d => d.occ ? 1 : 0)
        .html(personHtml);

    // Remove people if necessary
    people.exit().remove();

}

// Initialize and then update every minute
update();
d3.interval(update, 60000);

// Console branding
console.log("Interactive visualization by Sam Hertig ––– www.samhertig.com");






