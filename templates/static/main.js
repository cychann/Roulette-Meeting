function generateRandomString() {
    const crypto = window.crypto || window.msCrypto;
    let array = new Uint32Array(1);
    console.log("run generateRandomString()", crypto, array)
    return crypto.getRandomValues(array);
}

window.addEventListener('load', () => {
    // 새로운 회의 만들기 모달 띄우기
    document.getElementById("start-new-meeting-modal-btn").addEventListener("click", (event) => {
        console.log("click", event.target)
        MicroModal.show('new-meeting-modal')
    });

    // 회의 코드 입력 모달 띄우기
    document.getElementById("enter-meeting-modal-btn").addEventListener("click", (event) => {
        console.log("click", event.target)
        MicroModal.show('enter-meeting-modal')
    });

    // 새로운 회의 시작
    document.getElementById("start-new-meeting-btn").addEventListener("click", (event) => {
        event.preventDefault();
        console.log("click", event.target)
        const form = document.getElementById('new-meeting-form');

        // 폼이 valid 하지 않았을 시 report
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // form이 valid 할 시 새 회의를 만들고 사용자를 redirect
        const meetingName = document.getElementById("new-meeting-name").value;
        const username = document.getElementById("username-for-new-meeting").value;

        // 유저의 이름을 session storage에 저장해두고 나중에 재접속하면 기억하도록 함
        const meetingId = `${meetingName.trim().replace(' ', '_')}_${generateRandomString()}`.trim();
        sessionStorage.setItem(meetingId, JSON.stringify({ 'username': username }));

        // 미팅 룸의 링크를 생성하고 사용자를 redirect
        const roomLink = `${meetingRoomBaseUrl}?room=${meetingId}`;
        history.pushState({}, '', '/')
        window.location.replace(roomLink);
    });

    // 기존 회의 참가
    document.getElementById("enter-meeting-btn").addEventListener("click", (event) => {
        event.preventDefault();
        console.log("click", event.target)
        const form = document.getElementById('enter-meeting-form');

        // 폼이 valid 하지 않았을 시 report
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // form이 valid 할 시 새 회의를 만들고 사용자를 redirect
        const meetingName = document.getElementById("enter-meeting-name").value;
        const username = document.getElementById("username-for-enter-meeting").value;

        // 유저의 이름을 session storage에 저장해두고 나중에 재접속하면 기억하도록 함
        sessionStorage.setItem(meetingName, JSON.stringify({ 'username': username }));

        // 미팅 룸의 링크를 생성하고 사용자를 redirect
        const roomLink = `${meetingRoomBaseUrl}?room=${meetingName.trim()} `;
        history.pushState({}, '', '/')
        window.location.replace(roomLink);
    });
});
