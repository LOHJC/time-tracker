
// update the current time

function updateCurrentTime() {
    const now = new Date()
    const time_string = now.toLocaleTimeString()
    document.getElementById("current-time").innerText = time_string
    updateBigUITime(time_string);

    requestAnimationFrame(updateCurrentTime)
}
updateCurrentTime()

// show the time in big-ui
function updateBigUITime(time_string) {
    let big_ui_time = document.getElementById("big-ui-time")
    big_ui_time.innerText = time_string
}
