
// var kitchensink = {};

var lastLoadedProject = {};

var canvas = new fabric.Canvas('canvas', {
    backgroundColor: "#FFFFFF",
    selectionColor: "rgba(0, 108, 223, 0.05)",
    selectionBorderColor: "rgba(0, 108, 223, 0.3)",
    selectionDashArray: [2, 2],
    preserveObjectStacking: true
});

initAligningGuidelines(canvas);
initCenteringGuidelines(canvas);


////for Current Active Left Tab///////
var currentActiveLeftTab;

//// for save  json ////
const { dialog } = require('electron').remote;

var fs = require('fs');

var fileSavedPath = "";
var appfolderPath = "";
var TempFileNameforWriting = ""
//// for save json ////
//projectSettings//
var projectSettings = {};

var os = require('os');
var platf = os.platform();


var slashForWin = "\\";
var slashForMac = "/";

var slash = platf == "win32" ? slashForWin : slashForMac;


// create grid and snap to grid


//canvas.on('object:moving', function(options) {
//  options.target.set({
//    left: Math.round(options.target.left / gridSize) * gridSize,
//    top: Math.round(options.target.top / gridSize) * gridSize
//  });
//});

// ------------------

/*
getting some test data
*/

canvas.on('object:scaling', onObjectModification);
canvas.on('object:moving', onObjectModification);
canvas.on('object:rotating', onObjectModification);
canvas.on('object:selected', onObjectModification);

function onObjectModification(e) {
    var activeObject = e.target;
    if (!activeObject) {
        return;
    }
    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;
    var reachedLimit = false;
    var objectLeft = Math.round(activeObject.left);
    var objectTop = Math.round(activeObject.top);
    var objectAngle = Math.round(activeObject.angle * 10) / 10;
    var objectWidth = Math.round(activeObject.width);
    var objectHeight = Math.round(activeObject.height);
    var objWidth = Math.round(activeObject.width * activeObject.scaleX);
    var objHeight = Math.round(activeObject.height * activeObject.scaleY);
    //	console.log(canvasWidth, canvasHeight, objectLeft, objectTop, objectAngle, objectWidth, objectHeight, objWidth, objHeight);


}


//use scale width height insted of scleX scaleY

//fabric.Canvas.prototype.preserveObjectStacking = true;
//  // Resize objects programmatically to keep stroke width constant
//  fabric.Object.prototype.resizeToScale = function (scaleX, scaleY, belongsToGroup) {
//    var objectScaleX = scaleX || this.scaleX;
//    var objectScaleY = scaleY || this.scaleY;
//    switch (this.type) {
//      case 'ellipse':
//        this.rx *= objectScaleX;
//        this.ry *= objectScaleY;
//        this.width = this.rx * 2;
//        this.height = this.ry * 2;
//        this.scaleX = 1;
//        this.scaleY = 1;
//        if (belongsToGroup) {
//          // Object's left and top are relative to group's position so let's
//          // update them too
//          this.left *= objectScaleX;
//          this.top *= objectScaleY;
//        }
//        break;
//      case 'rect':
//      case 'triangle':
//      case 'group':
//        this.width *= objectScaleX;
//        this.height *= objectScaleY;
//        this.scaleX = 1;
//        this.scaleY = 1;
//        if (belongsToGroup) {
//          // Object's left and top are relative to group's position so let's
//          // update them too
//          this.left *= objectScaleX;
//          this.top *= objectScaleY;
//        }
//        break;
//      default:
//        // Do nothing
//    }
//  };
//    
//  // Observe object scale so we can keep strokeWidth constant
//  canvas.on('object:scaling', function (e) {
//    if (e.target.type === 'group') {
//      // Group scaleX and scaleY values
//      var groupScaleX = e.target.scaleX;
//      var groupScaleY = e.target.scaleY;
//      // Resize group first
//      e.target.resizeToScale();
//      // Resize each item of the group using groupScale[X-Y]
//      e.target._objects.forEach(function (object) {
//        object.resizeToScale(groupScaleX, groupScaleY, true);
//      });
//    } else {
//      e.target.resizeToScale();
//    }
//  });
//		


/*
        undo and redo functions – this should be integrated in the controllers later on
*/
var _config = {
    canvasState: [],
    currentStateIndex: -1,
    undoStatus: false,
    redoStatus: false,
    undoFinishedStatus: 1,
    redoFinishedStatus: 1,

};
canvas.on(
    'object:modified',
    function () {
        updateCanvasState();
    }
);


