from google.cloud import language_v2


def analyze_entities(text):
    """
    문장에서 객체명들을 인식한다
    :param text: 문장
    :return:
    """
    client = language_v2.LanguageServiceClient()
    document_type_in_plain_text = language_v2.Document.Type.PLAIN_TEXT

    document = {
        "content": text,
        "type_": document_type_in_plain_text,
        "language_code": "ko",
    }

    response = client.analyze_entities(
        request={"document": document, "encoding_type": language_v2.EncodingType.UTF8}
    )

    # for entity in response.entities:
    #     print(f"Representative name for the entity: {entity.name}")
    #
    #     # Get entity type, e.g. PERSON, LOCATION, ADDRESS, NUMBER, et al.
    #     # See https://cloud.google.com/natural-language/docs/reference/rest/v2/Entity#type.
    #     print(f"Entity type: {language_v2.Entity.Type(entity.type_).name}")
    #
    #     # Loop over the metadata associated with entity.
    #     # Some entity types may have additional metadata, e.g. ADDRESS entities
    #     # may have metadata for the address street_name, postal_code, et al.
    #     for metadata_name, metadata_value in entity.metadata.items():
    #         print(f"{metadata_name}: {metadata_value}")
    #
    #     # Loop over the mentions of this entity in the input document.
    #     # The API currently supports proper noun mentions.
    #     for mention in entity.mentions:
    #         print(f"Mention text: {mention.text.content}")
    #
    #         # Get the mention type, e.g. PROPER for proper noun
    #         print(f"Mention type: {language_v2.EntityMention.Type(mention.type_).name}")
    #
    #         # Get the probability score associated with the first mention of the entity in the (0, 1.0] range.
    #         print(f"Probability score: {mention.probability}")
    #
    # # Get the language of the text, which will be the same as
    # # the language specified in the request or, if not specified,
    # # the automatically-detected language.
    # print(f"Language of the text: {response.language_code}")
    return response

def extract_entities(text, entities):
    extracted_entities = []
    for entity in entities:
        content = entity.mentions[0].text.content
        begin_offset = entity.mentions[0].text.begin_offset
        probability = entity.mentions[0].probability
        start, end = find_char_range(text, content, begin_offset)
        data = {
            "type": entity.type_.name,
            "content": content,
            "start": start,
            "end": end,
            "probability": probability
        }
        extracted_entities.append(data)
    return extracted_entities

def count_bytes(input_string, encoding='utf-8'):
    # 문자열을 UTF-8로 인코딩
    encoded_string = input_string.encode(encoding)

    # 인코딩된 문자열의 바이트 수 반환
    return len(encoded_string)


def encode(text, encoding='utf-8'):
    return text.encode(encoding)


def decode(text, encoding='utf-8'):
    return text.decode(encoding)


def find_char_range(input_str, target_char, target_byte_position):
    # UTF-8로 인코딩
    utf8_bytes = input_str.encode('utf-8')
    # 시작 위치 이전의 부분을 추출
    before_start = utf8_bytes[:target_byte_position]
    # 시작 위치부터 끝까지의 부분을 추출
    after_start = utf8_bytes[target_byte_position:]
    # 시작 위치부터 끝까지에서 첫 번째로 나오는 다음 문자의 위치 계산
    end_byte_position = target_byte_position + after_start.find(target_char.encode('utf-8'))
    # 부분을 다시 디코딩하여 시작과 끝의 범위를 계산
    start_char_position = len(before_start.decode('utf-8'))
    # end_char_position = len(utf8_bytes[:end_byte_position].decode('utf-8'))
    end_char_position = start_char_position + len(target_char)
    return start_char_position, end_char_position


# 메인
if __name__ == "__main__":
    # import os, val
    # os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = val.GOOGLE_CLOUD_API_KEY
    text = "안녕 나는 이정한이고 현재 대한민국 경기도 화성시 향남읍에 살고 있어. 나는 기독교이고, 내 전화번호는 010-0101-0101이야. 나의 성별은 남자야."
    r = analyze_entities(text)
    print(extract_entities(r.entities))


# 영어 1byte
# 숫자 1byte
# 한글 3byte
