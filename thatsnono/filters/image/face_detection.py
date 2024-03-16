import base64
import json
from io import BytesIO

import cv2
import numpy as np
import urllib3
from PIL import Image

import val



def face_locs(img):
    """
    얼굴 위치를 찾아주는 함수
    :param img: 이미지 (base64 형식)

    """
    openApiURL = "http://aiopen.etri.re.kr:8000/FaceDeID"
    accessKey = val.ETRI_ACCESS_KEY
    type = "1"  # 얼굴 비식별화 기능 "1"로 설정
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

    # 얼굴 위치 리스트
    locs = []
    # 얼굴 위치 리스트에 얼굴 위치 추가
    for face in json.loads(response.data.decode('utf-8'))['return_object']['results']:
        locs.append((face['x'], face['y'], face['width'], face['height']))
    return locs
