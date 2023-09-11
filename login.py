import requests
import getpass
import tabulate

# Funzione per la registrazione
def register():
    username = input("Inserisci il nome utente: ")
    password = getpass.getpass("Inserisci la password: ")

    data = {
        "username": username,
        "password": password
    }

    response = requests.post("http://localhost:3000/register", json=data)

    if response.status_code == 201:
        print("Registrazione effettuata con successo!")
        # Ottieni il token dalla risposta
        token = response.json()["token"]
        db_name, user_request = get_db_and_request()
        chat(token, db_name, user_request)
    elif response.status_code == 409:
        print("Utente già esistente. Effettua l'accesso invece.")
        login()
    else:
        print("Errore durante la registrazione")

# Funzione per l'accesso
def login():
    username = input("Inserisci il nome utente: ")
    password = getpass.getpass("Inserisci la password: ")

    data = {
        "username": username,
        "password": password
    }

    response = requests.post("http://localhost:3000/login", json=data)

    if response.status_code == 200:
        token = response.json()["token"]
        print(f"Accesso effettuato con successo. Token: {token}")
        db_name, user_request = get_db_and_request()
        chat(token, db_name, user_request)
    elif response.status_code == 401:
        print("Credenziali non valide. Riprova.")
        login()
    else:
        print("Errore durante l'accesso")

# Funzione per richiedere il "Nome Database" e la "Richiesta"
def get_db_and_request():
    db_name = input("Inserisci il Nome Database: ")
    user_request = input("Inserisci la Richiesta: ")
    return db_name, user_request

# Funzione per chiamare /chat
def chat(token, db_name, user_request):
    chat_data = {"nomeDb": db_name, "richiesta": user_request}
    chat_response = requests.post("http://localhost:3000/chat", headers={"x-access-token": token}, json=chat_data)
    if chat_response.status_code == 200:
        print("Chiamata a /chat effettuata con successo!")
        print("Risposta:")
        #print(chat_response.json())
        list_of_dicts = [item for sublist in chat_response.json() for item in sublist]
        format_and_print_response(list_of_dicts)  # Stampare il contenuto della risposta
    else:
        print("Errore durante la chiamata a /chat")

def format_and_print_response(response_data):
    # Verifica se ci sono dati nella risposta
    if not response_data:
        print("Nessun dato presente nella risposta.")
    else:
        # Assumiamo che ci sia almeno un dizionario nella lista
        first_dict = response_data[0]

        # Estrai dinamicamente le intestazioni (headers) dal primo dizionario
        headers = list(first_dict.keys())

        # Formatta i dati in una lista di liste per tabulate
        table_data = [[entry[header] for header in headers] for entry in response_data]

        # Formatta e stampa la tabella
        table = tabulate.tabulate(table_data, headers, tablefmt="pretty")
        print(table)

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
