import os
from os.path import join, abspath

# 설정값
PORT = 31313
DOMAIN = "http://tr33.r-e.kr"


# 루트
ROOT_DIR = os.path.dirname(abspath(__file__))

# api 키
GOOGLE_CLOUD_API_KEY_FILE = join(ROOT_DIR, r"test/hhhh-gcp-api-key.json")
GOOGLE_CLOUD_API_KEY = open(GOOGLE_CLOUD_API_KEY_FILE).read()
ETRI_ACCESS_KEY_FILE = join(ROOT_DIR, r"ETRI_api_key.txt")
ETRI_ACCESS_KEY = open(ETRI_ACCESS_KEY_FILE).read()
OPENAI_API_KEY_FILE = join(ROOT_DIR, r"openai_api_key.txt")
OPENAI_API_KEY = open(OPENAI_API_KEY_FILE).read()
