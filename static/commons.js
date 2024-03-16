import {revealEntities} from "./index.js";

// export const DOMAIN = "tr33.r-e.kr"
export const DOMAIN = "kisia-hackathon.r-e.kr"
// export const DOMAIN = "localhost"
export const PORT = 31313
export const URL = `http://${DOMAIN}:${PORT}`


export function logMsg(msg, loc) {
    let template = ""
    if (loc === "left") {
        template = `<div class="incoming_msg" >
          <div class="incoming_msg_img"> </div>
          <div class="received_msg">
            <div class="received_withd_msg">
              <p>${msg}</p>
              <span class="time_date"> 11:01 AM    |    June 9</span></div>
          </div>
        </div>`
    } else if (loc === "right") {
        template = `<div class="outgoing_msg" onclick="revealEntities(this)">
      <div class="sent_msg">
        <p>${msg}</p>
        <span class="time_date"> 11:01 AM    |    June 9</span> </div>
    </div>`
    }

    document.getElementById("msglist").innerHTML += template
}


