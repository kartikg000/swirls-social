import requests

url = "http://localhost:8000/register/child"
data = {
    "name": "testchild",
    "age": 10,
    "email": "testchild@example.com",
    "password": "1234"
}
response = requests.post(url, data=data)
print(response.status_code)
print(response.text)
