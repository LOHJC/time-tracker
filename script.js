
let active_document = document;
let start_time = 0;
let end_time = 0;
const Status = Object.freeze({
    IDLE: Symbol("idle"),
    TRACKING: Symbol("tracking")
});
let current_progress = Status.IDLE;
let current_task = "";
let current_comments = [];
let current_time_string = ""
let current_time_diff_string = "00:00:00";

// update the current time
let last_second = -1;
function updateCurrentTime() {
    requestAnimationFrame(updateCurrentTime);

    const now = new Date();
    const current_second = now.getSeconds();

    if (current_second === last_second) {
        return;
    }
    last_second = current_second; // Don't forget to update this!

    current_time_string = now.toLocaleTimeString();
    if (current_progress == Status.TRACKING) {
        const time_diff = Math.round((now - start_time) / 1000) * 1000;
        current_time_diff_string = new Date(time_diff).toLocaleTimeString('en-GB', {
            timeZone: 'UTC',
            hour12: false
        });
    }
    updateBigUITime();
}
updateCurrentTime();

// show the time in big-ui
function updateBigUITime(big_time_string, small_time_string) {
    if (current_progress == Status.IDLE) {
        active_document.getElementById("big-ui-time").innerText = current_time_string;
        active_document.getElementById("big-ui-small-time").innerText = current_time_diff_string;
    }
    else if (current_progress == Status.TRACKING) {
        active_document.getElementById("big-ui-time").innerText = current_time_diff_string;
        active_document.getElementById("big-ui-small-time").innerText = current_time_string;

    }
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

    document.getElementById("pip-message").hidden = false;

    // pip back to document when close
    pip_window.addEventListener("pagehide", (event) => {
        active_document = document;
        const container = active_document.getElementById("big-ui-container");
        const big_ui = event.target.querySelector("#big-ui");
        container.append(big_ui);


        document.getElementById("pip-message").hidden = true;
    });
}
active_document.getElementById("pip").addEventListener("click", () => {
    openPip()
})

// update big-ui
function updateBigUI() {
    // update bg color
    let bg_color = ""
    if (current_progress == Status.IDLE) {
        bg_color = "#f2ebcc"
    }

    else if (current_progress == Status.TRACKING) {
        bg_color = "#c8ceee"
    }
    active_document.getElementById("big-ui").style.backgroundColor = bg_color;

    // update the task
    if (current_progress == Status.TRACKING) {
        active_document.getElementById("big-ui-task").hidden = true;
        active_document.getElementById("big-ui-current-task").hidden = false;
        active_document.getElementById("big-ui-end-button").hidden = false;
        active_document.getElementById("big-ui-add-comment-button").hidden = false;

        current_task = active_document.getElementById("big-ui-task-title").value;
    }
    else if (current_progress == Status.IDLE) {
        active_document.getElementById("big-ui-task").hidden = false;
        active_document.getElementById("big-ui-current-task").hidden = true;
        active_document.getElementById("big-ui-end-button").hidden = true;
        active_document.getElementById("big-ui-add-comment-button").hidden = true;

        current_task = "";
        current_comments = [];
        current_time_diff_string = "00:00:00";

        active_document.getElementById("big-ui-task-title").value = current_task;
    }
    active_document.getElementById("big-ui-current-task").innerText = current_task;

    // update start time
    let start_time_string = "";
    if (start_time != 0) {
        start_time_string = start_time.toLocaleTimeString();
    }

    // update end time
    let end_time_string = ""
    if (end_time != 0) {
        end_time_string = end_time.toLocaleTimeString();
    }

    updateBigUITime();

}

// start the task 
document.getElementById("start-button").addEventListener("click", (event) => {
    if (current_progress == Status.IDLE && active_document.getElementById("big-ui-task-title").value) {
        start_time = new Date();
        end_time = 0;
        current_progress = Status.TRACKING;
        updateBigUI();
    }
})

// end the task 
active_document.getElementById("big-ui-end-button").addEventListener("click", (event) => {
    if (current_progress == Status.TRACKING) {
        end_time = new Date();
        current_progress = Status.IDLE;
        updateTaskDone(); // need to make sure task done before update ui
        updateBigUI();
    }
})

// update the task done table
function updateTaskDone() {
    const table = document.getElementById("task-done-table");

    const new_row = table.insertRow(-1);

    const start_time_col = new_row.insertCell(0);
    const end_time_col = new_row.insertCell(1);
    const title_col = new_row.insertCell(2);
    const comments_col = new_row.insertCell(3);
    const time_diff_col = new_row.insertCell(4);

    start_time_col.textContent = start_time.toLocaleTimeString();
    end_time_col.textContent = end_time.toLocaleTimeString();
    title_col.textContent = current_task;

    const commentString = current_comments.map(item => {
        const time = item.time.toLocaleTimeString();
        return `${time}\n${item.comment}\n`;
    }).join("\n");
    comments_col.textContent = commentString;
    time_diff_col.textContent = current_time_diff_string;
}

// update comments
function updateComments(comment) {
    if (current_progress == Status.TRACKING) {
        const now = new Date();
        current_comments.push({ "time": now, "comment": comment });
    }
}
function showCommentUI() {
    if (current_progress == Status.TRACKING) {
        active_document.getElementById("big-ui-comment-box").hidden = false;
    }
}
active_document.getElementById("big-ui-add-comment-button").addEventListener("click", (event) => {
    showCommentUI();
})
active_document.getElementById("big-ui-done-comment-button").addEventListener("click", (event) => {
    updateComments(active_document.getElementById("big-ui-comment-textarea").value);
    active_document.getElementById("big-ui-comment-textarea").value = "";
    active_document.getElementById("big-ui-comment-box").hidden = true;
})