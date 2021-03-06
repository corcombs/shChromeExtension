document.addEventListener("DOMContentLoaded", function() { 
    chrome.tabs.executeScript(null,{code:"document.getElementById('txtTotalMilesKM').value='Test';"});
    var __PDF_DOC,
        __CURRENT_PAGE,
        __TOTAL_PAGES,
        __PAGE_RENDERING_IN_PROGRESS = 0,
        __CANVAS = $('#pdf-canvas').get(0),
        __CANVAS_CTX = __CANVAS.getContext('2d'),
        selectingGridCorner=4,
        gridCoordinates=[[0,0],[0,0],[0,0],[0,0]];;
    function changeSize(){
        var canvas=$('#pdf-canvas');
        var pct = .5;
        var cw=canvas.width;
        var ch=canvas.height;
        tempCanvas.width=cw;
        tempCanvas.height=ch;
        __CANVAS.drawImage(canvas,0,0);
        canvas.width*=pct;
        canvas.height*=pct;
        var ctx=canvas.getContext('2d');
        ctx.drawImage(tempCanvas,0,0,cw,ch,0,0,cw*pct,ch*pct);
    }
    function showPDF(pdf_url) {
        $("#pdf-loader").show();
        PDFJS.getDocument({ url: pdf_url }).then(function(pdf_doc) {
            __PDF_DOC = pdf_doc;
            __TOTAL_PAGES = __PDF_DOC.numPages;

            // Hide the pdf loader and show pdf container in HTML
            $("#pdf-loader").hide();
            $("#pdf-contents").show();
            $("#pdf-total-pages").text(__TOTAL_PAGES);

            // Show the first page
            showPage(1);
        }).catch(function(error) {
            // If error re-show the upload button
            $("#pdf-loader").hide();
            $("#upload-button").show();

            alert(error.message);
        });;
    }

    function showPage(page_no) {
        __PAGE_RENDERING_IN_PROGRESS = 1;
        __CURRENT_PAGE = page_no;

        // Disable Prev & Next buttons while page is being loaded
        $("#pdf-next, #pdf-prev").attr('disabled', 'disabled');

        // While page is being rendered hide the canvas and show a loading message
        $("#pdf-canvas").hide();
        $("#page-loader").show();

        // Update current page in HTML
        $("#pdf-current-page").text(page_no);

        // Fetch the page
        __PDF_DOC.getPage(page_no).then(function(page) {
            // As the canvas is of a fixed width we need to set the scale of the viewport accordingly
            var scale_required = __CANVAS.width / page.getViewport(1).width;

            // Get viewport of the page at required scale
            var viewport = page.getViewport(scale_required);

            // Set canvas height
            __CANVAS.height = viewport.height;

            var renderContext = {
                canvasContext: __CANVAS_CTX,
                viewport: viewport
            };

            // Render the page contents in the canvas
            page.render(renderContext).then(function() {
                __PAGE_RENDERING_IN_PROGRESS = 0;

                // Re-enable Prev & Next buttons
                $("#pdf-next, #pdf-prev").removeAttr('disabled');

                // Show the canvas and hide the page loader
                $("#pdf-canvas").show();
                $("#page-loader").hide();
            });
        });
    }
    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
    }   
    // Upon click this should should trigger click on the #file-to-upload file input element
    // This is better than showing the not-good-looking file input element
    $("#upload-button").on('click', function() {
        $("#file-to-upload").trigger('click');
    });
    
    // When user chooses a PDF file
    $("#file-to-upload").on('change', function() {
        // Validate whether PDF
        if(['application/pdf'].indexOf($("#file-to-upload").get(0).files[0].type) == -1) {
            alert('Error : Not a PDF');
            return;
        }

        $("#upload-button").hide();

        // Send the object url of the pdf
        showPDF(URL.createObjectURL($("#file-to-upload").get(0).files[0]));
    });

    // Previous page of the PDF
    $("#pdf-prev").on('click', function() {
        if(__CURRENT_PAGE != 1)
            showPage(--__CURRENT_PAGE);
    });

    // Next page of the PDF
    $("#pdf-next").on('click', function() {
        //if(__CURRENT_PAGE != __TOTAL_PAGES)
            //showPage(++__CURRENT_PAGE);
        __CANVAS_CTX.translate(__CANVAS.width/2,__CANVAS.height/2);
        rotateAmt=rotateAmt+.1;
        __CANVAS_CTX.rotate(.1);
        __CANVAS_CTX.fillRect(0,0, 100, 100);
    });
    var rotateAmt=0;
    $("#pdf-grid").on('click', function() {
        __CANVAS_CTX.translate(__CANVAS.width/2,__CANVAS.height/2);
        rotateAmt=rotateAmt+.1;
        __CANVAS_CTX.rotate(.1);
        __CANVAS_CTX.fillRect(gridCoordinates[0][0],gridCoordinates[0][1], 100, 100);
        if(selectingGridCorner>=3){
            selectingGridCorner=0;
            gridCoordinates=[[0,0],[0,0],[0,0],[0,0]];
            $("#pdf-grid").text('Cancel');
        }else{
            selectingGridCorner=4;
            $("#pdf-grid").text("Select Grid");
        }
    });
     $("#pdf-canvas").on('click', function(evt) {
         var pos = getMousePos(document.getElementById('pdf-canvas'), evt);
   
        if(selectingGridCorner==3){
            
        }else{
            gridCoordinates[selectingGridCorner][0]=pos.x;
            gridCoordinates[selectingGridCorner][1]=pos.y;
            $("#pdf-grid").text(gridCoordinates[selectingGridCorner][0] +" " +gridCoordinates[selectingGridCorner][1]+" "+selectingGridCorner);
            selectingGridCorner++;
            if(selectingGridCorner==3){
                $("#pdf-grid").text("Boom");
                //__CANVAS_CTX.fillRect(gridCoordinates[0][0],gridCoordinates[0][1], 100, 100);
                var slope =0;
                var length=Math.hypot(gridCoordinates[1][0]-gridCoordinates[0][0], gridCoordinates[1][1]-gridCoordinates[0][1]);
                var width=Math.hypot(gridCoordinates[2][0]-gridCoordinates[1][0], gridCoordinates[2][1]-gridCoordinates[1][1]);
                //ctx.translate(0,0);
                //ctx.rotate(Math.atan(slope));
                __CANVAS_CTX.fillRect(gridCoordinates[0][0], gridCoordinates[0][1], length, width);
            }
        }
    });
});