canvas.on(
    'object:added',
    function () {
        updateCanvasState();
    }
);

canvas.on(
    'object:removed',
    function () {
        updateCanvasState();
    }
);


canvas.on(
    'selection:created',
    function () {
        updateCanvasState();
    }
);



var updateCanvasState = function () {
    if ((_config.undoStatus == false && _config.redoStatus == false)) {
        var jsonData = canvas.toJSON();
        var canvasAsJson = JSON.stringify(jsonData);
        if (_config.currentStateIndex < _config.canvasState.length - 1) {
            var indexToBeInserted = _config.currentStateIndex + 1;
            _config.canvasState[indexToBeInserted] = canvasAsJson;
            var numberOfElementsToRetain = indexToBeInserted + 1;
            _config.canvasState = _config.canvasState.splice(0, numberOfElementsToRetain);
        } else {
            _config.canvasState.push(canvasAsJson);
        }
        _config.currentStateIndex = _config.canvasState.length - 1;
        if ((_config.currentStateIndex == _config.canvasState.length - 1) && _config.currentStateIndex != -1) {
        }
    }
}


var undo = function () {

    if (_config.undoFinishedStatus) {
        if (_config.currentStateIndex == -1) {
            _config.undoStatus = false;
        } else {
            if (_config.canvasState.length >= 1) {
                _config.undoFinishedStatus = 0;
                if (_config.currentStateIndex != 0) {
                    _config.undoStatus = true;
                    canvas.loadFromJSON(_config.canvasState[_config.currentStateIndex - 1], function () {
                        var jsonData = JSON.parse(_config.canvasState[_config.currentStateIndex - 1]);
                        canvas.renderAll();
                        _config.undoStatus = false;
                        _config.currentStateIndex -= 1;
                        if (_config.currentStateIndex !== _config.canvasState.length - 1) {
                        }
                        _config.undoFinishedStatus = 1;
                    });
                } else if (_config.currentStateIndex == 0) {
                    canvas.clear();
                    _config.undoFinishedStatus = 1;
                    _config.currentStateIndex -= 1;
                }
            }
        }
    }
}

var savedProjectPath;
var savedFilePath;
var saveProject = function () {
    if (appfolderPath) {
        saveAsProject(appfolderPath);
    }
    else {
        saveAsProject();
    }
}
var jsonFilesDirectory
var saveAsProject = function (inDirectory) {

    if (inDirectory) {
        createDirectory(inDirectory, true);
        console.log(" createDirectory(fileName, true); iftrue case " + inDirectory)
        //TempFileNameforWriting = fileName + slash + "tempProjectJson.json"
        if (TempFileNameforWriting === undefined) {
            console.log("You didn't save the file");
            return;
        }

        fs.writeFile(TempFileNameforWriting, JSON.stringify(GenerateCanvasJson()), function (err) {

            if (err) {
                alert("An error ocurred creating the file " + err.message)
            }

            alert("The file has been succesfully saved");
        });


    } else {
        dialog.showSaveDialog(function (fileName) {

            createDirectory(fileName, true);
            console.log(" createDirectory(fileName, true); else case " + fileName)
            TempFileNameforWriting = fileName + slash + "tempProjectJson.json"
            if (TempFileNameforWriting === undefined) {
                console.log("You didn't save the file");
                return;
            }
            let jsonForWriteTemp = GenerateCanvasJson(true);
            fs.writeFile(TempFileNameforWriting, JSON.stringify(jsonForWriteTemp), function (err) {

                if (err) {
                    alert("An error ocurred creating the file " + err.message)
                }

                alert("The file has been succesfully saved");
            });
            for (let i = 0; i < jsonForWriteTemp.pages.length; i++) {

                // jsonForWriteTemp.pages.forEach(function (page) {

                jsonFilesDirectoryTemp = jsonFilesDirectory + slash + "page" + i + ".json"

                let pageTemp = { pages: [jsonForWriteTemp.pages[i]] };
                fs.writeFile(jsonFilesDirectoryTemp, JSON.stringify(pageTemp), function (err) {
                    if (err) {
                        alert("An error ocurred creating the file " + err.message)
                    }
                    // alert("The file has been succesfully saved");
                });


            }
            // , this);

        });
    }

}




