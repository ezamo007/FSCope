function arrayToHTML(array, tableID = "results"){
    HTMLString = `<table id = "${tableID}">`;
    headerArray = array[0];

    HTMLString = `${HTMLString}<tr>`
    for (i = 0; i < headerArray.length; i++){
        HTMLString = `${HTMLString}<th>${headerArray[i]}</th>`
    }
    HTMLString = `${HTMLString}</tr>`

    for (i = 1; i < array.length; i++){
        HTMLString = `${HTMLString}<tr>`
        for (j = 0; j < array[0].length; j++){
            HTMLString = `${HTMLString}<td>${array[i][j]}</td>`
        }
        HTMLString = `${HTMLString}</tr>`
    }
    HTMLString = `${HTMLString}</table>`

    return HTMLString;
}

module.exports={arrayToHTML}