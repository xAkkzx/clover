import requests

# Funzione per la registrazione
def register():
    username = input("Inserisci il nome utente: ")
    password = input("Inserisci la password: ")

    data = {
        "username": username,
        "password": password
    }

    response = requests.post("http://localhost:3000/register", json=data)

    if response.status_code == 201:
        print("Registrazione effettuata con successo!")
        # Ottieni il token dalla risposta
        token = response.json()["token"]
        # Chiamata a /welcome con il token nell'header
        welcome_response = requests.post("http://localhost:3000/welcome", headers={"x-access-token": token})
        if welcome_response.status_code == 200:
            print("Benvenuto!")
        else:
            print("Errore durante l'accesso a /welcome")
    elif response.status_code == 409:
        print("Utente già esistente. Effettua l'accesso invece.")
    else:
        print("Errore durante la registrazione")

# Funzione per l'accesso
def login():
    username = input("Inserisci il nome utente: ")
    password = input("Inserisci la password: ")

    data = {
        "username": username,
        "password": password
    }

    response = requests.post("http://localhost:3000/login", json=data)

    if response.status_code == 200:
        token = response.json()["token"]
        print(f"Accesso effettuato con successo. Token: {token}")
        # Chiamata a /welcome con il token nell'header
        welcome_response = requests.post("http://localhost:3000/welcome", headers={"x-access-token": token})
        if welcome_response.status_code == 200:
            print("Benvenuto!")
        else:
            print("Errore durante l'accesso a /welcome")
    elif response.status_code == 401:
        print("Credenziali non valide. Riprova.")
    else:
        print("Errore durante l'accesso")

# Menu principale
while True:
    print("1. Registrati")
    print("2. Accedi")
    print("3. Esci")

    choice = input("Scegli un'opzione: ")

    if choice == "1":
        register()
    elif choice == "2":
        login()
    elif choice == "3":
        break
    else:
        print("Opzione non valida. Riprova.")