var path;
var rootFolder = "";
function createDirectory(appfolderPath, cutomFolder) {

    if (cutomFolder) {
        //  var appDirTemp = (JSON.parse(JSON.stringify(appfolderPath))).toString();
        rootFolder = "";
        var res = appfolderPath.split(slash);
        window.appfolderPath = appfolderPath;

        if (path) {
            // rootFolder = path + slash + res[res.length - 1];
        }
        else {
            for (let i = 0; i < res.length - 1; i++) {

                rootFolder += res[i] + slash;

            }

        }

        if (!fs.existsSync(appfolderPath)) {
            fs.mkdirSync(appfolderPath);
        }

        var directoriesTobeCreated = {
            // rootFolder: rootFolder,
            assets: appfolderPath + slash + 'Assets',
            assetsSubImages: appfolderPath + slash + 'Assets' + slash + 'images',
            assetsSubMovies: appfolderPath + slash + 'Assets' + slash + 'movies',
            assetsSubThumbnails: appfolderPath + slash + 'Assets' + slash + 'thumbnails',
            framerExport: appfolderPath + slash + 'framerExport',
            json: appfolderPath + slash + 'json',
            pages: appfolderPath + slash + 'pages',


        };
        // select dir where shuld be created json files for each pages in project
        jsonFilesDirectory = directoriesTobeCreated.pages;
    }



    for (let directoriKey in directoriesTobeCreated) {
        if (directoriesTobeCreated[directoriKey]) {

            if (!fs.existsSync(directoriesTobeCreated[directoriKey])) {
                fs.mkdirSync(directoriesTobeCreated[directoriKey]);
                console.log(directoriesTobeCreated[directoriKey]);
            }
        }


    }

    // save(true);

}

// for save project
function GenerateCanvasJson(saveAsPoject) {



    let project = {
        projectSettings: {
            leftColor: document.getElementById('gradLeft') ? document.getElementById('gradLeft').value : "#ffffff",
            rightColor: document.getElementById('gradRight') ? document.getElementById('gradRight').value : "#ffffff",
            dropAreas: dropAreas,
            projectSettingsWidth: projectSettings.projectSettingsWidth ? projectSettings.projectSettingsWidth : 1024,
            projectSettingsHeight: projectSettings.projectSettingsHeight ? projectSettings.projectSettingsHeight : 768,
            projectSettingsName: projectSettings.projectSettingsName ? projectSettings.projectSettingsName : "Project Name",
            projectSettingsDescription: projectSettings.projectSettingsDescription ? projectSettings.projectSettingsDescription : "Project Description"
        },
        pages: PagesControllerScope && PagesControllerScope.objects ? PagesControllerScope.objects :
            [{
                pageSettings: {
                    name: 'Page 1',
                    thumbnail: 'project/assets/thumbnails/page1.png',
                    path: 'project/pages/'
                },
                canvas: {
                    canvasWidth: canvas ? canvas.width : 1024,
                    canvasHeight: canvas ? canvas.height : 768,
                    canvasData: canvas.toJSON()

                }
            }]
    }

    PagesControllerScope && PagesControllerScope.refreshSavePage();

    // rightTabControllerScope.getProjectSettings();
    return project;


}
// for save page only
function GenerateCanvasJsonPage(saveAsPoject) {



    let project = {
        projectSettings: {
            leftColor: document.getElementById('gradLeft') ? document.getElementById('gradLeft').value : "#ffffff",
            rightColor: document.getElementById('gradRight') ? document.getElementById('gradRight').value : "#ffffff",
            dropAreas: dropAreas,
            projectSettingsWidth: projectSettings.projectSettingsWidth ? projectSettings.projectSettingsWidth : 1024,
            projectSettingsHeight: projectSettings.projectSettingsHeight ? projectSettings.projectSettingsHeight : 768,
            projectSettingsName: projectSettings.projectSettingsName ? projectSettings.projectSettingsName : "Project Name",
            projectSettingsDescription: projectSettings.projectSettingsDescription ? projectSettings.projectSettingsDescription : "Project Description"
        },
        pages: PagesControllerScope && PagesControllerScope.objects ? PagesControllerScope.objects :
            [{
                pageSettings: {
                    name: 'Page 1',
                    thumbnail: 'project/assets/thumbnails/page1.png',
                    path: 'project/pages/'
                },
                canvas: {
                    canvasWidth: canvas ? canvas.width : 1024,
                    canvasHeight: canvas ? canvas.height : 768,
                    canvasData: canvas.toJSON()

                }
            }]
    }

    PagesControllerScope && PagesControllerScope.refreshSavePage();

    // rightTabControllerScope.getProjectSettings();
    return project;


}

