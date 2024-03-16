import {DOMAIN, PORT, URL, logMsg} from "./commons.js";

function l(m) {
    console.log(m);
}

function text() {
    return document.getElementById("userInput");
}

function sendBtn() {
    return document.getElementById("sendBtn");
}

function checkBtn() {
    return document.getElementById("checkBtn");
}

function sendImgBtn() {
    return document.getElementById("sendImageBtn");
}

// fecth로 analyze_entities 호출 (POST)
async function analyze_entities(text) {
    let data = {
        "text": text
    }
    let response = await _fetch("analyze_entities", data)
    let entities = response['entities']

    // console.log("before entities: ", entities)
    // entity start 기준 정렬
    entities.sort(function (a, b) {
        return a.start - b.start;
    });
    // console.log("after entities: ", entities)
    return entities
}

// fecth로 /chat 호출 (POST)
async function chat(text) {
    let data = {
        "text": text
    }
    const response = await _fetch("chat", data)
    return response['text']
}

// fecth로 /blur_faces 호출 (POST)
// img는 base64 인코딩된 이미지
async function blur_faces(img, format) {
    let data = {
        "img": img,
        "format": format
    }
    const response = await _fetch("blur_faces", data)
    return response['blurred-img']
}

// fecth로 /blur_objs 호출 (POST)
// img는 base64 인코딩된 이미지
async function blur_objs(img, format, objs) {
    let data = {
        "img": img,
        "format": format,
        "objs": objs
    }
    const response = await _fetch("blur_objs", data)
    return response['blurred-img']
}


// async function _fetch(task, data) {
//     // let url = `${URL}/${task}`
//     const response = await fetch(`/${task}`, {
//         method: "POST",
//         body: JSON.stringify(data),
//         headers: {
//             'Content-Type': 'application/json'
//         }
//     })
//     return await response.json();
// }

