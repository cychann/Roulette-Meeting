import h from './helpers.js';
// console.log("this is rtc.js")
window.addEventListener('load', () => {

    const room = h.getQString(window.location.href, "room");
    const state = JSON.parse(sessionStorage.getItem(room)) || {};
    const username = state.username;

    if (!room || !username) {
        alert("참가하기를 통해서 들어와주세요!");
        window.location.replace(window.location.origin);
    }

    else {
        let commElem = document.getElementsByClassName('room-comm');
        // console.log("rtc.js window load into else", room, username, commElem)
        for (let i = 0; i < commElem.length; i++) {
            commElem[i].attributes.removeNamedItem('hidden');
        }

        var pc = [];
        let clientList = new Set();
        let clientIdNameObject = {};
        let socket = io('/stream')
        var socketId = '';
        var randomNumber = `__${h.generateRandomString()}__${h.generateRandomString()}__`;
        var myStream = '';
        var screen = '';
        let randomSelectedUserId = '';
        let focusedVideo = '';

        //Get user video by default
        getAndSetUserStream();

        socket.on('connect', () => {
            //set socketId
            socketId = socket.io.engine.id;
            document.querySelector('video.local-video').id = `${socketId}-video`
            document.getElementById('randomNumber').innerText = randomNumber;
            // console.log("rtc.js socket on connect", socketId, room)

            socket.emit('subscribe', {
                room: room,
                socketId: socketId,
                username: username
            });


            socket.on('new user', (data) => {
                socket.emit('newUserStart', { to: data.socketId, sender: socketId, username: username });
                // console.log("rtc.js socket on connect on new user", socketId, room, data)
                pc.push(data.socketId);
                clientList.add(data.socketId)
                init(true, data.socketId, data.username);
            });



            socket.on('newUserStart', (data) => {
                pc.push(data.sender);
                clientList.add(data.sender)
                // console.log("rtc.js socket on connect on new user start", socketId, room, data)
                init(false, data.sender, data.username);
            });


            socket.on('ice candidates', async (data) => {
                // console.log("rtc.js socket on connect on icd candidates", socketId, room, data)
                await pc[data.sender].addIceCandidate(new RTCIceCandidate(data.candidate));
            });


            socket.on('sdp', async (data) => {
                // console.log("rtc.js socket on connect on sdp", socketId, room, data)
                if (data.description.type === 'offer') {
                    // console.log("rtc.js socket on connect on sdp in if", room, data.description.type, data.sender)
                    data.description ? await pc[data.sender].setRemoteDescription(new RTCSessionDescription(data.description)) : '';

                    h.getUserFullMedia().then(async (stream) => {
                        if (!document.querySelector('video.local-video').srcObject) {
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
                        // console.log("emit 'sdp': ", emitData);
                        socket.emit('sdp', emitData);
                    }).catch((e) => {
                        console.error(e);
                    });
                }
                else if (data.description.type === 'answer') {
                    // console.log("rtc.js socket on connect on sdp in if", room, data.description.type, data.sender)
                    await pc[data.sender].setRemoteDescription(new RTCSessionDescription(data.description));
                }
            });


            socket.on('chat', (data) => {
                // console.log("rtc.js socket on connect on chat", data)
                h.addChat(data, 'remote');
            });

            // 랜덤 유저 신호 핸들러
            socket.on('random', (data) => {
                const randomList = [...document.querySelectorAll("video")].map(e => e.id);
                try {
                    if (randomList.contain(randomSelectedUserId)) {
                        // console.log("rtc.js socket on random ", data)
                        MicroModal.show('random-user-modal');
                        randomSelectedUserId = data.choice;
                        document.getElementById(`${randomSelectedUserId}-video`).classList.add("center_video");
                        setTimeout(() => {
                            document.querySelector("#boom-sound").play()
                        }, 1100);
                    } else {
                        MicroModal.close('random-user-modal');
                    }
                } catch (e) {
                    console.error(e);
                    MicroModal.close('random-user-modal');
                }
            })
        });

        // 랜덤 유저 신호 보내기
        document.getElementById('random').addEventListener('click', (e) => {
            const randomList = [...document.querySelectorAll("video")].map(e => e.id);
            const choice = randomList[Math.floor(Math.random() * randomList.length)]
            let data = {
                room: room,
                sender: username,
                choice: choice
            }
            document.getElementById('choice').innerText = `발표자:${choice}`
            socket.emit('random', data)
        });

        // 랜덤 유저 모달 닫기 및 유저 비디오 원위치
        document.getElementById("random-user-modal").addEventListener("click", (event) => {
            document.getElementById(`${randomSelectedUserId}-video`).classList.remove("center_video");
            MicroModal.close("random-user-modal");
        });

        // 비디오 클릭 시 가운데로 이동
        const focusedVideoContainer = document.getElementById("focused-video-container");
        function addEventListenerClickFocusVideo(videoElement) {
            videoElement.addEventListener("click", (event) => {
                if (focusedVideo) {
                    let togetherDiv = focusedVideo.parentElement;
                    const peopleContainer = document.createElement("div");
                    peopleContainer.className = "row justify-content-center";
                    peopleContainer.appendChild(togetherDiv);

                    focusedVideo.classList.remove("focused-video")
                    document.getElementById("people").appendChild(peopleContainer);
                }
                // 새로운 focused video
                focusedVideo = event.target;
                let togetherDiv = focusedVideo.parentElement;
                const removeTargetDiv = togetherDiv.parentElement;
                focusedVideoContainer.appendChild(togetherDiv);
                focusedVideo.classList.add("focused-video")
                removeTargetDiv.remove();
            });
        }

        // 내 비디오에도 추가
        addEventListenerClickFocusVideo(document.querySelector('video.local-video'));
        // 내 유저네임 추가


        function getAndSetUserStream() {
            // console.log("run getAndSetUserStream()")
            h.getUserFullMedia().then((stream) => {
                //save my stream
                myStream = stream;
                // console.log("run getAndSetUserStream() in getUserFullMedia return stream", stream)
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
            // console.log("run sendmsg", data)
            //emit chat message
            socket.emit('chat', data);

            //add localchat
            h.addChat(data, 'local');
        }

        function init(createOffer, partnerName, name) {
            pc[partnerName] = new RTCPeerConnection(h.getIceServer());
            clientList[partnerName] = name
            clientIdNameObject.partnerName = {
                name, partnerName
            }
            // console.log("run init", createOffer, partnerName, name)
            if (screen && screen.getTracks().length) {
                // console.log("init if getTracks", pc[partnerName])
                screen.getTracks().forEach((track) => {
                    pc[partnerName].addTrack(track, screen);//should trigger negotiationneeded event
                });
            }
            else if (myStream) {
                // console.log("init else if myStream", pc[partnerName])
                myStream.getTracks().forEach((track) => {
                    pc[partnerName].addTrack(track, myStream);//should trigger negotiationneeded event
                });
            }
            else {
                // console.log("init else", pc[partnerName])
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
                // console.log("emit 'ice candidates' : ", data)
                candidate ? socket.emit('ice candidates', data) : "";
            };


            //add
            pc[partnerName].ontrack = (e) => {
                let str = e.streams[0];

                if (document.getElementById(`${partnerName}-video`)) {
                    document.getElementById(`${partnerName}-video`).srcObject = str;
                } else {
                    // row div
                    let rowDiv = document.createElement('div');
                    rowDiv.className = 'row justify-content-center';
                    rowDiv.id = partnerName;

                    // column div
                    let columnDiv = document.createElement('div');
                    columnDiv.className = "d-flex flex-column video-container justify-content-center align-items-center";

                    // 비디오 
                    let newVid = document.createElement('video');
                    newVid.id = `${partnerName}-video`;
                    newVid.srcObject = str;
                    newVid.autoplay = true;

                    // 유저네임
                    let nameDiv = document.createElement('div');
                    nameDiv.innerText = clientList[partnerName];
                    nameDiv.className = "text-center username-container";

                    columnDiv.appendChild(newVid);
                    columnDiv.appendChild(nameDiv);
                    rowDiv.appendChild(columnDiv);

                    //put div in main-section elem
                    document.getElementById('people').appendChild(rowDiv);

                    // 비디오 클릭시 전체화면 이벤트 등록
                    addEventListenerClickFocusVideo(document.getElementById(`${partnerName}-video`));
                }
            };


            pc[partnerName].onconnectionstatechange = (d) => {
                // console.log("init onconnectionstatechange1", pc[partnerName], d)
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
                // console.log("init onconnectionstatechange2", pc[partnerName], d)
                switch (pc[partnerName].signalingState) {
                    case 'closed':
                        // console.log("Signalling state is 'closed'");
                        h.closeVideo(partnerName);
                        break;
                }
            };
        }



        function shareScreen() {
            // console.log("run shareScreen")
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
            // console.log("run stopSharingScreen")
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
            // console.log("run broadcastNewTracks", stream, type, mirrorMode)
            h.setLocalStream(stream, mirrorMode);

            let track = type == 'audio' ? stream.getAudioTracks()[0] : stream.getVideoTracks()[0];

            for (let p in pc) {
                let pName = pc[p];
                if (typeof pc[pName] == 'object') {
                    h.replaceTrack(track, pc[pName]);
                }
            }
        }

        // //Chat textarea
        // document.getElementById('chat-input').addEventListener('keypress', (e) => {
        //     if (e.which === 13 && (e.target.value.trim())) {
        //         e.preventDefault();

        //         sendMsg(e.target.value);

        //         setTimeout(() => {
        //             e.target.value = '';
        //         }, 50);
        //     }
        // });


        //When the video icon is clicked
        document.getElementById('toggle-video').addEventListener('click', (e) => {
            e.preventDefault();
            var img1 = document.getElementById("img1");

            let elem = document.getElementById('toggle-video');

            if (myStream.getVideoTracks()[0].enabled) {
                img1.src = videoOn
                elem.setAttribute('title', 'Show Video');

                myStream.getVideoTracks()[0].enabled = false;
            }
            else {

                img1.src = videoOff
                elem.setAttribute('title', 'Hide Video');

                myStream.getVideoTracks()[0].enabled = true;
            }

            broadcastNewTracks(myStream, 'video');
        });


        //When the mute icon is clicked
        document.getElementById('toggle-mute').addEventListener('click', (e) => {
            e.preventDefault();
            var img2 = document.getElementById("img2");
            let elem = document.getElementById('toggle-mute');

            if (myStream.getAudioTracks()[0].enabled) {
                img2.src = audioOn

                elem.setAttribute('title', 'Mute');

                myStream.getAudioTracks()[0].enabled = false;
            }
            else {
                img2.src = audioOff

                elem.setAttribute('title', 'Unmute');

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
        document.getElementById('local-name').innerText = username;
    }
});