function getPageFullSettings() {
    var projectSettingsTemp = {
        dropAreas: dropAreas,
        projectSettingsWidth: projectSettings.projectSettingsWidth,
        projectSettingsHeight: projectSettings.projectSettingsHeight,
        projectSettingsName: projectSettings.projectSettingsName,
        projectSettingsDescription: projectSettings.projectSettingsDescription
    }
    return projectSettingsTemp;

}



function save(page) {

    PagesControllerScope && PagesControllerScope.savePageToObjects();
    PagesControllerScope && PagesControllerScope.refreshSavePage();


    if (page) {
        // save page case
        if (fileSavedPath) {
            fs.writeFile(fileSavedPath, JSON.stringify(GenerateCanvasJsonPage()), function (err) {

                if (err) {
                    alert("An error ocurred creating the file " + err.message)
                }

                alert("The file has been succesfully saved");
            });
        }
        else {
            // saveAsProject(fromDir);

            // call saveAs function with true param for saveing as page only not a project
            saveAs(true);
        }
    } else {
        // save project case
        if (fileSavedPath) {
            fs.writeFile(fileSavedPath, JSON.stringify(GenerateCanvasJson()), function (err) {

                if (err) {
                    alert("An error ocurred creating the file " + err.message)
                }

                alert("The file has been succesfully saved");
            });
        }
        else {
            // saveAsProject(fromDir);
            saveAs();
        }
    }



}

function saveAs(page) {

    if (page) {
        // case for saveing only page 
        dialog.showSaveDialog(function (fileName) {
            if (fileName.search(".json") == -1) {
                fileName = (fileName + ".json");
            }
            fileSavedPath = fileName;
            if (fileSavedPath) {
                fs.writeFile(fileSavedPath, JSON.stringify(GenerateCanvasJsonPage()), function (err) {

                    if (err) {
                        alert("An error ocurred creating the file " + err.message)
                    }

                    alert("The file has been succesfully saved");
                });
            }

        });
    } else {
        // case for saveing project
        dialog.showSaveDialog(function (fileName) {
            if (fileName.search(".json") == -1) {
                fileName = (fileName + ".json");
            }
            fileSavedPath = fileName;
            if (fileSavedPath) {
                fs.writeFile(fileSavedPath, JSON.stringify(GenerateCanvasJson()), function (err) {

                    if (err) {
                        alert("An error ocurred creating the file " + err.message)
                    }

                    alert("The file has been succesfully saved");
                });
            }

        });
    }


}


//openProject for opening project
//var loadJSON = function () {
var openProject = function () {


    const {
        ipcRenderer
    } = require('electron')
    ipcRenderer.send('openFile', () => {
    })
    ipcRenderer.once('fileData', (event, filepath) => {

        var reader = new FileReader();

        function readTextFile(file) {
            return new Promise(function (resolve, reject, ) {
                var rawFile = new XMLHttpRequest();

                rawFile.open("GET", file, false);
                rawFile.onreadystatechange = function () {
                    if (rawFile.readyState === 4) {
                        if (rawFile.status === 200 || rawFile.status == 0) {
                            resolve(rawFile.responseText);

                            // alert(allText);
                        }
                    }
                }
                rawFile.send(null);
            })

        }

        readTextFile(filepath).then(function (resolvedPAram) {
            lastLoadedProject = null;
            lastLoadedProject = JSON.parse(resolvedPAram);
            var tempOPenedCanvas = JSON.parse(resolvedPAram);
            // var tempCanvas = tempOPenedCanvas.canvas.state;
            var tempCanvas = tempOPenedCanvas.pages[0].canvas.canvasData

            canvas.loadFromJSON(tempCanvas, function () {
                canvas.renderAll();
                setCanvasSize(tempOPenedCanvas.pages[0].canvas.canvasHeight, tempOPenedCanvas.pages[0].canvas.canvasWidth);

                tempOPenedCanvas.pages[0].canvas.leftColor &&
                    tempOPenedCanvas.pages[0].canvas.rightColor &&
                    addGradient(tempOPenedCanvas.pages[0].canvas.leftColor, tempOPenedCanvas.pages[0].canvas.rightColor);
                dropAreas = tempOPenedCanvas.projectSettings.dropAreas;

                PagesControllerScope && PagesControllerScope.objects && tempOPenedCanvas.pages &&
                    PagesControllerScope.replaceObjects(tempOPenedCanvas.pages);
                //  canvas =

                if (Object.keys(projectSettings).length != 0 && currentActiveLeftTab.title == "projectSettings") {
                    rightTabControllerScope.setPageFlowRowAndColumn();
                    rightTabControllerScope.setProjectSettings();
                }
                if (Object.keys(pageFlowScope).length != 0) {
                    pageFlowScope.getdropAreasFromService();
                    pageFlowScope.$apply();
                    rightTabControllerScope.setPageFlowRowAndColumn();
                    rightTabControllerScope.setProjectSettings();

                } else {

                }

            });


        })


    })

}

