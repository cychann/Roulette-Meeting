function generateRandomString() {
    const crypto = window.crypto || window.msCrypto;
    let array = new Uint32Array(1);
    console.log("run generateRandomString()", crypto, array)
    return crypto.getRandomValues(array);
}

window.addEventListener('load', () => {
    document.getElementById("new-meeting-btn").addEventListener("click", () => {
        MicroModal.show('modal-1')
    });

    document.getElementById("start-new-meeting").addEventListener("click", (event) => {
        event.preventDefault();
        const form = document.getElementById('new-meeting-form');

        // 폼이 valid 하지 않았을 시 report
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // form이 valid 할 시 새 회의를 만들고 사용자를 redirect
        const meetingName = document.getElementById("meeting-name").value;
        const username = document.getElementById("username-for-meeting").value;

        // 유저의 이름을 session storage에 저장해두고 나중에 재접속하면 기억하도록 함
        sessionStorage.setItem('username', username);

        // 미팅 룸의 링크를 생성하고 사용자를 redirect
        const roomLink = `${meetingRoomBaseUrl}?room=${meetingName.trim().replace(' ', '_')}_${generateRandomString()}`;
        window.location.replace(roomLink);
    });

    document.getElementById('create-room').addEventListener('click', (e) => {
        e.preventDefault();

        let roomName = document.querySelector('#room-name').value;
        let yourName = document.querySelector('#your-name').value;

        if (roomName && yourName) {
            //remove error message, if any
            document.querySelector('#err-msg').innerHTML = "";

            //save the user's name in sessionStorage
            sessionStorage.setItem('username', yourName);

            //create room link
            let roomLink = `${location.href}?room=${roomName.trim().replace(' ', '_')}_${helpers.generateRandomString()}`;

            //show message with link to room
            document.querySelector('#room-created').innerHTML = `Room successfully created. Click <a href='${roomLink}'>here</a> to enter room. 
                Share the room link with your partners.`;

            //empty the values
            document.querySelector('#room-name').value = '';
            document.querySelector('#your-name').value = '';
        }

        else {
            document.querySelector('#err-msg').innerHTML = "All fields are required";
        }
    });


    //When the 'Enter room' button is clicked.
    document.getElementById('enter-room').addEventListener('click', (e) => {
        e.preventDefault();

        let name = document.querySelector('#username').value;

        if (name) {
            //remove error message, if any
            document.querySelector('#err-msg-username').innerHTML = "";

            //save the user's name in sessionStorage
            sessionStorage.setItem('username', name);

            //reload room
            location.reload();
        }

        else {
            document.querySelector('#err-msg-username').innerHTML = "Please input your name";
        }
    });


    document.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('expand-remote-video')) {
            helpers.maximiseStream(e);
        }

        else if (e.target && e.target.classList.contains('mute-remote-mic')) {
            helpers.singleStreamToggleMute(e);
        }
    });


    document.getElementById('closeModal').addEventListener('click', () => {
        helpers.toggleModal('recording-options-modal', false);
    });
});
