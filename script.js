
let active_document = document
let start_time = 0
const Status = Object.freeze({
    IDLE: Symbol("idle"),
    TRACKING: Symbol("tracking")
});
let current_progress = Status.IDLE

// update the current time
// TODO: this need to be optimize as even value unchange will call
function updateCurrentTime() {
    const now = new Date()
    const time_string = now.toLocaleTimeString();
    updateBigUITime(time_string);

    // find the time difference
    if (current_progress == Status.TRACKING) {
        const time_diff = now - start_time;
        const time_diff_string = new Date(time_diff).toLocaleTimeString('en-GB', {
            timeZone: 'UTC',
            hour12: false
        });

        document.getElementById("big-ui-time-diff").innerText = time_diff_string;
    }

    requestAnimationFrame(updateCurrentTime);
}
updateCurrentTime();

// show the time in big-ui
function updateBigUITime(time_string) {
    let big_ui_time = active_document.getElementById("big-ui-time");
    big_ui_time.innerText = time_string;
}

// big-ui for picture in picture mode
// ref: https://developer.chrome.com/docs/web-platform/document-picture-in-picture
async function openPip() {
    const big_ui = active_document.getElementById("big-ui");

    // init window
    const pip_window = await window.documentPictureInPicture.requestWindow({
        width: 500,
        height: 150,
    });

    // set the active document to be
    active_document = pip_window.document;

    // copy stylesheet
    [...document.styleSheets].forEach((styleSheet) => {
        try {
            const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
            const style = document.createElement('style');

            style.textContent = cssRules;
            pip_window.document.head.appendChild(style);
        } catch (e) {
            const link = document.createElement('link');

            link.rel = 'stylesheet';
            link.type = styleSheet.type;
            link.media = styleSheet.media;
            link.href = styleSheet.href;
            pip_window.document.head.appendChild(link);
        }
    });

    // show pip
    pip_window.document.body.append(big_ui);

    // pip back to document when close
    pip_window.addEventListener("pagehide", (event) => {
        active_document = document;
        const container = active_document.body;
        const big_ui = event.target.querySelector("#big-ui");
        container.append(big_ui);
    });
}
active_document.getElementById("pip").addEventListener("click", () => {
    openPip()
})

// start the record time 
document.getElementById("start-button").addEventListener("click", (event) => {
    if (current_progress == Status.IDLE && document.getElementById("task-title").value) {
        const now = new Date();
        start_time = now;
        current_progress = Status.TRACKING;
        active_document.getElementById("big-ui-time-start").innerText = now.toLocaleTimeString();
        active_document.getElementById("big-ui-task").innerText = document.getElementById("task-title").value;
    }

})