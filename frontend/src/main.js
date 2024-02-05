window.onload = function() {

    var xhr = null;

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

    function commentsCallback() {
        if (xhr.readyState == 4 && xhr.status == 201) {
            const comments = JSON.parse(xhr.responseText).comments;
            
            let commentList = document.getElementById("commentlist");
            
            while (commentList.firstChild != null) commentList.removeChild(commentList.firstChild);

            const commentsArr = comments.split("*END_OF_COMMENT*\n");
            
            for (let i = 0; i < commentsArr.length; i++) {
                let p = commentList.appendChild(document.createElement("p"));
                p.textContent = commentsArr[i];
            }
        }
    }
    function getComments() {
        console.log("Getting comments...");
        xhr = getXmlHttpRequestObject();
        xhr.onreadystatechange = commentsCallback;
        xhr.open("POST", "http://localhost:6969/comments", true);
        xhr.send(null);
    }

    function playTune() {
        console.log("Play tune...");
        xhr = getXmlHttpRequestObject();
        xhr.onreadystatechange = playCallback;
        xhr.open("GET", "http://localhost:6969/play", true);
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

    function sendplayCallback() {
        // Check response
        if (xhr.readyState == 4 && xhr.status == 201) {
            console.log("Data creation response received!");

            // clear the textarea
            const textArea = document.getElementById("comment");
            textArea.value = "";

            getComments();
        }
    }

    const playButton = document.getElementById("play");

    playButton.addEventListener("click", (event) => {
        playTune();
    });

    const stopButton = document.getElementById("stop");

    stopButton.addEventListener("click", (event) => {
        stopTune();
    });
    
    const sendButton = document.getElementById("send");
    sendButton.addEventListener("click", (event) => {

        const text = document.getElementById("comment").value

        if (text.trim() != "") {
            console.log("Send comment to server...");
            xhr = getXmlHttpRequestObject();
            xhr.onreadystatechange = sendplayCallback;
            xhr.open("POST", "http://localhost:6969/comment", true);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            // Send the request over the network
            xhr.send(JSON.stringify({"data": text}));
        }
    });

    getComments();
}