var openPage = () => {

    const {
        ipcRenderer
    } = require('electron')
    ipcRenderer.send('openFile', () => {
    })
    ipcRenderer.once('fileData', (event, filepath) => {

        var reader = new FileReader();

        function readTextFile(file) {
            return new Promise(function (resolve, reject, ) {
                var rawFile = new XMLHttpRequest();

                rawFile.open("GET", file, false);
                rawFile.onreadystatechange = function () {
                    if (rawFile.readyState === 4) {
                        if (rawFile.status === 200 || rawFile.status == 0) {
                            resolve(rawFile.responseText);

                            // alert(allText);
                        }
                    }
                }
                rawFile.send(null);
            })

        }

        readTextFile(filepath).then(function (resolvedPAram) {

            //lastLoadedProject = null;
            // lastLoadedProject = JSON.parse(resolvedPAram);
            var tempOPenedCanvas = JSON.parse(resolvedPAram);
            // var tempCanvas = tempOPenedCanvas.canvas.state;
            var tempCanvas = tempOPenedCanvas.pages[0].canvas.canvasData

            // this function is in helper.js
            setCanvasBackGradient(tempOPenedCanvas.pages[0]);

            // canvas.loadFromJSON(tempCanvas, function () {
            //     canvas.renderAll();
            //     setCanvasSize(tempOPenedCanvas.pages[0].canvas.canvasHeight, tempOPenedCanvas.pages[0].canvas.canvasWidth);

            //     tempOPenedCanvas.pages[0].canvas.leftColor &&
            //         tempOPenedCanvas.pages[0].canvas.rightColor &&
            //         addGradient(tempOPenedCanvas.pages[0].canvas.leftColor, tempOPenedCanvas.pages[0].canvas.rightColor);
            //     //dropAreas = tempOPenedCanvas.projectSettings.dropAreas;

            PagesControllerScope && PagesControllerScope.objects && tempOPenedCanvas.pages &&
                PagesControllerScope.addPage(tempOPenedCanvas.pages[0]);
            //  canvas =

            // if (Object.keys(projectSettings).length != 0 && currentActiveLeftTab.title == "projectSettings") {
            //     rightTabControllerScope.setPageFlowRowAndColumn();
            //     rightTabControllerScope.setProjectSettings();
            // }
            // if (Object.keys(pageFlowScope).length != 0) {
            //     pageFlowScope.getdropAreasFromService();
            //     pageFlowScope.$apply();
            //     rightTabControllerScope.setPageFlowRowAndColumn();
            //     rightTabControllerScope.setProjectSettings();

            // } else {

            // }

            //});


        })


    })


}

var newPage = () => {
    let jsonData = canvas.toJSON();
    let canvasAsJson = JSON.stringify(jsonData);



    canvas.setWidth()

    lastLoadedProject.pages[lastLoadedProject.pages.length - 1].canvas.canvasData = JSON.parse(canvasAsJson);

    let pageTemplate = {
        pageSettings: {
            name: 'Page 0',
            thumbnail: 'project/assets/thumbnails/page1.png',
            path: 'project/pages/'
        },
        canvas: {
            canvasWidth: projectSettings.projectSettingsWidth ? projectSettings.projectSettingsWidth : 1024,
            canvasHeight: projectSettings.projectSettingsHeight ? projectSettings.projectSettingsHeight : 768,
            canvasData: {}

        }
    }


    if (PagesControllerScope) {

        PagesControllerScope.addPage();
        PagesControllerScope.safeScopeApply();
    } {

        pageTemplate.pageSettings.name = "Page " + lastLoadedProject.pages.length;

        lastLoadedProject.pages.push(pageTemplate);
        layersControllerScope.clearObject();

    }


}

