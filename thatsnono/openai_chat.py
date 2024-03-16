from openai import OpenAI


def chat(text):
    client = OpenAI()

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            # {"role": "system", "content": "너는 도움을 주는 AI야, 그리고 나는 전달하는 문장에서 개인정보를 익명화해서 전달할거야. 예를 들면"
            #                               "\"안녕하세요 저는 홍길동입니다.\"를 \"안녕하세요 저는 이름(0)입니다.\"로 바꿔서 전달할거야. 다른 조직이나 위치도 마찬가지야"
            #                               "하지만 무조건 모든 개인정보를 익명화하지는 않을거야. 그러므로 내가 뒤에 (0)붙인것만 익명화된거야."
            #                               "너는 이 사실을 미리 알고 있어야 해. 그래야 내가 전달하는 문장을 이해할 수 있어"},
            {"role": "system", "content": "너는 도움을 주는 AI야, 내가 전달하는 이름(0)이나 위치(0) 같은거를 너의 응답에 사용할 때 뒤에 괄호붙여서 그대로 보내줘"},
            {"role": "user", "content": text},
        ],
        temperature=0
    )

    return response.choices[0].message.content


# main
if __name__ == "__main__":
    import os, val

    os.environ['OPENAI_API_KEY'] = val.OPENAI_API_KEY

    text = "안녕하세요"
    print(chat(text))
