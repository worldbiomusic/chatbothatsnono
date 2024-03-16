import urllib3
import json
import base64
import val
from thatsnono.filters.image.blur import base64_to_cv2, blur, raw_to_base64, remove_base64_header


def detect_objs(img, type):
    # 만약 base64 헤더가 붙어있다면 제거 (ETRI 객체검출 API는 헤더를 제거해야함)
    img = remove_base64_header(img)

    print("detect_objs: ", img[:30])

    openApiURL = "http://aiopen.etri.re.kr:8000/ObjectDetect"
    accessKey = val.ETRI_ACCESS_KEY

    # file = open(imageFilePath, "rb")
    # imageContents = base64.b64encode(file.read()).decode("utf8")
    # file.close()

    requestJson = {
        "argument": {
            "type": type,
            "file": img
        }
    }

    http = urllib3.PoolManager()
    response = http.request(
        "POST",
        openApiURL,
        headers={"Content-Type": "application/json; charset=UTF-8", "Authorization": accessKey},
        body=json.dumps(requestJson)
    )

    # Bytes를 문자열로 변환
    json_str = response.data.decode('utf-8')

    # JSON 파싱
    data = json.loads(json_str)

    # "data" 항목 추출
    data_list = data['return_object']['data']

    # 각 항목에서 필요한 정보 추출하여 리스트에 담기
    result_list = []
    for item in data_list:
        result_list.append({
            'class': item['class'],
            'x': item['x'],
            'y': item['y'],
            'width': item['width'],
            'height': item['height']
        })

    return result_list

def filter_objs(locs, objs):
    """
    locs에서 objs에 해당하는 객체의 위치정보([x,y,width,height])를 추출합니다.
    """
    locs_to_blur = []
    for loc in locs:
        if loc['class'] in objs:
            locs_to_blur.append((int(loc['x']), int(loc['y']), int(loc['width']), int(loc['height'])))
    return locs_to_blur


# main
if __name__ == "__main__":
    img = 'by.jpg'
    format = 'jpg'
    img_base64 = raw_to_base64(img)
    locs = detect_objs(img_base64, format)
    objs = ['person', 'car']
    locs_to_blur = filter_objs(locs, objs)
    blur(locs_to_blur, img_base64, format)
