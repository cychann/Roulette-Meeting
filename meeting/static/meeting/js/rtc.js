import h from './helpers.js';
console.log("this is rtc.js")
window.addEventListener('load', () => {
    const room = h.getQString(window.location.href, "room");
    const state = JSON.parse(sessionStorage.getItem(room)) || {};
    const username = state.username;

    if (!room || !username) {
        alert("잘못된 접근입니다.");
        window.location.replace(window.location.origin);
    }

    else {
        let commElem = document.getElementsByClassName('room-comm');
        console.log("rtc.js window load into else", room, username, commElem)
        for (let i = 0; i < commElem.length; i++) {
            commElem[i].attributes.removeNamedItem('hidden');
        }

        var pc = [];
        let clientList = [];
        let socket = io('/stream')
        var socketId = '';
        var randomNumber = `__${h.generateRandomString()}__${h.generateRandomString()}__`;
        var myStream = '';
        var screen = '';
        var recordedStream = [];
        var mediaRecorder = '';

        //Get user video by default
        getAndSetUserStream();

        socket.on('connect', () => {
            //set socketId
            socketId = socket.io.engine.id;
            document.getElementById('randomNumber').innerText = randomNumber;
            console.log("rtc.js socket on connect", socketId, room)

            socket.emit('subscribe', {
                room: room,
                socketId: socketId,
                username: username
            });


            socket.on('new user', (data) => {
                socket.emit('newUserStart', { to: data.socketId, sender: socketId, username: username });
                console.log("rtc.js socket on connect on new user", socketId, room, data)
                pc.push(data.socketId);
                clientList.push(data.socketId)
                init(true, data.socketId, data.username);
            });



            socket.on('newUserStart', (data) => {
                pc.push(data.sender);
                clientList.push(data.sender)
                console.log("rtc.js socket on connect on new user start", socketId, room, data)
                init(false, data.sender, data.username);
            });


            socket.on('ice candidates', async (data) => {
                console.log("되냐?", socket)
                console.log("pc충", pc)
                console.log("저장하냐구~~", clientList)
                console.log("rtc.js socket on connect on icd candidates", socketId, room, data)
                await pc[data.sender].addIceCandidate(new RTCIceCandidate(data.candidate));
            });


            socket.on('sdp', async (data) => {
                console.log("rtc.js socket on connect on sdp", socketId, room, data)
                if (data.description.type === 'offer') {
                    console.log("rtc.js socket on connect on sdp in if", room, data.description.type, data.sender)
                    data.description ? await pc[data.sender].setRemoteDescription(new RTCSessionDescription(data.description)) : '';

                    h.getUserFullMedia().then(async (stream) => {
                        if (!document.getElementById('local').srcObject) {
                            h.setLocalStream(stream);
                        }

                        //save my stream
                        myStream = stream;

                        stream.getTracks().forEach((track) => {
                            pc[data.sender].addTrack(track, stream);
                        });

                        let answer = await pc[data.sender].createAnswer();

                        await pc[data.sender].setLocalDescription(answer);

                        const emitData = {
                            description: pc[data.sender].localDescription,
                            to: data.sender,
                            sender: socketId,
                            username: username,
                        };
                        console.log("emit 'sdp': ", emitData);
                        socket.emit('sdp', emitData);
                    }).catch((e) => {
                        console.error(e);
                    });
                }
                else if (data.description.type === 'answer') {
                    console.log("rtc.js socket on connect on sdp in if", room, data.description.type, data.sender)
                    await pc[data.sender].setRemoteDescription(new RTCSessionDescription(data.description));
                }
            });


            socket.on('chat', (data) => {
                console.log("rtc.js socket on connect on chat", data)
                h.addChat(data, 'remote');
            });
            socket.on('random', (data) => {
                console.log("rtc.js socket on random ", data)
                document.getElementById('choice').innerText = `발표자:${data.choice}`
            })
        });


        function getAndSetUserStream() {
            console.log("run getAndSetUserStream()")
            h.getUserFullMedia().then((stream) => {
                //save my stream
                myStream = stream;
                console.log("run getAndSetUserStream() in getUserFullMedia return stream", stream)
                h.setLocalStream(stream);
            }).catch((e) => {
                console.error(`stream error: ${e}`);
            });
        }


        function sendMsg(msg) {
            let data = {
                room: room,
                msg: msg,
                sender: `${username} (${randomNumber})`
            };
            console.log("run sendmsg", data)
            //emit chat message
            socket.emit('chat', data);

            //add localchat
            h.addChat(data, 'local');
        }

        function runRandom() {
            let randomList = []
            for (let c of clientList) {
                randomList.push(clientList[c])
            }
            randomList.push(username)
            const choice = randomList[Math.floor(Math.random() * randomList.length)]
            let data = {
                room: room,
                sender: username,
                choice: choice
            }
            document.getElementById('choice').innerText = `발표자:${choice}`
            socket.emit('random', data)
        }

        function init(createOffer, partnerName, name) {
            pc[partnerName] = new RTCPeerConnection(h.getIceServer());
            clientList[partnerName] = name
            console.log("run init", createOffer, partnerName, name)
            if (screen && screen.getTracks().length) {
                console.log("init if getTracks", pc[partnerName])
                screen.getTracks().forEach((track) => {
                    pc[partnerName].addTrack(track, screen);//should trigger negotiationneeded event
                });
            }
            else if (myStream) {
                console.log("init else if myStream", pc[partnerName])
                myStream.getTracks().forEach((track) => {
                    pc[partnerName].addTrack(track, myStream);//should trigger negotiationneeded event
                });
            }
            else {
                console.log("init else", pc[partnerName])
                h.getUserFullMedia().then((stream) => {
                    //save my stream
                    myStream = stream;

                    stream.getTracks().forEach((track) => {
                        pc[partnerName].addTrack(track, stream);//should trigger negotiationneeded event
                    });

                    h.setLocalStream(stream);
                }).catch((e) => {
                    console.error(`stream error: ${e}`);
                });
            }


            //create offer
            if (createOffer) {
                pc[partnerName].onnegotiationneeded = async () => {
                    let offer = await pc[partnerName].createOffer();

                    await pc[partnerName].setLocalDescription(offer);

                    socket.emit('sdp', { description: pc[partnerName].localDescription, to: partnerName, sender: socketId, username: username });
                };
            }


            //send ice candidate to partnerNames
            pc[partnerName].onicecandidate = ({ candidate }) => {
                const data = { candidate: candidate, to: partnerName, sender: socketId, username: username };
                console.log("emit 'ice candidates' : ", data)
                socket.emit('ice candidates', data);
            };


            //add
            pc[partnerName].ontrack = (e) => {
                let str = e.streams[0];
                if (document.getElementById(`${partnerName}-video`)) {
                    document.getElementById(`${partnerName}-video`).srcObject = str;
                }

                else {
                    //video elem
                    console.log("여기였나..", clientList[partnerName])
                    let newVid = document.createElement('video');
                    newVid.id = `${partnerName}-video`;
                    newVid.srcObject = str;
                    newVid.autoplay = true;
                    newVid.className = 'remote-video';

                    //video controls elements
                    let controlDiv = document.createElement('div');
                    controlDiv.className = 'remote-video-controls';
                    controlDiv.innerHTML = `<i class="fa fa-microphone text-white pr-3 mute-remote-mic" title="Mute"></i>
                        <i class="fa fa-expand text-white expand-remote-video" title="Expand"></i>`;

                    //create a new div for card
                    let cardDiv = document.createElement('div');
                    cardDiv.className = 'card card-sm';
                    cardDiv.id = partnerName;
                    cardDiv.appendChild(newVid);
                    cardDiv.appendChild(controlDiv);


                    //username
                    let nameDiv = document.createElement('div');
                    nameDiv.innerText = clientList[partnerName];
                    nameDiv.style.textAlign = 'center';
                    cardDiv.appendChild(nameDiv);
                    //put div in main-section elem
                    document.getElementById('videos').appendChild(cardDiv);

                    h.adjustVideoElemSize();
                }
            };


            pc[partnerName].onconnectionstatechange = (d) => {
                console.log("init onconnectionstatechange1", pc[partnerName], d)
                switch (pc[partnerName].iceConnectionState) {
                    case 'disconnected':
                    case 'failed':
                        h.closeVideo(partnerName);
                        break;

                    case 'closed':
                        h.closeVideo(partnerName);
                        break;
                }
            };


            pc[partnerName].onsignalingstatechange = (d) => {
                console.log("init onconnectionstatechange2", pc[partnerName], d)
                switch (pc[partnerName].signalingState) {
                    case 'closed':
                        console.log("Signalling state is 'closed'");
                        h.closeVideo(partnerName);
                        break;
                }
            };
        }



        function shareScreen() {
            console.log("run shareScreen")
            h.shareScreen().then((stream) => {
                h.toggleShareIcons(true);

                //disable the video toggle btns while sharing screen. This is to ensure clicking on the btn does not interfere with the screen sharing
                //It will be enabled was user stopped sharing screen
                h.toggleVideoBtnDisabled(true);

                //save my screen stream
                screen = stream;

                //share the new stream with all partners
                broadcastNewTracks(stream, 'video', false);

                //When the stop sharing button shown by the browser is clicked
                screen.getVideoTracks()[0].addEventListener('ended', () => {
                    stopSharingScreen();
                });
            }).catch((e) => {
                console.error(e);
            });
        }



        function stopSharingScreen() {
            console.log("run stopSharingScreen")
            //enable video toggle btn
            h.toggleVideoBtnDisabled(false);

            return new Promise((res, rej) => {
                screen.getTracks().length ? screen.getTracks().forEach(track => track.stop()) : '';

                res();
            }).then(() => {
                h.toggleShareIcons(false);
                broadcastNewTracks(myStream, 'video');
            }).catch((e) => {
                console.error(e);
            });
        }



        function broadcastNewTracks(stream, type, mirrorMode = true) {
            console.log("run broadcastNewTracks", stream, type, mirrorMode)
            h.setLocalStream(stream, mirrorMode);

            let track = type == 'audio' ? stream.getAudioTracks()[0] : stream.getVideoTracks()[0];

            for (let p in pc) {
                let pName = pc[p];
                if (typeof pc[pName] == 'object') {
                    h.replaceTrack(track, pc[pName]);
                }
            }
        }


        function toggleRecordingIcons(isRecording) {
            console.log("run toggleRecordingIcons", isRecording)
            let e = document.getElementById('record');

            if (isRecording) {
                e.setAttribute('title', 'Stop recording');
                e.children[0].classList.add('text-danger');
                e.children[0].classList.remove('text-white');
            }
            else {
                e.setAttribute('title', 'Record');
                e.children[0].classList.add('text-white');
                e.children[0].classList.remove('text-danger');
            }
        }


        function startRecording(stream) {
            console.log("run startRecording", stream)
            mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9'
            });

            mediaRecorder.start(1000);
            toggleRecordingIcons(true);

            mediaRecorder.ondataavailable = function (e) {
                recordedStream.push(e.data);
            };

            mediaRecorder.onstop = function () {
                toggleRecordingIcons(false);

                h.saveRecordedStream(recordedStream, username);

                setTimeout(() => {
                    recordedStream = [];
                }, 3000);
            };

            mediaRecorder.onerror = function (e) {
                console.error(e);
            };
        }


        //Chat textarea
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.which === 13 && (e.target.value.trim())) {
                e.preventDefault();

                sendMsg(e.target.value);

                setTimeout(() => {
                    e.target.value = '';
                }, 50);
            }
        });
        document.getElementById('random').addEventListener('click', (e) => runRandom())


        //When the video icon is clicked
        document.getElementById('toggle-video').addEventListener('click', (e) => {
            e.preventDefault();

            let elem = document.getElementById('toggle-video');

            if (myStream.getVideoTracks()[0].enabled) {
                e.target.classList.remove('fa-video');
                e.target.classList.add('fa-video-slash');
                elem.setAttribute('title', 'Show Video');

                myStream.getVideoTracks()[0].enabled = false;
            }
            else {
                e.target.classList.remove('fa-video-slash');
                e.target.classList.add('fa-video');
                elem.setAttribute('title', 'Hide Video');

                myStream.getVideoTracks()[0].enabled = true;
            }

            broadcastNewTracks(myStream, 'video');
        });


        //When the mute icon is clicked
        document.getElementById('toggle-mute').addEventListener('click', (e) => {
            e.preventDefault();

            let elem = document.getElementById('toggle-mute');

            if (myStream.getAudioTracks()[0].enabled) {
                e.target.classList.remove('fa-microphone-alt');
                e.target.classList.add('fa-microphone-alt-slash');
                elem.setAttribute('title', 'Unmute');

                myStream.getAudioTracks()[0].enabled = false;
            }
            else {
                e.target.classList.remove('fa-microphone-alt-slash');
                e.target.classList.add('fa-microphone-alt');
                elem.setAttribute('title', 'Mute');

                myStream.getAudioTracks()[0].enabled = true;
            }

            broadcastNewTracks(myStream, 'audio');
        });


        //When user clicks the 'Share screen' button
        document.getElementById('share-screen').addEventListener('click', (e) => {
            e.preventDefault();

            if (screen && screen.getVideoTracks().length && screen.getVideoTracks()[0].readyState != 'ended') {
                stopSharingScreen();
            }
            else {
                shareScreen();
            }
        });
        document.getElementsByClassName('local-name').innerText = username;
        console.log("유저네임 찍히나요?", username)

        //When record button is clicked
        document.getElementById('record').addEventListener('click', (e) => {
            /**
             * Ask user what they want to record.
             * Get the stream based on selection and start recording
             */
            if (!mediaRecorder || mediaRecorder.state == 'inactive') {
                h.toggleModal('recording-options-modal', true);
            }
            else if (mediaRecorder.state == 'paused') {
                mediaRecorder.resume();
            }
            else if (mediaRecorder.state == 'recording') {
                mediaRecorder.stop();
            }
        });


        //When user choose to record screen
        document.getElementById('record-screen').addEventListener('click', () => {
            h.toggleModal('recording-options-modal', false);

            if (screen && screen.getVideoTracks().length) {
                startRecording(screen);
            }
            else {
                h.shareScreen().then((screenStream) => {
                    startRecording(screenStream);
                }).catch(() => { });
            }
        });


        //When user choose to record own video
        document.getElementById('record-video').addEventListener('click', () => {
            h.toggleModal('recording-options-modal', false);

            if (myStream && myStream.getTracks().length) {
                startRecording(myStream);
            }
            else {
                h.getUserFullMedia().then((videoStream) => {
                    startRecording(videoStream);
                }).catch(() => { });
            }
        });
    }
});
