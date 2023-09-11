create table pokemon(
    id_pokemon int(3) primary key  not null auto_increment,
    nome varchar(20) not null,
    id_tipo int(2) not null,
    id_percorso int(2) not null,
    id_allenatore int(4) not null,
    id_pokeball int(2) not null
);

create table allenatore(
    id_allenatore int(4) primary key not null auto_increment,
    nome varchar(20) not null,
    id_nazione int(3) not null,
);

create table percorso(
    id_percorso int(2) primary key not null auto_increment,
    nome varchar(20) not null,
    id_citta int(2) not null 
);

create table tipo(
    id_tipo int(2) primary key not null auto_increment,
    nome varchar(20) not null
);

create table pokeball(
    id_pokeball int(2) primary key not null auto_increment,
    nome varchar(20) not null,
    descrizione varchar(50) not null
);

create table citta(
    id_citta int(2) primary key not null auto_increment,
    nome varchar(20) not null,
    descrizione varchar(50) not null
);

create table nazione(
    id_nazione int(3) primary key not null auto_increment,
    nome varchar(20) not null
);

create table medaglia(
    id_medaglia int(1) primary key not null auto_increment,
    nome varchar(20) not null,
    id_palestra int(1) not null
);

create table palestra(
    id_palestra int(1) primary key not null auto_increment,
    nome varchar(20) not null,
    id_capopalestra int(1) not null,
    id_citta int(2) not null
);

create table capopalestra(
    id_capopalestra int(1) primary key not null auto_increment,
    nome varchar(20) not null
);

create table medagliexallenatore(
    id_medxall int(3) primary key not null auto_increment,
    id_allenatore int(4) not null,
    id_medaglia int(1) not null
);

alter table pokemon
add foreign key (id_tipo) references tipo(id_tipo);
alter table pokemon
add foreign key (id_percorso) references percorso(id_percorso);
alter table pokemon
add foreign key (id_allenatore) references allenatore(id_allenatore);
alter table pokemon
add foreign key (id_pokeball) references pokeball(id_pokeball);

alter table allenatore
add foreign key (id_nazione) references nazione(id_nazione);

alter table percorso
add foreign key (id_citta) references citta(id_citta);

alter table medaglia
add foreign key (id_palestra) references palestra(id_palestra);

alter table palestra
add foreign key (id_capopalestra) references capopalestra(id_capopalestra);
alter table palestra
add foreign key (id_citta) references citta(id_citta);

alter table medagliexallenatore
add foreign key (id_allenatore) references allenatore(id_allenatore);
alter table medagliexallenatore
add foreign key (id_medaglia) references medaglia(id_medaglia);