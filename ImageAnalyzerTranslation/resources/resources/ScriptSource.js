function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            $('#UserPicture').attr('src', e.target.result).fadeIn("slow");
        };
        reader.readAsDataURL(input.files[0]);
    }
}

 $("#choose").click(function() {
        $('#translate').hide();
        $('#InitialLanguageLabel').html("");
        $('#FinalLanguageLabel').html("");
        $('#InitialLanguageImageDescription1').html("");
        $('#FinalLanguageImageDescription1').html("");
        $('#InitialLanguageImageDescription2').html("");
        $('#FinalLanguageImageDescription2').html("");
        $('#InitialLanguageImageDescription3').html("");
        $('#FinalLanguageImageDescription3').html("");
        
        $('#translate').hide();
 });

$(document).ready(function() {
    $('#translate').hide();
});


var langInitial = "English", langFinal = "English";

function langChange(input, name) {
    var tempLang = $('input[name=' + name + ']:checked').val();
    if (input == 0) {langInitial = tempLang;}
    else if (input == 1) {langFinal = tempLang;}
    console.log(langInitial);
    console.log(langFinal);
}

$(document).ready(function() {
    $("#translate").click(function() {
        console.log("Clicked!");
        $.ajax({
            url: "/image",
            type: "POST",
            data: JSON.stringify({
                link: "./tower.jpg",
                fromLang: langInitial,
                toLang: langFinal
            }),
            contentType: "application/json",
            dataType: 'json'
        }).done(function(data) {
            console.log(data.translations.from[2])
            
            $('#InitialLanguageLabel').html(langInitial + ":");
            $('#FinalLanguageLabel').html(langFinal + ":");
            
            if (data.translations.from[0] != ''){
                $('#InitialLanguageImageDescription1').html(data.translations.from[0]);
                $('#FinalLanguageImageDescription1').html(data.translations.to[0]);
            }
            if (data.translations.from[1] != ''){
                $('#InitialLanguageImageDescription2').html(data.translations.from[1]);
                $('#FinalLanguageImageDescription2').html(data.translations.to[1]);
            }
            if (data.translations.from[2] != ''){
                $('#InitialLanguageImageDescription3').html(data.translations.from[2]);
                $('#FinalLanguageImageDescription3').html(data.translations.to[2]);
            }
        });
    });

    var submitBtn = $("#submit");
    var form = $("#form");
    submitBtn.click(function(e) {
        e.preventDefault();
        console.log("Form Submitted!");
        var imageChosen = $("#file").prop('files')[0];
        getBase64(imageChosen);
    });
});

function getBase64(file) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function() {
        var base64Url = reader.result.split(',')[1];
        //console.log(base64Url);
        var blobFile = b64toBlob(base64Url, 'image/jpg');
        var data = new FormData($("#form"));
        console.log(blobFile);
        data.append("image_data", blobFile);
        console.log(data.get("image_data"));
        console.log(data.get("image_data").size);
        if((data.get("image_data").size) < 2097152){
            $.ajax({
                url: "/upload",
                data: data,
                processData: false,
                contentType: false,
                type: 'POST',
                success: function(data) {
                    $('#translate').fadeIn();
                }
            });
        }
        else {
            alert("Image too large, must be less than 2097152 bytes [2MiB]"); //2Mib is the largest file size the WatsonAPI can take
        }
    };
    reader.onerror = function(error) {
        console.log('Error: ', error);
    };
}

function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;
    var byteCharacters = atob(b64Data);
    var byteArrays = [];
    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);
        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        var byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    var blob = new Blob(byteArrays, {
        type: contentType
    });
    return blob;
}
