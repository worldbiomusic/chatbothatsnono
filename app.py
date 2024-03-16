import os
from flask import Flask, send_file, request, jsonify
from flask_sslify import SSLify  # SSL 적용을 위한 모듈

import val
from thatsnono.filters.image.blur import raw_to_base64, blur
from thatsnono.filters.image.face_detection import face_locs
from thatsnono.filters.image.object_detection import detect_objs, filter_objs
from thatsnono.filters.text.ner import analyze_entities, extract_entities
from thatsnono.openai_chat import chat

# import os

app = Flask(__name__)


@app.route('/')
def index():
    return send_file('index.html')


@app.route('/test', methods=['POST'])
def on_test():
    data = request.get_json()
    print(f"/test: {data}")

    user_msg = data['text']
    msg = 'test'
    response = {"text": msg}
    return jsonify(response), 200

@app.route('/chat', methods=['POST'])
def on_chat():
    data = request.get_json()
    print(f"/chat: {data}")

    user_msg = data['text']
    msg = chat(user_msg)
    response = {"text": msg}
    return jsonify(response), 200


@app.route('/analyze_entities', methods=['POST'])
def on_analyze_entities():
    data = request.get_json()
    print(f"/analyze_entities: {data}")

    text = data['text']
    r = analyze_entities(text)
    extracted_entities = extract_entities(text, r.entities)
    response = {"entities": extracted_entities}
    print(response)
    return jsonify(response), 200


@app.route('/blur_faces', methods=['POST'])
def on_blur_faces():
    """
    img는 base64로 인코딩된 이미지
    :return:
    """
    data = request.get_json()
    img = data['img']
    format = data['format']

    # img_base64 = raw_to_base64(img)
    locs = face_locs(img)
    result = blur(locs, img, format)
    response = {"blurred-img": result}
    return jsonify(response), 200


@app.route('/blur_objs', methods=['POST'])
def on_blur_objs():
    """
    img는 base64로 인코딩된 이미지
    :return:
    """
    data = request.get_json()
    img = data['img']
    format = data['format']
    objs = data['objs']  # 블러처리 할 객체들ㄷ

    print(f"img: {img[:40]}")
    print(f"objs: {objs}")

    # img_base64 = raw_to_base64(img)
    locs = detect_objs(img, format)
    locs_to_blur = filter_objs(locs, objs)
    result = blur(locs_to_blur, img, format)

    response = {"blurred-img": result}
    return jsonify(response), 200


def setup():
    # 구글 API 키 설정
    # os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = val.GOOGLE_CLOUD_API_KEY
    # openai API 키 설정
    os.environ['OPENAI_API_KEY'] = val.OPENAI_API_KEY
    pass
def setup_ssl():
    ssl_home = '/etc/letsencrypt/live/kisia-hackathon.r-e.kr/'
    global ssl_fullchain
    ssl_fullchain = ssl_home + 'fullchain.pem'
    global ssl_privkey
    ssl_privkey = ssl_home + 'privkey.pem'

    # SSL 적용
    return SSLify(app)

# 메인
if __name__ == "__main__":
    print("서버 시작")

    # 설정
    setup()
    setup_ssl()

    # 서버 시작
    app.run(debug=True, host='0.0.0.0', port=val.PORT)

    print("서버 종료")
