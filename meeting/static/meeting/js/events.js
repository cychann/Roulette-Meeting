import h from './helpers.js';


window.addEventListener('load', () => {

    //When the chat icon is clicked
    document.getElementById('toggle-chat-pane').addEventListener('click', (e) => {
        console.log("toggle-chat-pane")
        // const chatbox = document.getElementById('chatbox');
        // const people = document.getElementById('people');


        // console.log(chatbox.style.display);
        // if (chatbox.classList.contains("d-none")) {
        //     console.log("True, none을 없앱니다.");
        //     chatbox.classList.remove("d-none");
        //     people.classList.add("d-none");
        // }
        // else {
        //     console.log("False, none을 붙입니다.");
        //     chatbox.classList.add("d-none");
        //     people.classList.remove("d-none");
        // }
        // console.log(chatbox.style.display);

        // //remove the 'New' badge on chat icon (if any) once chat is opened.
        // setTimeout(() => {
        //     if (!chatbox.classList.contains("d-none")) {
        //         h.toggleChatNotificationBadge();
        //     }
        // }, 300);
    });

    // document.addEventListener('click', (e) => {
    //     if (e.target && e.target.classList.contains('expand-remote-video')) {
    //         h.maximiseStream(e);
    //     }

    //     else if (e.target && e.target.classList.contains('mute-remote-mic')) {
    //         h.singleStreamToggleMute(e);
    //     }
    // });
});
