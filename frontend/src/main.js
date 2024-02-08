window.onload = function() {

    var xhr = null;

    var socket = io.connect('http://localhost:6969');
    socket.on('connect', function() {
        console.log('Connected!');
    });

    socket.on('message', function(event) {

        const playDiv = document.getElementById("playdiv")
        while (playDiv.firstChild != null) playDiv.removeChild(playDiv.firstChild);

        let fileList = event.split("\n")
        fileList.pop(); // remove the last "\n"

        console.log(fileList);

        let index = 1;

        let template = ``;

        for (f of fileList) {
            template += `
            <table class="tbl-playlist"><thead id="tbl-head-id">
            <tr class="trow">
            <td class="tdplay"><img class="playimg" id="play${index}" src="./gfx/play_4208490.png" /></td>
            <td class="tdname">${f}</td>
            <td class="tdstop" id="stop${index}"><img src="./gfx/icons8-stop-button-48.png" /></td>
            <td class="tdcomm"><button id="comment${index}">Comments</button></td>
            </tr>
            </thead></table>
            <div class="commentdiv"><p id="comments${index}"></p></div>
            `
            index += 1;
        }

        playDiv.innerHTML = template;

        for (let i = 1; i < fileList.length + 1; i++) {
            const playButton = document.getElementById("play"+i);

            playButton.addEventListener("click", (event) => {
                playTune(fileList[i-1]);
            });
        }

        for (let i = 1; i < fileList.length + 1; i++) {
            const stopButton = document.getElementById("stop"+i);

            stopButton.addEventListener("click", (event) => {
                stopTune();
            });
        }

        for (let i = 1; i < fileList.length + 1; i++) {
            const commentsButton = document.getElementById("comment"+i);

                commentsButton.addEventListener("click", (event) => {
                
                    const commDiv = document.getElementById("comments"+i);

                    if (commDiv.firstChild == null) {
                        getNComments(i);
                    } else {
                        while (commDiv.firstChild != null) commDiv.removeChild(commDiv.firstChild);
                    }
            });
        }

    });

    getXmlHttpRequestObject = function () {
        if (!xhr) {
            // Create a new XMLHttpRequest object 
            xhr = new XMLHttpRequest();
        }
        return xhr;
    };

    function playCallback() {
        // Check response
        if (xhr.readyState == 4 && xhr.status == 200) {
            console.log("Play message received!");
        }
    }

    function stopCallback() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            console.log("Stop playing message received!");
        }
    }

    function commentsNCallback() {
        if (xhr.readyState == 4 && xhr.status == 201) {
            const comments = JSON.parse(xhr.responseText).comments;
            const tune = JSON.parse(xhr.responseText).tune;
            const commArr = comments.split("*END_OF_COMMENT*")
            

            const commentDiv = document.getElementById("comments"+tune);
            
            while (commentDiv.firstChild != null) commentDiv.removeChild(commentDiv.firstChild);

            for (let i = 0; i < commArr.length; i++) {
                let p = commentDiv.appendChild(document.createElement("p"));
                p.textContent = commArr[i];
            }

            let ta = document.createElement("textarea");
            ta.setAttribute("rows", "5");
            ta.setAttribute("cols", "33");
            ta.setAttribute("placeholder", "What do you think?")
            ta.setAttribute("id", "ta"+tune);

            commentDiv.appendChild(ta);
            

            let sb = document.createElement("button");
            sb.setAttribute("id","button"+tune);

            sb.addEventListener("click", (event) => {
                const text = document.getElementById("ta"+tune).value

                if (text.trim() != "") {
                    console.log("Send comment to server...");
                    xhr = getXmlHttpRequestObject();
                    xhr.onreadystatechange = sendCommentCallback;
                    xhr.open("POST", "http://localhost:6969/comment", true);
                    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                    // Send the request over the network
                    xhr.send(JSON.stringify({"data": "#"+tune.toString()+" "+text}));
                }
            });
            let tn = document.createElement("textnode");
            tn.textContent = "Send";
            sb.appendChild(tn);

            commentDiv.appendChild(sb);
            
            console.log(comments);
        }
    }

    function getNComments(i) {
        console.log("Getting comments...");
        xhr = getXmlHttpRequestObject();
        xhr.onreadystatechange = commentsNCallback;
        xhr.open("POST", "http://localhost:6969/comments/"+i, true);
        xhr.send(null);
    }

    function playTune(message) {
        console.log("Play tune...");
        xhr = getXmlHttpRequestObject();
        xhr.onreadystatechange = playCallback;
        xhr.open("GET", "http://localhost:6969/play/"+message, true);
        // Send the request over the network
        xhr.send(null);
    }

    function stopTune() {
        console.log("Stop the tune...");
        xhr = getXmlHttpRequestObject();
        xhr.onreadystatechange = stopCallback;
        xhr.open("GET", "http://localhost:6969/stop", true);
        xhr.send(null);
    }

    function sendCommentCallback() {
        // Check response
        if (xhr.readyState == 4 && xhr.status == 201) {
            console.log("Data creation response received!");

            console.log(xhr.responseText);

            let tuneNr = parseInt(JSON.parse(xhr.responseText)["message"].toString().replace("received: #", ""));
            
            // clear the textarea
            const textArea = document.getElementById("ta"+tuneNr);
            textArea.value = "";

            getNComments(tuneNr);
        }
    }

    function getNComments(tuneNr) {

        console.log("Getting comments...");

        xhr = getXmlHttpRequestObject();
        xhr.onreadystatechange = commentsNCallback;
        xhr.open("POST", "http://localhost:6969/comments/"+tuneNr, true);
        xhr.send(null);
    }

    // print the filename of file to be uploaded...
    const fileInput = document.getElementById("fileInput");
    fileInput.addEventListener("change", (event) => {
        const fileName = event.target.files[0].name;

        const textNode = document.getElementById('fileName')
        textNode.textContent = fileName;
    });

    const uploadButton = document.getElementById("upload");
    uploadButton.addEventListener("click", (event) => {
        uploadFile();
    });

    function uploadFile() {
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];

        let formData = new FormData();
        formData.append('file', file);

        xhr.open('POST', 'http://localhost:6969/upload', true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                console.log('File sent successfully!');
            }
        };

        xhr.send(formData);
    }

}