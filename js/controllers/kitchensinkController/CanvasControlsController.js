kitchensink.controller('CanvasControlsController', function ($scope, leftPanelTabService, rightPanelTabService, $timeout) {

    $scope.currentLeftTab = leftPanelTabService.tab.url;
    $scope.currentRightTab = rightPanelTabService.tab.url;
    $scope.canvas = canvas;
    $scope.getActiveStyle = getActiveStyle;
    $scope.zoom = 0;//default zoom


    $scope.pageFlowShow = false;

    $scope.insideRulerWidth = document.getElementsByClassName("rul_wrapper")[0].offsetWidth
        - document.getElementsByClassName("rul_ruler_Vertical")[0].offsetHeight - 70;
    $scope.insideRulerheight = document.getElementsByClassName("rul_wrapper")[0].offsetHeight - document.getElementsByClassName("toolbar-header")[0].offsetHeight
        - document.getElementsByClassName("toolbar-footer")[0].offsetHeight - 90;


    $scope.leftTab = leftPanelTabService.leftTab;
    $scope.rightTab = rightPanelTabService.rightTab;


    addAccessors($scope);
    watchCanvas($scope);

    //get canvas Angle and set it

    canvas.on('object:rotating', function (options) {

        console.log(options.target);
        if (document.getElementById("canvas-angle")) {
            document.getElementById("canvas-angle").value =
                parseFloat(options.target.angle)
                    ? parseFloat(options.target.angle).toFixed(2)
                    : document.getElementById("canvas-angle").value;

            document.getElementById("canvas-angle").value = parseFloat(options.target.angle.toFixed(2));
        }


        //document.getElementById("position-y").value = Math.round(options.target.angle);
    });
    canvas.on('object:modified', function (options) {
        if (document.getElementById("position-x")) {

            document.getElementById("transform-angle").value =
                parseFloat(options.target.angle)
                    ? parseFloat(options.target.angle).toFixed(2)
                    : document.getElementById("transform-angle").value;


            document.getElementById("position-x").value = parseFloat(options.target.left.toFixed(2));
            document.getElementById("position-y").value = parseFloat(options.target.top.toFixed(2));
            document.getElementById("size-propWidth").value = Math.round(options.target.width * options.target.scaleX);
            document.getElementById("size-propHeight").value = Math.round(options.target.height * options.target.scaleY);

            document.getElementById("scale-scaleX").value =
                parseFloat(options.target.scaleX)
                    ? parseFloat(options.target.scaleX.toFixed(2))
                    : document.getElementById("scale-scaleX").value;

            document.getElementById("scale-scaleY").value =
                parseFloat(options.target.scaleY)
                    ? parseFloat(options.target.scaleY.toFixed(2))
                    : document.getElementById("scale-scaleY").value;

        }
        if ((!canvas.getActiveObject() && document.getElementById('enableShadow'))
            || (canvas.getActiveObject() && !canvas.getActiveObject().shadow && document.getElementById('enableShadow'))) {
            document.getElementById('enableShadow').removeAttribute('toggled');
        }

        if (document.getElementById('shadow-Offset-X') && document.getElementById('shadow-Offset-Y') && canvas.getActiveObject()) {

            document.getElementById('shadow-Offset-X').value = canvasObjectShadowOffsetX;
            document.getElementById('shadow-Offset-Y').value = canvasObjectShadowOffsetY;
            document.getElementById('obj-shadow-blur').value = canvasObjectShadowBlur;

        }


        PagesControllerScope && PagesControllerScope.refreshSavePage();
    });


    canvas.on('object:added', function (option) {

        PagesControllerScope && PagesControllerScope.refreshSavePage();
    });
    canvas.on('after:render', function (option) {

        getCanvasActiveObjectData();
        // setCanvasActiveObjectData();
        enableDisableElement();


    });


    // canvas.on('object:moving', function (option) {

    //     PagesControllerScope && PagesControllerScope.refreshSavePage();
    // });
    // canvas.on('object:over', function (option) {

    //     PagesControllerScope && PagesControllerScope.refreshSavePage();
    // });
    // canvas.on('object:out', function (option) {

    //     PagesControllerScope && PagesControllerScope.refreshSavePage();
    // });
    canvas.on('object:removed', function (option) {

        PagesControllerScope && PagesControllerScope.refreshSavePage();
    });
    canvas.on('object:rotating', function (option) {

        PagesControllerScope && PagesControllerScope.refreshSavePage();
    });
    canvas.on('object:scaling', function (option) {

        PagesControllerScope && PagesControllerScope.refreshSavePage();
    });
    canvas.on('path:created', function (option) {

        PagesControllerScope && PagesControllerScope.refreshSavePage();
    });
    canvas.on('text:changed', function (option) {

        PagesControllerScope && PagesControllerScope.refreshSavePage();
    });
    // canvas.on('text:selection:changed', function (option) {

    //     PagesControllerScope && PagesControllerScope.refreshSavePage();
    // });



    // $scope.canvasAngle = canvasAngle;
    // Editing manipulating the Canvas Size
    // ================================================================


    // $scope.setMySize = function () {
    //     //;
    //     var setWidth = document.getElementById('myWidth').value;
    //     var setHeight = document.getElementById('myHeight').value;
    //     canvas.setWidth(setWidth);
    //     canvas.setHeight(setHeight);
    //     console.info(setWidth, setHeight);
    //     canvas.calcOffset();


    // };

    $scope.presetSizes = [{
        name: 'iPad Landscape',
        height: 768,
        width: 1024
    },
    {
        name: 'iPad Portrait',
        height: 1024,
        width: 766
    },
    {
        name: 'iPad Pro Landscape',
        height: 1024,
        width: 1366
    },
    {
        name: 'iPad Pro Portrait',
        height: 1366,
        width: 1024
    }
    ];


    $scope.setCanvasSize = function (width, height) {
        canvas.setWidth(width);
        canvas.setHeight(height);
        canvas.calcOffset();
        console.log("resising now...");

    };


    $scope.setZoom = function (param) {

        [].__proto__.forEach.call(canvas._objects, (canvasItem) => {

            console.log(canvasItem.name);
            if (canvas.getActiveObject().name != 'Image' && canvasItem.name == 'Image') {
                canvas.setActiveObject(canvasItem);

            }

        });

        let scaleFactor = param.zoom / 100;
        if (canvas._objects && !canvas.getActiveObject()) {
            canvas.setActiveObject(canvas._objects[0])

        }
        if (canvas._objects && canvas.getActiveObject()) {


            canvas.setZoom(scaleFactor);
            canvas.setWidth(canvas.getZoom() * canvas.getActiveObject().width);
            canvas.setHeight(canvas.getZoom() * canvas.getActiveObject().height);

        }

        else {

            console.log("there is now active objects");
        }
        //;


    };


    $scope.originalSize = function (param) {
        [].__proto__.forEach.call(canvas._objects, (canvasItem) => {
            console.log(canvasItem.name);
            if (canvas.getActiveObject().name != 'Image' && canvasItem.name == 'Image') {
                canvas.setActiveObject(canvasItem);

            }

        });

        if (canvas._objects && !canvas.getActiveObject()) {
            //;
            canvas.setActiveObject(canvas._objects[0])
        }
        if (canvas._objects && canvas.getActiveObject()) {
            canvas.getActiveObject().scaleX = 1;
            canvas.getActiveObject().scaley = 1;
            canvas.getActiveObject().left = 0;
            canvas.getActiveObject().top = 0;
            canvas.setZoom(1);
            canvas.setWidth(canvas.getZoom() * canvas.getActiveObject().width);
            canvas.setHeight(canvas.getZoom() * canvas.getActiveObject().height);
            $scope.zoom = (1) * 100;
        }
        else {
            alert("there is now active objects");
        }


    };

    $scope.fitToWin = function (param) {

        [].__proto__.forEach.call(canvas._objects, (canvasItem) => {

            console.log(canvasItem.name);
            if (canvas.getActiveObject().name != 'Image' && canvasItem.name == 'Image') {
                canvas.setActiveObject(canvasItem);

            }

        });

        $scope.insideRulerWidth = document.getElementsByClassName("rul_wrapper")[0].offsetWidth
            - document.getElementsByClassName("rul_ruler_Vertical")[0].offsetHeight - 70;
        $scope.insideRulerheight = document.getElementsByClassName("rul_wrapper")[0].offsetHeight
            - document.getElementsByClassName("toolbar-header")[0].offsetHeight
            - document.getElementsByClassName("toolbar-footer")[0].offsetHeight - 90;


        if (canvas._objects && !canvas.getActiveObject()) {
            canvas.setActiveObject(canvas._objects[0])
        }
        if (canvas._objects && canvas.getActiveObject()) {

            //;

            canvas.getActiveObject().left = 0;
            canvas.getActiveObject().top = 0;
            canvas.setWidth($scope.insideRulerWidth);
            canvas.setHeight($scope.insideRulerheight);

            canvas.getActiveObject().scaleY = 1;
            canvas.getActiveObject().scaleX = 1;

            if (canvas._activeObject && canvas._activeObject.width > canvas._activeObject.height) {


                // $scope.zoom = ((canvas.width ) / canvas._activeObject.width) * 100;
                $scope.zoom = ((canvas.width) / canvas._activeObject.width) > ((canvas.height) / canvas._activeObject.height)
                    ? (((canvas.height) / canvas._activeObject.height) * 100) : (((canvas.width) / canvas._activeObject.width) * 100);


                let scaleFactorWidth = ((canvas.width / canvas._activeObject.width) * canvas._activeObject.width);
                let scaleFactorHeight = ((canvas.height / canvas._activeObject.height) * canvas._activeObject.height);

            }
            else {
                let tempScale = (window.innerHeight - 170) / canvas.getActiveObject().height;
                let tempZoom = ((canvas.width) / canvas._activeObject.width) > ((canvas.height) / canvas._activeObject.height)
                    ? (tempScale * 100) : (tempScale * 100);
                $scope.zoom = tempZoom

            }


        }

        else {
            alert("there is now active objects");
        }


    };


    //$scope.rightPanelTab = 'templates/inspectorTab.html';
    // $scope.rightPanelTab = $scope.rightTab[1].url;

    $scope.leftTab = leftPanelTabService.leftTab;
    $scope.rightTab = rightPanelTabService.rightTab;

    $scope.currentLeftTab = leftPanelTabService.tab.url;
    $scope.currentRightTab = rightPanelTabService.tab.url;

    $scope.onClickRightTab = function (tab) {


        rightPanelTabService.setTab(tab);

        //$scope.currentLeftTab = tab.url;
        $scope.currentRightTab = rightPanelTabService.getTab().url;

    }


    $scope.onClickLeftTab = function (tab) {


        leftPanelTabService && leftPanelTabService.setTab(tab);
        //$scope.currentLeftTab = tab.url;
        $scope.currentLeftTab = leftPanelTabService && leftPanelTabService.getTab().url;

        if (tab.title == "Pages") {
            $timeout(() => {
                PagesControllerScope && PagesControllerScope.refreshSavePage();
            }, 20)
        }
    }

    $scope.isActiveTab = function (tabUrl, side) {


        if (side && side == 'l') {
            return (tabUrl == $scope.currentLeftTab);
        }
        if (side && side == 'r') {


            [].__proto__.forEach.call(document.getElementsByClassName('right-tab'), (rightTabItem) => {

                rightTabItem.removeAttribute('toggled');

            });

            return (tabUrl == $scope.currentRightTab);
        }
        return false;
    }



    $scope.setMainTab = function (tabName) {

        if (tabName == 'pageFlow') {
            $scope.pageFlowShow = !$scope.pageFlowShow;
            pageFlowActive = $scope.pageFlowShow;



            if ($scope.pageFlowShow && document.getElementById("flow_cols")) {
                document.getElementById("flow_cols").removeAttribute('disabled');
                document.getElementById("flow_rows").removeAttribute('disabled');

            }
            if (!$scope.pageFlowShow && document.getElementById("flow_cols")) {
                document.getElementById("flow_cols").setAttribute('disabled', 'true');
                document.getElementById("flow_rows").setAttribute('disabled', 'true');

            }
        }

    }

    $scope.setMainTab1 = function (tabName) {
        currentActiveLeftTab;

        if (tabName == 'pageFlow') {
            $scope.pageFlowShow = true;
            pageFlowActive = $scope.pageFlowShow;


            if (pageFlowActive && (currentActiveLeftTab.title == 'projectSettings')) {
                document.getElementById("flow_cols").removeAttribute('disabled');
                document.getElementById("flow_rows").removeAttribute('disabled');

            }
            if (!pageFlowActive && (currentActiveLeftTab.title == 'projectSettings')) {
                document.getElementById("flow_cols").setAttribute('disabled', 'true');
                document.getElementById("flow_rows").setAttribute('disabled', 'true');
            }
            $timeout(() => {
                pageFlowScope.setPageFlowItemAspectRatio();
            }, 20)


        }
        if (tabName == 'pageEditor') {
            $scope.pageFlowShow = false;
            pageFlowActive = $scope.pageFlowShow;

            if (!pageFlowActive && (currentActiveLeftTab.title == 'projectSettings')) {
                document.getElementById("flow_cols").setAttribute('disabled', 'true');
                document.getElementById("flow_rows").setAttribute('disabled', 'true');
            }
        }
    }



    $scope.pageFlowTab = 'templates/pageFlow.html';

    $scope.generatePngFromCanvas = () => {
        PagesControllerScope.addPage();
    }


    // $scope.onDragComplete = function (data, evt) {
    //     
    //     console.log("drag success, data:", data);
    // }
    // $scope.onDropComplete = function (data, evt) {
    //     
    //     console.log("drop success, data:", data);
    // }
});