async function _fetch(task, data) {
    const url = `/${task}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log(responseData);
        return responseData
    } catch (error) {
        console.error('Error:', error);
    }
}

/*
entities = [
{
    "type": entity.type_.name,
    "content": content,
    "start": start,
    "end": end,
    "probability": probability
}, ...
]

엔티티를 각각 가져와서 start, end에 해당하는 부분을 highlight(background-color: yellow) 해준다.
 */
function highlightEntities(text, entities, privates) {
    let result = "";
    let lastEnd = 0;

    for (let entity of entities) {
        // 만약 entity type이 privates에 포함안되있으면 하이라이트 하지 않는다.
        if (!privates.includes(entity.type)) {
            continue
        }
        const start = entity.start;
        const end = entity.end;

        // 엔티티 시작 전까지의 텍스트를 추가
        result += text.substring(lastEnd, start);
        // 엔티티를 감싸는 span 태그 추가
        result += `<span style="background-color: #FF0000">${text.substring(start, end)}</span>`;
        // 다음 시작 위치 갱신
        lastEnd = end;
    }
    // 마지막 엔티티 이후의 텍스트를 추가
    result += text.substring(lastEnd);
    return result;
}

function setSendBtnDisable(toggle) {
    sendBtn().disabled = toggle;
}


/*
이름 -> 홍길동(1), 홍길동(2)
전화번호 -> 010-1234-5678
이메일 -> gildong@naver.com
위치 ->

 */
let origin2trash = {}
let trashDateCount = {
    "LOCATION": 0,
    "PERSON": 0,
    "ORGANIZATION": 0,
}
let preAnonymizedText = ""

function initlets() {
    origin2trash = {}
    trashDateCount = {
        "LOCATION": 0,
        "PERSON": 0,
        "ORGANIZATION": 0,
    }
    preAnonymizedText = ""
}

function getTrashData(type) {
    switch (type) {
        case "LOCATION":
            return `위치(${trashDateCount.LOCATION++})`
        case "PERSON":
            return `이름(${trashDateCount.PERSON++})`
        case "ORGANIZATION":
            return `조직(${trashDateCount.ORGANIZATION++})`
    }
}

// function anonymizeEntities(text, privates, entities) {
//     // 엔티티에서 privates 리스테에 있는 타입들만 trashData로 바꾸고, 원본데이터는 origin2trash에 매핑해서 저장한다. (나중에 복구할 수 있도록)
//     // 예시: privates = ["LOCATION", "PERSON"]
//
//     let result = "";
//     let start = 0;
//     let end = 0;
//     for (let entity of entities) {
//         if (privates.includes(entity.type)) {
//             // trashdata 생성
//             let trashData = trashData(entity.type)
//             // origin2trash에 매핑
//             origin2trash[entity.content] = trashData
//
//             // 단어를 trashdata로 바꾸기
//             start = entity.start;
//             end = entity.end;
//             result += text.substring(0, start);
//             // 하이라이트 필요없음
//             result += trashData;
//             text = text.substring(end);
//         }
//     }
//     return result;
// }

function anonymizeEntities(text, privates, entities) {
    let result = "";
    let lastEnd = 0;

    for (let entity of entities) {
        if (!privates.includes(entity.type)) {
            console.log("not private", entity.type)
            continue
        }

        const start = entity.start;
        const end = entity.end;
        console.log('entity.type: ', entity.type)
        console.log('entity.content: ', entity.content)

        // 엔티티 시작 전까지의 텍스트를 추가
        result += text.substring(lastEnd, start);
        // 엔티티를 감싸는 span 태그 추가
        // let origin = text.substring(start, end)
        // trashdata 생성
        let trashData = getTrashData(entity.type)
        // origin2trash에 매핑
        origin2trash[entity.content] = trashData
        result += trashData

        // 다음 시작 위치 갱신
        lastEnd = end;
    }

    // 마지막 엔티티 이후의 텍스트를 추가
    result += text.substring(lastEnd);
    l("result: ", result)
    return result;
}

// function sendMsg() {
//     // 보내기전에 anonymizeEntities를 호출해서 origin2trash를 업데이트한다.
//     let entities = analyze_entities(text());
//     let anonymizedText = anonymizeEntities(text(), privates, entities)
// }


// document 로드됬을 떄
document.addEventListener("DOMContentLoaded", onLoad)

function onLoad() {
    sendBtn().addEventListener("click", onSendBtnClick)
    // checkBtn().addEventListener("click", onCheckBtnClick)
    // sendImgBtn().addEventListener("click", onSendImgBtnClick)
    document.getElementById("revealBtn").addEventListener("click", onRevealBtnClick)
    document.getElementById("recoverBtn").addEventListener("click", onRecoverBtnClick)
}

function levelElem() {
    return document.getElementById("level")
}

async function onSendBtnClick() {
    let value = text()
    let textValue = value.value

    let entities = await analyze_entities(textValue)
    let highlightenText = highlightEntities(textValue, entities, getSelectedText())
    // console.log('highlightenText: ', highlightenText)
    text().innerHTML = highlightenText
    // console.log('text().innerHTML: ', text().innerHTML)
    logMsg(highlightenText, "right")

    // 익명화
    console.log('textValue: ', textValue)
    let anonymizedText = anonymizeEntities(textValue, getSelectedText(), entities)
    console.log("anonymizedText", anonymizedText)

    preAnonymizedText = anonymizedText

    // chat 호출
    let res = await chat(anonymizedText)

    logMsg(res, "left")
    l(res)

    // 입력칸 초기화
    value.value = ""

    // level 설정
    // origin2trash 개수가 1개이면 = A, 2개이면 = B, 3개이면 = C
    let len = Object.keys(origin2trash).length
    switch (len) {
        case 1:
            levelElem().innerHTML = "A"
            break
        case 2:
            levelElem().innerHTML = "B"
            break
        case 3:
            levelElem().innerHTML = "C"
            break
        default:
            levelElem().innerHTML = "D"
    }
}


// async function onCheckBtnClick() {
//     let value = text().value
//     let entities = await analyze_entities(value)
//     let highlightenText = highlightEntities(value, entities)
//     text().innerHTML = highlightenText
//
//     // 익명화
//     let privates = ["PERSON"]
//     let anonymizedText = anonymizeEntities(value, privates, entities)
//     l("anonymizedText", anonymizedText)
// }

function onSendImgBtnClick() {

}

function revealText() {
    element.innerHTML = "Text has changed!";
    // background-color 초록색으로 변경
    element.style.backgroundColor = "#00FF00";
}

function getSelectedText() {
    let selectedText = [];

    // Get all checkboxes within the "textboxes" div
    let checkboxes = document.querySelectorAll('#textboxes input[type="checkbox"]:checked');

    // Iterate over the selected checkboxes and push their labels into the array
    checkboxes.forEach(function (checkbox) {
        let label = checkbox.nextElementSibling.innerText;
        selectedText.push(label);
    });

    // Log or use the selected text array as needed
    console.log(selectedText);
    return selectedText
}


function getSelectedImg() {
    let selectedImg = [];

    // Get all checkboxes within the "textboxes" div
    let checkboxes = document.querySelectorAll('#imgboxes input[type="checkbox"]:checked');

    // Iterate over the selected checkboxes and push their labels into the array
    checkboxes.forEach(function (checkbox) {
        let label = checkbox.nextElementSibling.innerText;
        selectedImg.push(label);
    });

    // Log or use the selected text array as needed
    console.log(selectedImg);
    return selectedImg
}

export function revealEntities(element) {
    let messageText = element.querySelector('p').innerText;
    console.log("p: ", messageText);

    // 익명화된 글로 변경
    p.innerText = preAnonymizedText
}


// 이미지
// 버튼 요소와 파일 입력 요소를 가져옵니다.
const fileInput = document.getElementById('fileInput');

// 버튼을 클릭할 때 파일 입력(input) 요소를 클릭합니다.
sendImgBtn().addEventListener('click', () => fileInput.click());

// 파일이 선택되면 해당 파일을 업로드합니다.
fileInput.addEventListener('change', handleFileSelect, false);

function handleFileSelect(event) {
    const file = event.target.files[0]; // 선택한 파일
    // 파일 포맷 추출
    const fileName = file.name;
    const fileFormat = fileName.split('.')[1].toLowerCase();

    const formData = new FormData();
    formData.append('file', file);

    // 서버로 파일을 업로드합니다.
    if (file) {
        // FileReader를 사용하여 이미지 파일을 읽어들임
        const reader = new FileReader();

        async function onImgLoad() {
            // filename과 fileFormat을 서버로 출력
            console.log("filename: ", fileName)
            console.log("fileFormat: ", fileFormat)

            let listToBlur = getSelectedImg()
            let imgData = reader.result

            // 얼굴이 포함되어 있으면 먼저 얼굴 블러 처리
            if (listToBlur.includes("face")) {
                // 얼굴 블러
                imgData = await blur_faces(imgData, fileFormat)
                // listToBlur에서 face 제거
                listToBlur = listToBlur.filter(e => e !== "face")
            }

            // 나머지 객체 블러
            // 만약 listToBlur에 아무것도 없으면 그냥 imgData를 그대로 사용
            if (listToBlur.length > 0) {
                imgData = await blur_objs(imgData, fileFormat, listToBlur)
            }

            // 이미지 로그
            logImage(imgData, "right");
        }

        reader.onloadend = onImgLoad
        reader.readAsDataURL(file); // 이미지를 데이터 URL로 읽어옴
    } else {
        alert('이미지를 선택하세요.');
    }
}

export function logImage(img) {
    let imgElement = document.createElement('img');
    imgElement.src = img; // 이미지 URL 설정
    imgElement.style.maxWidth = '50%'; // 대화 메세지 div 너비의 50%까지만 허용
    const tagHTML = imgElement.outerHTML;
    logMsg(tagHTML, "right");
}

function trash2origin(text) {
    // value을 text에서 찾아서 key값으로 바꾼다.
    for (let key in origin2trash) {
        text = text.replace(origin2trash[key], key)
    }
    return text
}

function getLastIncomingMsg() {
    var msgHistory = document.getElementById('msglist');
    var incomingMsgs = msgHistory.getElementsByClassName('incoming_msg');

    // Get the last incoming_msg element
    var lastIncomingMsg = incomingMsgs[incomingMsgs.length - 1];
    return lastIncomingMsg
}

// Function to get the last outgoing_msg element
function getLastOutgoingMsg() {
    var msgHistory = document.getElementById('msglist');
    var outgoingMsgs = msgHistory.getElementsByClassName('outgoing_msg');

    // Get the last outgoing_msg element
    var lastOutgoingMsg = outgoingMsgs[outgoingMsgs.length - 1];
    return lastOutgoingMsg
}

function onRevealBtnClick() {
    // 마지막 outgoing_msg에는 revealText()를 대입
    let lastOutgoingMsg = getLastOutgoingMsg()
    let template = `<div class="outgoing_msg" onclick="revealEntities(this)">
      <div class="sent_msg">
        <p>${preAnonymizedText}</p>
        <span class="time_date"> 11:01 AM    |    June 9</span> </div>
    </div>`
    lastOutgoingMsg.innerHTML = template
}

function onRecoverBtnClick() {
    // 마지막 ingoing_msg에는 trash2origin()을 대입
    let lastIncomingMsg = getLastIncomingMsg()
    lastIncomingMsg.innerHTML = trash2origin(lastIncomingMsg.innerHTML)
}