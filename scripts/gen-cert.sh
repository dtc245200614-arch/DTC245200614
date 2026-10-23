#!/bin/sh
# Generates a self-signed certificate into nginx/certs
cd "$(dirname "$0")/../nginx/certs" || exit 1
openssl req -x509 -nodes -newkey rsa:2048 -days 365 -keyout selfsigned.key -out selfsigned.crt \
  -subj "/C=VN/O=ExpenseTracker/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
chmod 644 selfsigned.key selfsigned.crt
