$(document).ready(function(){

    var listCustomer = localStorage.getItem("listCustomer");
    listCustomer = JSON.parse(listCustomer);
    //btn show setting
    $(document).on("click", ".settingIcon", function(){
        $(".settingMain").slideToggle();
    });
    $(document).on("click", ".listNumIcon", function(){
        $(".listNumMain").slideToggle();
    });

    $(document).on("click", ".mainRandomClear", function(){
        for (let i = 0; i < maxSize; i++) {
            $(".mainRandomBorderItem").eq(i).text("0");
        }
    });


    $(document).keypress(function(event){
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if(keycode === 13){
            if ($(".modal").is(':visible')) {
                $(".modal").modal('hide');
            } else if ($('.mainRandomButtonRun').css('display') !== 'none') {
                $('.mainRandomButtonRun').click();
            } else {
                $('.mainRandomButtonStop').click();
            }
        }
    });

    //get max limit
    var max = localStorage.getItem("max");
    if (max == null) {
        max = 320;
        localStorage.setItem("max", max);
        location.reload();
    }
    var maxSize = max.length;
    generateDisplayBox(maxSize);
    displayNumber(max);
    $("input[name='max']").val(max);


    //get list number
    var listNum = localStorage.getItem("listNum");
    listNum != null && listNum !== "" ? listNum = listNum.split(",") : listNum = [];
    updateListNumHTML();

    var isDisplay = localStorage.getItem("displayModal");
    if (isDisplay == null || isDisplay == "true") {
        $(".listNumMainShowModal input[type='checkbox']").attr('checked', true);
    }

    //get pass is selected
    var pass = localStorage.getItem("pass");

    pass != null ? pass = pass.split(",") : pass = [];
    for (var i = 0; i < pass.length; i++) pass[i] = parseInt(pass[i]);
    $("input[name='pass']").val(pass.toString());

    var ran = 0;
    var ranGen = 0;
    var refreshIntervalId;
    var refreshInterval;

    $(".mainRandomButtonRun").click(function(){
        runRandom(maxSize);
        $(this).hide();
        $(this).next().show();
    });

    function runRandom(size) {
        refreshIntervalId = setInterval(function(){
            do{
                ranGen = Math.floor((Math.random() * max) + 1);
            }
            while(pass.indexOf(ranGen) !== -1 || listNum.indexOf(numberToString(ranGen)) !== -1);
            displayNumber(ranGen, size);
        }, 50);
    }


    $(".mainRandomButtonStop").click(function(){
        // alert(ran);
        $(".mainRandomButtonStop").hide();
        $(".mainRandomButtonWaiting").show();
        ran = ranGen;
        //
        // runRandom(maxSize-1);
        var i = 1;
        clearInterval(refreshIntervalId);
        runRandom(maxSize-i);
        i++;
        refreshInterval = setInterval(function(){
            clearInterval(refreshIntervalId);
            runRandom(maxSize-i);
            i++;
            if(maxSize < i) {
                clearInterval(refreshInterval);
                $(".mainRandomButtonWaiting").hide();
                $(".mainRandomButtonRun").show();
                showModal(ran);
                var toFind = ran.toString();
                var filtered = listCustomer.filter(function(el) {
                  return el.stt === toFind;
                });
                console.log(filtered[0], filtered[0].name, filtered[0].stt);
                addNumberToList(ran);

            }
            console.log(i);
        }, 500);
    });

    //save config
    $(document).on("click", ".btnSbm", function(){
        max = $("input[name='max']").val();
        localStorage.setItem("max", max);
        maxSize = max.toString().length;
        generateDisplayBox(maxSize);
        displayNumber(max);
        pass = generatePass($("input[name='pass']").val());
        uploadFile();
    });

    //Delete all list
    $(document).on("click", ".listNumMainDeleteAll", function(){
        if (confirm("Bạn muốn xóa tất cả ?")) {
            listNum = [];
            updateListNumHTML();
        }
    });

    $(".listNumMainShowModal input[type='checkbox']").change(function() {
        if(this.checked) {
            localStorage.setItem("displayModal", true);
        } else {
            localStorage.setItem("displayModal", false);
        }
    });

    if ($(this).is(":checked")) {
        selected.push($(this).attr('name'));
    }


    //Delete item list
    $(document).on("click", ".listNumMainDeleteItem", function(){
        var itemIndex = $(this).parent().index();
        var itemLength = $(".listNumMainDeleteItem").length;
        listNum.splice(itemLength-itemIndex-1, 1);
        updateListNumHTML();
    });

    function generatePass(passStr) {
        localStorage.setItem("pass", passStr);
        var passArr = passStr.split(",");
        for (var i = 0; i < passArr.length; i++) passArr[i] = parseInt(passArr[i]);
        $("input[name='pass']").val(passArr.toString());
        return passArr;
    }

    function generateDisplayBox(size) {
        var str = "";
        for (let i = 0; i < size; i++) {
            str += "<div class=\"mainRandomBorderItem\">0</div>";
        }
        $(".mainRandomBorder").html(str);
    }

    function displayNumber(number, size) {
        number = numberToString (number);
        for (let i = 0; i < size; i++) {
            var str = number.substring(i, i+1);
            $(".mainRandomBorderItem").eq(i).text(str);
        }
    }

    function numberToString (number) {
        var numPlus = "";
        number = number.toString();

        for (let i = number.length; i < maxSize; i++) {
            numPlus += "0";
        }
        return numPlus + number;
    }

    function showModal(number) {
        var isDisplay = localStorage.getItem("displayModal");
        if (isDisplay == null || isDisplay == "true") {
            $(".modal-body h1").text(numberToString(number));
            $(".modal").modal();
        }
    }

    function addNumberToList (number) {
        console.log(number);
        listNum.push(numberToString (number));
        updateListNumHTML();
    }

    function updateListNumHTML(){
        var timeComplete = 500;
        localStorage.setItem("listNum", listNum);
        list_li = "";
        listNumLength = listNum.length;
        console.log(listNumLength);
        for (var i = listNumLength; i > 0 ; i--) {
            list_li += "<li><div>"+listNum[i-1]+"</div><div class='listNumMainDeleteItem'><i class='far fa-times-circle'></i></div></li>"
        }
        $(".listNumMain ul").html(list_li);
    }


function uploadFile() {
    var fileUpload = $("#fileUpload")[0];
        //Validate whether File is valid Excel file.
    var regex = /^([a-zA-Z0-9\s_\\.\-:\)\(])+(.xls|.xlsx)$/;
    if (regex.test(fileUpload.value.toLowerCase())) {
        if (typeof (FileReader) != "undefined") {
            var reader = new FileReader();

            //For Browsers other than IE.
            if (reader.readAsBinaryString) {
                reader.onload = function (e) {
                    ProcessExcel(e.target.result);
                };
                reader.readAsBinaryString(fileUpload.files[0]);
            } else {
                //For IE Browser.
                reader.onload = function (e) {
                    var data = "";
                    var bytes = new Uint8Array(e.target.result);
                    for (var i = 0; i < bytes.byteLength; i++) {
                        data += String.fromCharCode(bytes[i]);
                    }
                    console.log(data);
                    ProcessExcel(data);
                };
                reader.readAsArrayBuffer(fileUpload.files[0]);
            }
        } else {
            alert("This browser does not support HTML5.");
        }
    } else {
        alert("Please upload a valid Excel file.");
    }
}
    
    function ProcessExcel(data) {
        //Read the Excel File data.
        var workbook = XLSX.read(data, {
            type: 'binary'
        });
 
        //Fetch the name of First Sheet.
        var firstSheet = workbook.SheetNames[0];
 
        //Read all rows from First Sheet into an JSON array.
        listCustomer = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);

        console.log(listCustomer);
        localStorage.setItem("listCustomer", JSON.stringify(listCustomer));

        
    };
});