function setCanvasSize(height, width) {

    if (currentActiveLeftTab && currentActiveLeftTab.title == "projectSettings") {
        document.getElementById('myWidth').value = width;
        document.getElementById('myHeight').value = height;
    }



    var setWidth = width
    var setHeight = height
    canvas.setHeight(setHeight);
    console.info(setWidth, setHeight);
    canvas.calcOffset();

}

function addGradient(left, right) {

    if (currentActiveLeftTab && currentActiveLeftTab.title == "pageSettings") {
        document.getElementById('gradLeft').value = left;
        document.getElementById('gradRight').value = right;
    }


    var leftColor = left
    var rightColor = right
    console.log(leftColor, rightColor);

    var grad = new fabric.Gradient({
        type: 'linear',
        coords: {
            x1: 0,
            y1: 0,
            x2: canvas.width,
            y2: canvas.height,
        },
        colorStops: [{
            color: leftColor,
            offset: 0,
        },
        {
            color: rightColor,
            offset: 1,
        }
        ]
    });
    canvas.backgroundColor = grad.toLive(canvas.contextContainer);
    canvas.renderAll();
};
var redo = function () {
    if (_config.redoFinishedStatus) {
        if ((_config.currentStateIndex == _config.canvasState.length - 1) && _config.currentStateIndex != -1) {
        } else {
            if (_config.canvasState.length > _config.currentStateIndex && _config.canvasState.length != 0) {
                _config.redoFinishedStatus = 0;
                _config.redoStatus = true;
                canvas.loadFromJSON(_config.canvasState[_config.currentStateIndex + 1], function () {
                    var jsonData = JSON.parse(_config.canvasState[_config.currentStateIndex + 1]);
                    canvas.renderAll();
                    _config.redoStatus = false;
                    _config.currentStateIndex += 1;
                    if (_config.currentStateIndex != -1) {
                    }
                    _config.redoFinishedStatus = 1;
                    if ((_config.currentStateIndex == _config.canvasState.length - 1) && _config.currentStateIndex != -1) {
                    }
                });
            }
        }
    }
}

/*
Utility functions for selecting and aranging objects on the canvas
*/

function selectAll() {
    canvas.discardActiveObject();
    var sel = new fabric.ActiveSelection(canvas.getObjects(), {
        canvas: canvas,
    });
    canvas.setActiveObject(sel);
    canvas.requestRenderAll();
};


//sen the objects forward and backward

function sendBackwards() {
    var activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.sendBackwards(activeObject);
    }
};

function sendToBack() {
    var activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.sendToBack(activeObject);
    }
};

function bringForward() {
    var activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.bringForward(activeObject);
    }
};

function bringToFront() {
    var activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.bringToFront(activeObject);
    }
};

/*
setup IPC communication/functions with mainmenu.js
*/

//File Menu

require('electron').ipcRenderer.on('openProject', function (event, message) {
    console.log(message);
    openProject();//openProject
});
require('electron').ipcRenderer.on('newPage', function (event, message) {

    console.log(message);
    newPage();//openProject
});
require('electron').ipcRenderer.on('openPage', function (event, message) {

    console.log(message);
    openPage();//openProject
});


require('electron').ipcRenderer.on('saveProject', function (event, message) {
    console.log(message);
    // save();
    saveProject();
});

//saveAsProjectProject
require('electron').ipcRenderer.on('saveAsProject', function (event, message) {
    console.log(message);
    saveAsProject();
});

require('electron').ipcRenderer.on('save', function (event, message) {
    console.log(message);
    //call save function with true param for saveing only page 
    save(true);
});

require('electron').ipcRenderer.on('saveAs', function (event, message) {
    console.log(message);
    saveAs();
});



//edit menu

require('electron').ipcRenderer.on('undo', function (event, message) {
    console.log(message);
    undo();
});

