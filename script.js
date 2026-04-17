
let active_document = document

// update the current time
function updateCurrentTime() {
    const now = new Date()
    const time_string = now.toLocaleTimeString()
    if (active_document.getElementById("current-time")) {
        active_document.getElementById("current-time").innerText = time_string
    }
    updateBigUITime(time_string);

    requestAnimationFrame(updateCurrentTime)
}
updateCurrentTime()

// show the time in big-ui
function updateBigUITime(time_string) {
    let big_ui_time = active_document.getElementById("big-ui-time")
    big_ui_time.innerText = time_string
}

// big-ui for picture in picture mode
// ref: https://developer.chrome.com/docs/web-platform/document-picture-in-picture
async function openPip() {
    const big_ui = active_document.getElementById("big-ui")

    // init window
    const pip_window = await window.documentPictureInPicture.requestWindow({
        width: 500,
        height: 150 + 16, // the 16 is 8+8 body padding
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
        active_document = document
        const container = active_document.body
        const big_ui = event.target.querySelector("#big-ui");
        container.append(big_ui);
    });
}
active_document.getElementById("pip").addEventListener("click", () => {
    openPip()
})