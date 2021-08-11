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
        history.pushState({}, '', '/')
        window.location.replace(roomLink);
    });
});
