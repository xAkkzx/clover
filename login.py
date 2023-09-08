import getpass
import requests
import json

import requests

def chiamaApi(token):
    url = 'http://localhost:3000/security/authentication'  # Replace with your desired URL
    try:
        # Create headers with the token
        headers = {
            'Authorization': f'Bearer {token}'
        }
        # Send a GET request to the URL with the token in the headers
        response = requests.get(url, headers=headers)
        # Check the response status code
        if response.status_code == 200:
            # Request was successful, print and process the response
            # print('GET request was successful')
            # print('Response data:', response.text)
            data = json.loads(response.text)
            # print(data["message"])
        else:
            # Request failed with a non-200 status code, handle the error
            print('GET request failed with status code:', response.status_code)
            print('Response text:', response.text)

    except requests.exceptions.RequestException as e:
        # An error occurred during the request, handle the exception
        print('An error occurred during the request:', e)

# Define the URL for the POST request
url = 'http://localhost:3000/security/login'

user = input("Username: ")
psw = getpass.getpass("Password: ")
# Define the JSON payload
payload = {
    "username": user,
    "password": psw
}

# Convert the payload dictionary to a JSON string
payload_str = json.dumps(payload)
a = False
count = 5
try:
    while(not a and count != 1):
        # Make the POST request
        response = requests.post(url, data=payload_str, headers={"Content-Type": "application/json"})

        # Check the response status code
        if response.status_code == 200:
            a = True
            # print('POST request was successful')
            # print('Response data:', response.json())

            # Save the response to a file (authKey.txt)
            with open('authKey.txt', 'w') as file:
                file.write(response.text)
            # print(response.text)
            data = json.loads(response.text)
            token = data["token"]
            # print(token)
            # print("Benvenuto")
            chiamaApi(token)

        else:
            # print('POST request failed with status code:', response.status_code)
            # print('Response text:', response.text)
            count -= 1
            print("Credenziali errate", count, "tentativi rimasti")
            user = input("Username: ")
            psw = getpass.getpass("Password: ")
            # Define the JSON payload
            payload = {
                "username": user,
                "password": psw
            }

            # Convert the payload dictionary to a JSON string
            payload_str = json.dumps(payload)

except requests.exceptions.RequestException as e:
    print('An error occurred during the request:', e)