require('electron').ipcRenderer.on('redo', function (event, message) {
    console.log(message);
    redo();
});

require('electron').ipcRenderer.on('remove', function (event, message) {
    console.log(message);
    remove();
});

require('electron').ipcRenderer.on('cut', function (event, message) {
    console.log(message);
    copy();
    remove();
});

require('electron').ipcRenderer.on('copy', function (event, message) {
    console.log(message);
    copy();
});

require('electron').ipcRenderer.on('paste', function (event, message) {
    console.log(message);
    paste();
});

require('electron').ipcRenderer.on('duplicate', function (event, message) {
    console.log(message);
    copy();
    paste();
});

require('electron').ipcRenderer.on('selectAll', function (event, message) {
    console.log(message);
    selectAll();
});

//Arrange menu

require('electron').ipcRenderer.on('group', function (event, message) {
    console.log(message);
    group();
});

require('electron').ipcRenderer.on('ungroup', function (event, message) {
    console.log(message);
    ungroup();
});

require('electron').ipcRenderer.on('bringForward', function (event, message) {
    console.log(message);
    bringForward();
});

require('electron').ipcRenderer.on('bringToFront', function (event, message) {
    console.log(message);
    bringToFront();
});

require('electron').ipcRenderer.on('sendBackwards', function (event, message) {
    console.log(message);
    sendBackwards();
});

require('electron').ipcRenderer.on('sendToBack', function (event, message) {
    console.log(message);
    sendToBack();
});

// electron contextMenu test this should be moved in a separate JS file in menus
// Create a context menu in electron

const {
    remote
} = require('electron')
const {
    Menu, MenuItem
} = remote

const menu = new Menu()

// Build menu one item at a time, unlike


menu.append(new MenuItem({
    label: 'Send backwards',
    click() {
        sendBackwards();
    }
}))

menu.append(new MenuItem({
    label: 'Send to back',
    click() {
        sendToBack();
    }
}))

menu.append(new MenuItem({
    label: 'Bring forwards',
    click() {
        bringForward();
    }
}))

menu.append(new MenuItem({
    label: 'Bring to front',
    click() {
        bringToFront();
    }
}))

menu.append(new MenuItem({
    type: 'separator'
}))


menu.append(new MenuItem({
    label: 'Align',
    submenu: [{
        label: 'Left'
    }, {
        label: 'Center'
    }, {
        label: 'Right'
    }, {
        type: 'separator'
    }, {
        label: 'Top'
    }, {
        label: 'Middle'
    }, {
        label: 'Bottom'
    }]
}))

menu.append(new MenuItem({
    label: 'Distribute',
    submenu: [{
        label: 'Horizontal'
    }, {
        label: 'Vertical'
    }]
}))


menu.append(new MenuItem({
    type: 'separator'
}))

menu.append(new MenuItem({
    label: 'Group Selected',
    click() {
        group();
    }
}))

menu.append(new MenuItem({
    label: 'Ungroup Selected',
    click() {
        ungroup();
    }
}))

menu.append(new MenuItem({
    type: 'separator'
}))

menu.append(new MenuItem({
    label: 'Undo',
    click() {

        undo();
    }
}))

menu.append(new MenuItem({
    label: 'Save',
    click() {
        // 
        // saveProject();
        save();
    }
}))


menu.append(new MenuItem({
    type: 'separator'
}))




// menu.append(new MenuItem({
//     label: 'Save',
//     click() {
//         
//         saveProject();
//         //save();
//     }
// }))

menu.append(new MenuItem({
    label: 'Redo',
    click() {
        redo();
    }
}))


menu.append(new MenuItem({
    type: 'separator'
}))

menu.append(new MenuItem({
    label: 'Cut',
    click() {
        copy();
        remove();
    }
}))

menu.append(new MenuItem({
    label: 'Copy',
    click() {
        copy();
    }
}))

menu.append(new MenuItem({
    label: 'Paste',
    click() {
        paste();
    }
}))

menu.append(new MenuItem({
    label: 'Delete',
    click() {
        remove();
    }
}))

menu.append(new MenuItem({
    label: 'Select All',
    click() {
        selectAll();
    }
}))


// Prevent default action of right click in chromium. Replace with our menu.
document.getElementById("wrapper").addEventListener('contextmenu', (e) => {
    e.preventDefault()
    menu.popup(remote.getCurrentWindow())
}, false)