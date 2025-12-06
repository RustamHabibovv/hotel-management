-- create database for the system
-- tables are created by the django models, this is mainly for documntary reasons

CREATE TABLE hotel (
    id_hotel SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    number_of_rooms INTEGER,
    check_in_time INTEGER,
    check_out_time INTEGER
);

CREATE TABLE user (
    id_user SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    registered_payment_method VARCHAR(255),
    email_address VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50)
);

CREATE TABLE user_history (
    id_user_history SERIAL PRIMARY KEY,
    date_of_registration DATE NOT NULL,
    number_of_reservations INTEGER DEFAULT 0,
    fk_user_id INTEGER UNIQUE NOT NULL,
    FOREIGN KEY (fk_user_id) REFERENCES app_user(id_user)
);

CREATE TABLE worker (
    id_worker SERIAL PRIMARY KEY,
    name VARCHAR(255),
    surname VARCHAR(255),
    contracts VARCHAR(255),
    jobs VARCHAR(255),
    contact_info VARCHAR(255),
    fk_hotel_id INTEGER NOT NULL,
    FOREIGN KEY (fk_hotel_id) REFERENCES hotel(id_hotel)
);

CREATE TABLE reservation (
    id_reservation SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    hour INTEGER,
    number_of_guests INTEGER,
    price FLOAT,
    duration FLOAT,
    fk_user_history_id INTEGER NOT NULL,
    fk_user_id INTEGER NOT NULL,
    FOREIGN KEY (fk_user_history_id) REFERENCES user_history(id_user_history),
    FOREIGN KEY (fk_user_id) REFERENCES app_user(id_user)
);

CREATE TABLE room (
    id_room SERIAL PRIMARY KEY,
    number INTEGER NOT NULL,
    amenities VARCHAR(255),
    available BOOLEAN DEFAULT TRUE,
    maintenance BOOLEAN DEFAULT FALSE,
    scenery VARCHAR(255),
    fk_hotel_id INTEGER NOT NULL,
    FOREIGN KEY (fk_hotel_id) REFERENCES hotel(id_hotel)
);

CREATE TABLE reservation_room (
    id SERIAL PRIMARY KEY,
    fk_reservation_id INTEGER NOT NULL,
    fk_room_id INTEGER NOT NULL,
    FOREIGN KEY (fk_reservation_id) REFERENCES reservation(id_reservation),
    FOREIGN KEY (fk_room_id) REFERENCES room(id_room)
);

CREATE TABLE special_room_requests (
    id_special_requests SERIAL PRIMARY KEY,
    smoker BOOLEAN,
    pets BOOLEAN,
    baby BOOLEAN,
    disabled_access BOOLEAN,
    other VARCHAR(255),
    fk_reservation_id INTEGER NOT NULL,
    FOREIGN KEY (fk_reservation_id) REFERENCES reservation(id_reservation)
);

CREATE TABLE bill (
    id_bill SERIAL PRIMARY KEY,
    name VARCHAR(255),
    amount FLOAT,
    room INTEGER,
    due_date DATE,
    taxes FLOAT,
    status VARCHAR(50) DEFAULT 'Unpaid',
    fk_reservation_id INTEGER NOT NULL,
    FOREIGN KEY (fk_reservation_id) REFERENCES reservation(id_reservation)
);

CREATE TABLE payment (
    id_payment SERIAL PRIMARY KEY,
    amount FLOAT NOT NULL,
    state BOOLEAN DEFAULT FALSE,
    type VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    fk_bill_id INTEGER NOT NULL,
    FOREIGN KEY (fk_bill_id) REFERENCES bill(id_bill)
);
