let model, video, labelContainer, maxPredictions;
            let count = 0;
        
            async function callToInitLimit() {
                if (count === 0) {
                    await init();
                    count += 1;
                } else {
                    alert("Model already running");
                }
            }
        
            async function init() {
                const modelURL = "./my_model/model.json";
                const metadataURL = "./my_model/metadata.json";
        
                model = await tmImage.load(modelURL, metadataURL);
                maxPredictions = model.getTotalClasses();
        
                video = document.createElement("video");
                video.width = 200;
                video.height = 200;
        
                try {
                    const devices = await navigator.mediaDevices.enumerateDevices();
                    const videoDevices = devices.filter(device => device.kind === "videoinput");
        
                    if (videoDevices.length > 0) {
                        // Prompt user to choose a camera
                        const selectedCamera = promptCameraSelection(videoDevices);
                        
                        const constraints = {
                            video: {
                                deviceId: selectedCamera
                            }
                        };
        
                        const stream = await navigator.mediaDevices.getUserMedia(constraints);
                        video.srcObject = stream;
                        document.getElementById("webcam-container").appendChild(video);
        
                        // Initialize label container
                        labelContainer = document.getElementById("label-container");
                        for (let i = 0; i < maxPredictions; i++) {
                            labelContainer.appendChild(document.createElement("div"));
                        }
        
                        video.play();
        
                        window.requestAnimationFrame(loop);
                    } else {
                        console.error("No video devices found");
                    }
                } catch (error) {
                    console.error("Error initializing webcam:", error);
                }
            }
        
            function promptCameraSelection(videoDevices) {
                const cameraOptions = videoDevices.map(device => ({
                    value: device.deviceId,
                    label: device.label || `Camera ${videoDevices.indexOf(device) + 1}`
                }));
        
                const selection = prompt("Select a camera:\n" + cameraOptions.map((option, index) => `${index + 1}. ${option.label}`).join("\n"));
        
                if (selection && !isNaN(selection) && parseInt(selection) <= videoDevices.length) {
                    return cameraOptions[parseInt(selection) - 1].value;
                } else {
                    alert("Invalid selection. Using the first camera.");
                    return videoDevices[0].deviceId;
                }
            }
        
            async function loop() {
                await predict();
                window.requestAnimationFrame(loop);
            }
        
            async function predict() {
                const prediction = await model.predict(video);
                for (let i = 0; i < maxPredictions; i++) {
                    const classPrediction =
                        prediction[i].className + ": " + prediction[i].probability.toFixed(2);
                    labelContainer.childNodes[i].innerHTML = classPrediction;
                }
            }
        
            function reloadModel() {
                location.reload();
            }
